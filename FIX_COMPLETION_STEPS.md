# 🔧 Steps to Fix Lesson Completion Tracking

## 1️⃣ First, Run the SQL Setup in Supabase
Go to your Supabase Dashboard → SQL Editor and run:
```sql
-- Just copy and paste the entire content of FIX_LESSON_COMPLETIONS.sql
```

## 2️⃣ Check Your Browser Console
When you complete the "True and False" lesson, look for these logs:
- `Calling complete_lesson RPC with: {lessonId: 'true-false'...}`
- `complete_lesson response: {data: {...}, error: null}`

## 3️⃣ Verify Data is Saved
Run this in Supabase SQL Editor:
```sql
-- See all your completions
SELECT * FROM public.lesson_completions 
WHERE user_id = auth.uid();

-- Check specifically for true-false
SELECT * FROM public.lesson_completions 
WHERE user_id = auth.uid() 
AND lesson_id = 'true-false';
```

## 4️⃣ Debug the Computer Science Page
When you go to `/courses/computer-science`, check console for:
- `Fetching completed lessons for user: [your-id]`
- `Fetch result: {data: [...], error: null}`
- `Completed lesson IDs: ['true-false', ...]`

## 5️⃣ Quick Manual Test
If the lesson isn't saving, manually complete it in Supabase:
```sql
-- This will complete the lesson for you
SELECT public.complete_lesson('true-false', 30, NULL);
```

Then refresh `/courses/computer-science` - it should show as complete.

## 🚨 Common Issues & Solutions:

### Issue: "function complete_lesson does not exist"
**Solution:** Run the `FIX_LESSON_COMPLETIONS.sql` script in Supabase

### Issue: Lesson completes but doesn't show in course page
**Solution:** The page might be caching. Try:
1. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. Navigate away and back
3. Check if the data exists in database first

### Issue: "relation lesson_completions does not exist"
**Solution:** The table wasn't created. Run the SQL setup script.

### Issue: No console logs appearing
**Solution:** Make sure you're logged in and the auth is working

## 📊 What Should Happen:

1. Complete "True and False" lesson
2. Console shows: `Lesson marked as completed locally`
3. You get +30 stardust (first time only)
4. Navigate back to `/courses/computer-science`
5. The lesson shows with a green checkmark
6. Progress bar updates

## 🔍 Extra Debugging:

Add this temporary debug code to see what's happening:

**In `/courses/computer-science/binary-logic/true-false/page.tsx`** after line 790:
```javascript
console.log('Complete lesson result:', result)
if (!result.success) {
  alert(`Failed to save: ${result.message}`)
}
```

**In `/courses/computer-science/page.tsx`** after line 305:
```javascript
console.log('Raw data from database:', data)
if (data?.length > 0) {
  alert(`Found ${data.length} completed lessons: ${data.map(d => d.lesson_id).join(', ')}`)
}
```

## ✅ Success Indicators:

- ✅ Stardust increases after first completion
- ✅ Console shows successful RPC calls
- ✅ Database has the completion record
- ✅ Course page shows green checkmark
- ✅ Progress percentage updates
- ✅ "Already completed" message on second attempt