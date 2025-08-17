-- Direct SQL to force delete the auth user and allow email re-registration

-- Step 1: Find the specific user by email
SELECT 
  id,
  email,
  raw_user_meta_data->>'account_deleted' as is_deleted
FROM auth.users 
WHERE email = 'YOUR_EMAIL_HERE';

-- Step 2: If you see your deleted user above, run this to permanently delete it:
-- Replace 'YOUR_EMAIL_HERE' with your actual email address

DELETE FROM auth.users 
WHERE email = 'YOUR_EMAIL_HERE' 
AND raw_user_meta_data->>'account_deleted' = 'true';

-- This will completely remove the user from Supabase auth system
-- allowing the email to be used for new registrations
