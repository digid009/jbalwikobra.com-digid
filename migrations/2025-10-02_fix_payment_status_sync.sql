-- Create atomic update function for order and payment status
-- This ensures both tables are updated together to prevent data inconsistency

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_order_and_payment_status(text, text, text, timestamptz, text, text, text, text, text);

-- Create the function with proper parameter types
CREATE OR REPLACE FUNCTION update_order_and_payment_status(
  p_invoice_id text DEFAULT NULL,
  p_external_id text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_paid_at timestamptz DEFAULT NULL,
  p_payment_channel text DEFAULT NULL,
  p_payer_email text DEFAULT NULL,
  p_invoice_url text DEFAULT NULL,
  p_currency text DEFAULT NULL,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  orders_updated_count integer := 0;
  payments_updated_count integer := 0;
  result jsonb;
BEGIN
  -- Start transaction
  BEGIN
    -- Update orders table first (by invoice_id if available, then by external_id)
    IF p_invoice_id IS NOT NULL THEN
      UPDATE orders 
      SET 
        status = p_status::order_status,
        paid_at = p_paid_at,
        payment_channel = p_payment_channel,
        payer_email = p_payer_email,
        xendit_invoice_url = p_invoice_url,
        xendit_invoice_id = p_invoice_id,
        currency = p_currency,
        expires_at = p_expires_at,
        updated_at = now()
      WHERE xendit_invoice_id = p_invoice_id;
      
      GET DIAGNOSTICS orders_updated_count = ROW_COUNT;
    END IF;
    
    -- Fallback: update by external_id if no orders were updated by invoice_id
    IF orders_updated_count = 0 AND p_external_id IS NOT NULL THEN
      UPDATE orders 
      SET 
        status = p_status::order_status,
        paid_at = p_paid_at,
        payment_channel = p_payment_channel,
        payer_email = p_payer_email,
        xendit_invoice_url = p_invoice_url,
        xendit_invoice_id = p_invoice_id,
        currency = p_currency,
        expires_at = p_expires_at,
        updated_at = now()
      WHERE client_external_id = p_external_id;
      
      GET DIAGNOSTICS orders_updated_count = ROW_COUNT;
    END IF;
    
    -- Update payments table (by external_id first, then by xendit_id)
    IF p_external_id IS NOT NULL THEN
      UPDATE payments 
      SET 
        status = UPPER(p_status),
        paid_at = CASE WHEN p_status IN ('paid', 'completed') THEN p_paid_at ELSE paid_at END,
        updated_at = now()
      WHERE external_id = p_external_id;
      
      GET DIAGNOSTICS payments_updated_count = ROW_COUNT;
    END IF;
    
    -- Also try updating by xendit_id if available and not already updated
    IF payments_updated_count = 0 AND p_invoice_id IS NOT NULL THEN
      UPDATE payments 
      SET 
        status = UPPER(p_status),
        paid_at = CASE WHEN p_status IN ('paid', 'completed') THEN p_paid_at ELSE paid_at END,
        updated_at = now()
      WHERE xendit_id = p_invoice_id;
      
      GET DIAGNOSTICS payments_updated_count = ROW_COUNT;
    END IF;
    
    -- Create result
    result := jsonb_build_object(
      'success', true,
      'orders_updated', orders_updated_count,
      'payments_updated', payments_updated_count,
      'message', format('Updated %s orders and %s payments', orders_updated_count, payments_updated_count)
    );
    
    -- Log the operation
    RAISE NOTICE 'Payment status update completed: orders=%, payments=%, status=%', 
      orders_updated_count, payments_updated_count, p_status;
    
    RETURN result;
    
  EXCEPTION WHEN OTHERS THEN
    -- If there's any error, rollback and return error info
    RAISE NOTICE 'Error in update_order_and_payment_status: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'orders_updated', 0,
      'payments_updated', 0
    );
  END;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION update_order_and_payment_status TO service_role;

-- Add comment
COMMENT ON FUNCTION update_order_and_payment_status IS 'Atomically update both orders and payments tables status to prevent data inconsistency';