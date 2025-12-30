/**
 * Debug endpoint to test Xendit Invoice API access
 * GET /api/xendit/debug-qris?id=<payment_id>
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id: paymentId } = req.query;

  if (!paymentId || typeof paymentId !== 'string') {
    return res.status(400).json({ error: 'Payment ID required' });
  }

  const logs: string[] = [];
  
  try {
    logs.push(`Payment ID: ${paymentId}`);
    logs.push(`Has XENDIT_SECRET_KEY: ${!!XENDIT_SECRET_KEY}`);
    
    if (!XENDIT_SECRET_KEY) {
      return res.status(500).json({ 
        error: 'XENDIT_SECRET_KEY not configured',
        logs 
      });
    }

    logs.push(`Key length: ${XENDIT_SECRET_KEY.length}`);
    logs.push(`Key prefix: ${XENDIT_SECRET_KEY.substring(0, 10)}...`);
    
    // Test Xendit API call
    const xenditUrl = `https://api.xendit.co/v2/invoices/${paymentId}`;
    const xenditAuth = Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64');
    
    logs.push(`Xendit URL: ${xenditUrl}`);
    logs.push(`Auth header (first 20 chars): Basic ${xenditAuth.substring(0, 20)}...`);
    
    logs.push('Making request to Xendit...');
    
    const xenditResponse = await fetch(xenditUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${xenditAuth}`,
        'Content-Type': 'application/json'
      }
    });
    
    logs.push(`Response status: ${xenditResponse.status}`);
    logs.push(`Response OK: ${xenditResponse.ok}`);
    
    const xenditData = await xenditResponse.json();
    
    if (!xenditResponse.ok) {
      logs.push(`Error from Xendit: ${JSON.stringify(xenditData)}`);
      return res.status(xenditResponse.status).json({
        error: 'Xendit API error',
        xendit_response: xenditData,
        logs
      });
    }
    
    logs.push(`Invoice ID: ${xenditData.id}`);
    logs.push(`Invoice status: ${xenditData.status}`);
    logs.push(`Payment methods: ${JSON.stringify(xenditData.payment_methods)}`);
    logs.push(`Has available_banks: ${!!xenditData.available_banks}`);
    
    if (xenditData.available_banks) {
      logs.push(`Number of banks: ${xenditData.available_banks.length}`);
      
      xenditData.available_banks.forEach((bank: any, idx: number) => {
        logs.push(`Bank ${idx + 1}: ${bank.bank_code}`);
        logs.push(`  Has bank_branch: ${!!bank.bank_branch}`);
        logs.push(`  Bank branch length: ${bank.bank_branch?.length || 0}`);
        if (bank.bank_branch) {
          logs.push(`  Bank branch preview: ${bank.bank_branch.substring(0, 50)}...`);
        }
      });
      
      const qrisBank = xenditData.available_banks.find((bank: any) => 
        bank.bank_code === 'QRIS' || bank.bank_code === 'ID_SHOPEEPAY'
      );
      
      if (qrisBank) {
        logs.push('✅ QRIS bank found!');
        logs.push(`QR string present: ${!!qrisBank.bank_branch}`);
        if (qrisBank.bank_branch) {
          logs.push(`QR string length: ${qrisBank.bank_branch.length}`);
        }
      } else {
        logs.push('❌ QRIS bank NOT found');
      }
    } else {
      logs.push('❌ No available_banks in response');
    }
    
    return res.status(200).json({
      success: true,
      invoice: {
        id: xenditData.id,
        status: xenditData.status,
        amount: xenditData.amount,
        currency: xenditData.currency,
        payment_methods: xenditData.payment_methods,
        available_banks: xenditData.available_banks
      },
      logs
    });
    
  } catch (error) {
    logs.push(`Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return res.status(500).json({
      error: 'Internal error',
      message: error instanceof Error ? error.message : 'Unknown',
      logs
    });
  }
}
