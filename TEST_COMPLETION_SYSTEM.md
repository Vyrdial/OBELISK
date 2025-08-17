# Test Your Lesson Completion System

## Step 1: Check Browser Console
When you complete the "True and False" lesson, you should see these console logs:
- `Calling complete_lesson RPC with: {lessonId: 'true-false', stardustAmount: 30, userId: '...'}`
- `complete_lesson response: {data: {...}, error: null}`
- `Lesson marked as completed locally`

## Step 2: Run Quick Check in Supabase
Run the `QUICK_CHECK_COMPLETIONS.sql` script in Supabase SQL Editor.

You should see:
1. Your lesson completions in the first query
2. Specifically the 'true-false' lesson in the second query
3. Your user's completions in the third query

## Step 3: Manual Test
If nothing shows up, run the last query in the script:
```sql
SELECT public.complete_lesson('true-false', 30, NULL) as result;
```

This should return something like:
```json
{
  "success": true,
  "first_completion": true,
  "stardust_earned": 30,
  "total_stardust": [your_total],
  "message": "Lesson completed successfully!"
}
```

Or if already completed:
```json
{
  "success": true,
  "first_completion": false,
  "stardust_earned": 0,
  "total_stardust": [your_total],
  "message": "Lesson already completed"
}
```

## Step 4: Force Refresh
After confirming the data is in the database, go back to `/courses/computer-science` and:
1. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
2. The lesson should now show as completed

## If Still Not Working:

### Check for Errors:
1. **Function doesn't exist**: Run the `FIX_LESSON_COMPLETIONS.sql` script
2. **Permission denied**: Check RLS policies are enabled
3. **User not authenticated**: Make sure you're logged in

### Debug the Frontend:
Add this temporary code to `/courses/computer-science/page.tsx` after line 305:
```javascript
console.log('Fetched completed lessons:', data)
console.log('Mapped lesson IDs:', data.map(item => item.lesson_id))
```

This will show you exactly what's being fetched from the database.

## Common Issues:

1. **RLS Policies**: The user can only see their own completions
2. **Case Sensitivity**: Lesson IDs must match exactly ('true-false' not 'True-False')
3. **Timing**: The page might load before the completion is saved
4. **Cache**: Browser might be caching old data

## Quick Fix:
If you need to manually mark a lesson as complete for testing, run this in Supabase:
```sql
INSERT INTO public.lesson_completions (user_id, lesson_id, stardust_earned)
VALUES (auth.uid(), 'true-false', 30)
ON CONFLICT (user_id, lesson_id) DO NOTHING;