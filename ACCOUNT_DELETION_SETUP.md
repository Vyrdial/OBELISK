# Account Deletion Setup Guide

## Issue: Email Re-registration Problem

When users delete their accounts, the email remains "soft deleted" in Supabase auth, preventing re-registration with the same email address.

## Solutions

### Option 1: Proper Service Role Setup (Recommended)

1. **Get your Supabase Service Role Key:**
   - Go to your Supabase Dashboard
   - Navigate to Settings → API
   - Copy the `service_role` key (NOT the anon key)

2. **Add to your environment variables:**
   ```bash
   # Add to your .env.local file
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

With this setup, the delete API will properly remove auth users, allowing email re-registration.

### Option 2: Manual Cleanup (For Testing)

If you don't want to use the service role key, you can manually clean up deleted users:

1. **Run the cleanup SQL script in Supabase SQL Editor:**
   - File: `cleanup_deleted_users.sql`
   - First run the SELECT statement to see deleted users
   - Uncomment and run the DELETE statements to permanently remove them

2. **This will allow those email addresses to be used again**

### Option 3: Database Function (Alternative)

Create a PostgreSQL function in Supabase that can be called to clean up deleted users:

```sql
-- Run this in Supabase SQL Editor
CREATE OR REPLACE FUNCTION cleanup_deleted_users()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete auth users marked as deleted older than 24 hours
  DELETE FROM auth.users 
  WHERE raw_user_meta_data->>'account_deleted' = 'true'
  AND (raw_user_meta_data->>'deletion_timestamp')::timestamp < NOW() - INTERVAL '24 hours';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_deleted_users() TO authenticated;
```

Then call it from your API:
```typescript
await supabase.rpc('cleanup_deleted_users')
```

## Current Behavior

**Without Service Role Key:**
- User data is deleted from your tables
- Auth user is marked as deleted in metadata
- Email remains "soft deleted" and can't be reused

**With Service Role Key:**
- User data is deleted from your tables  
- Auth user is completely removed
- Email can be used for new registrations immediately

## Testing

1. **Create a test account** with a disposable email
2. **Delete the account** using the app
3. **Try to register again** with the same email
4. **Should work** if service role key is configured properly

## Security Notes

- Service role key has admin privileges - keep it secure
- Never expose service role key in client-side code
- Consider implementing additional validation before user deletion
- The manual cleanup script should only be used for testing

## Files Created

- `/src/app/api/delete-user/route.ts` - Improved deletion API
- `/cleanup_deleted_users.sql` - Manual cleanup script
- `/add_delete_policies.sql` - Database policies for deletion
- `ACCOUNT_DELETION_SETUP.md` - This setup guide