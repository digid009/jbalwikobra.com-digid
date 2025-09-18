-- Fix Woo-WA get_group_id method back to GET (but with body auth)
UPDATE whatsapp_providers 
SET settings = jsonb_set(
    settings,
    '{list_groups_method}',
    '"GET"'
)
WHERE name = 'woo-wa';
