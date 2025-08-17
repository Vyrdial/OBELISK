# URGENT: Fix Schema Cache Issue

The PostgREST schema cache is preventing the cosmetics system from working. Here are the steps to fix it:

## Option 1: Quick Fix in Supabase Dashboard (RECOMMENDED)

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Find the section called **"PostgREST"**
4. Click the **"Restart Server"** or **"Reload Schema"** button
5. Wait 30 seconds
6. Refresh your app and try equipping items again

## Option 2: Force Schema Reload via SQL

Run this in the SQL editor:

```sql
-- Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';

-- Alternative method
SELECT pg_notify('pgrst', 'reload schema');
```

## Option 3: Direct Database Access (Temporary Workaround)

If the above don't work, run this SQL to create a direct update function:

```sql
-- Create a function that bypasses PostgREST
CREATE OR REPLACE FUNCTION equip_cosmetic_direct(
  p_user_id UUID,
  p_item_id TEXT,
  p_item_type TEXT
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  IF p_item_type = 'singularity' THEN
    UPDATE profiles 
    SET equipped_singularity = p_item_id 
    WHERE user_id = p_user_id;
  ELSIF p_item_type IN ('effect', 'aura', 'auras', 'trail') THEN
    UPDATE profiles 
    SET equipped_effects = array_append(
      array_remove(COALESCE(equipped_effects, ARRAY[]::text[]), p_item_id), 
      p_item_id
    )
    WHERE user_id = p_user_id;
  ELSIF p_item_type = 'title' THEN
    UPDATE profiles 
    SET equipped_title = p_item_id 
    WHERE user_id = p_user_id;
  END IF;
  
  result = json_build_object('success', true);
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  result = json_build_object('success', false, 'error', SQLERRM);
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION equip_cosmetic_direct(UUID, TEXT, TEXT) TO authenticated;
```

## Option 4: Manual Column Check

Run this to verify columns exist:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('equipped_effects', 'equipped_singularity', 'equipped_title');
```

If columns are missing, run:

```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS equipped_singularity text DEFAULT 'classic-singularity',
ADD COLUMN IF NOT EXISTS equipped_effects text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS equipped_title text;
```

## Why This Happens

PostgREST caches the database schema for performance. When you add new columns, it doesn't automatically detect them until:
- The server is restarted
- A schema reload is triggered
- The cache expires (usually after 10 minutes)

## Need More Help?

If none of these work:
1. Try logging out and back in to your Supabase dashboard
2. Wait 10-15 minutes for the cache to expire naturally
3. Contact Supabase support with error code PGRST204