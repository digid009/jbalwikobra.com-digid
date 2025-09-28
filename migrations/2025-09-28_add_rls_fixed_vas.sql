-- Enable Row Level Security on fixed_virtual_accounts table
ALTER TABLE fixed_virtual_accounts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
-- This policy allows your backend APIs to access the table while blocking direct user access
CREATE POLICY "Allow service role full access" ON fixed_virtual_accounts
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- Optional: Create a read-only policy for authenticated users (if needed for admin features)
-- Uncomment this if you want authenticated users to view VA data in admin interfaces
/*
CREATE POLICY "Allow authenticated users to read" ON fixed_virtual_accounts
    FOR SELECT 
    TO authenticated 
    USING (true);
*/