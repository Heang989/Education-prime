# System Analysis & Development Plan

## Current System Architecture

### Backend Components:
1. ✅ **Lesson Model** - Stores lessons with vocabulary, linked to categories
2. ✅ **Lesson Controller** - CRUD operations with auto-matching to categories
3. ✅ **Lesson Routes** - API endpoints for lesson management
4. ✅ **Category Matching** - Automatic vocabulary matching from Categories table

### Frontend Components:
1. ✅ **Admin Dashboard** - Categories, Users, Teachers, Levels tabs
2. ✅ **Level Management** - Admin can manage lessons per level
3. ✅ **Lesson Management** - Full CRUD for lessons (admin only)
4. ✅ **Read-Only Lesson View** - User view without actions
5. ✅ **Redux Store** - Lessons slice for state management

---

## System Flow

### Admin Flow:
1. **Admin Dashboard** → **Levels Tab** → **Select Level** → **Manage Lessons**
2. **Create/Edit Lesson** → **Add Vocabulary** → **Auto-match with Categories** → **Save**
3. **View Lesson** → **Paper-like format** → **Edit/Delete vocabulary** → **Save changes**

### User Flow:
1. **Dashboard** → **Lessons Tab** → **Select Level** → **View Lessons**
2. **Click Lesson** → **Read-only view** → **Study vocabulary** (no actions)

---

## Key Features Implemented

### ✅ Backend API:
- `GET /api/lessons` - Get all lessons
- `GET /api/lessons/level/:level` - Get lessons by level
- `GET /api/lessons/:id` - Get single lesson
- `POST /api/lessons` - Create lesson (admin)
- `PUT /api/lessons/:id` - Update lesson (admin)
- `DELETE /api/lessons/:id` - Delete lesson (admin)

### ✅ Vocabulary Matching Logic:
- When creating/updating lesson, vocabulary is automatically matched with Categories table
- Match by Chinese name (case-insensitive)
- If match found: Fill English, Khmer, Phonetic from database
- If no match: Keep manual entry
- Store `categoryId` reference for linked words

### ✅ Admin Features:
- View all 8 levels
- Click level → See lessons for that level
- Create new lesson (1-6 per level)
- Edit lesson details and vocabulary
- Delete lesson
- Auto-match vocabulary with database
- Manual vocabulary entry if not in database
- Paper-like editing interface

### ✅ User Features (Read-Only):
- View all 8 levels
- Click level → See lessons
- Click lesson → Read-only view
- Paper-like display format
- No edit/delete buttons
- Clean study interface

---

## Next Development Steps

### Phase 1: Complete Integration (IMMEDIATE)
1. **Update User Dashboard** ✅
   - Add Lessons tab
   - Fetch lessons from API
   - Show read-only lesson view
   - Remove all action buttons

2. **Fix LevelManagement Component**
   - Complete lesson form functionality
   - Fix vocabulary editing
   - Ensure proper save/update flow

### Phase 2: Data Management (HIGH PRIORITY)
1. **Bulk Vocabulary Import**
   - Import vocabulary from CSV/Excel
   - Batch match with categories
   - Validate data before import

2. **Vocabulary Management**
   - Search vocabulary across all lessons
   - Replace vocabulary in multiple lessons
   - Export vocabulary lists

### Phase 3: User Experience (MEDIUM PRIORITY)
1. **Lesson Progress Tracking**
   - Track which lessons user has viewed
   - Mark lessons as completed
   - Show progress percentage

2. **Search & Filter**
   - Search lessons by title/vocabulary
   - Filter by level
   - Filter by difficulty

3. **Print/Export**
   - Print lesson as PDF
   - Export vocabulary to CSV
   - Share lesson link

### Phase 4: Advanced Features (LOW PRIORITY)
1. **Lesson Analytics**
   - Most viewed lessons
   - Vocabulary difficulty analysis
   - User engagement metrics

2. **Content Recommendations**
   - Suggest next lesson based on progress
   - Recommend related vocabulary
   - Personalized learning path

3. **Multi-language Support**
   - Support additional languages
   - Dynamic language switching
   - Translation management

---

## Database Schema

### Lesson Collection:
```javascript
{
  level: Number (1-8),
  lessonNumber: Number (1-6),
  title: String (Chinese),
  titleEnglish: String,
  subtitle: String (Chinese),
  subtitleEnglish: String,
  vocabulary: [{
    chinese: String,
    pinyin: String,
    english: String,
    khmer: String,
    phonetic: String,
    categoryId: ObjectId (reference to Category)
  }],
  createdBy: ObjectId (reference to User),
  createdAt: Date,
  updatedAt: Date
}
```

### Vocabulary Matching:
- **Primary Match**: Chinese name (case-insensitive)
- **Fallback**: Manual entry if no match
- **Reference**: Store `categoryId` for linked words
- **Auto-fill**: English, Khmer, Phonetic from matched category

---

## API Endpoints Summary

### Public/User Endpoints:
- `GET /api/lessons` - List all lessons (authenticated)
- `GET /api/lessons/level/:level` - Get lessons by level
- `GET /api/lessons/:id` - Get single lesson

### Admin Only Endpoints:
- `POST /api/lessons` - Create lesson
- `PUT /api/lessons/:id` - Update lesson
- `DELETE /api/lessons/:id` - Delete lesson

---

## Security Considerations

1. **Authentication**: All endpoints require authentication
2. **Authorization**: Admin-only for create/update/delete
3. **Validation**: Input validation on all fields
4. **Error Handling**: Proper error messages
5. **Data Integrity**: Unique constraint on level + lessonNumber

---

## Testing Checklist

### Backend:
- [ ] Test lesson creation
- [ ] Test vocabulary matching
- [ ] Test lesson update
- [ ] Test lesson deletion
- [ ] Test level filtering
- [ ] Test validation errors

### Frontend:
- [ ] Test admin lesson management
- [ ] Test user read-only view
- [ ] Test vocabulary matching UI
- [ ] Test form validation
- [ ] Test navigation flow
- [ ] Test responsive design

---

## Performance Considerations

1. **Indexing**: Level and lessonNumber are indexed
2. **Caching**: Consider caching lessons by level
3. **Pagination**: For large vocabulary lists
4. **Lazy Loading**: Load lessons on demand

---

## Future Enhancements

1. **Lesson Templates**: Pre-built lesson templates
2. **Vocabulary Bank**: Shared vocabulary repository
3. **Version Control**: Track lesson changes
4. **Collaboration**: Multiple admins editing
5. **Analytics Dashboard**: Usage statistics
6. **Mobile App**: Native mobile support

---

## Current Status

✅ **Completed:**
- Backend API (Model, Controller, Routes)
- Redux store integration
- Admin Level Management component
- Read-only lesson view component
- Vocabulary auto-matching logic

🔄 **In Progress:**
- User dashboard lessons integration
- LevelManagement component refinement

⏳ **Pending:**
- User dashboard lessons tab
- Lesson progress tracking
- Print/export features

---

## Notes

- Vocabulary words are matched from Categories table by Chinese name
- If word not found in database, admin can manually enter all fields
- User view is completely read-only (no actions)
- Admin has full CRUD capabilities
- Paper-like format for both admin and user views
- Each level can have up to 6 lessons
- Lessons are organized by level (1-8) and lesson number (1-6)
