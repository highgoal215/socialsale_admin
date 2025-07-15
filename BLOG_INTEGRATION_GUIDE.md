# Blog Frontend-Backend Integration Guide

This guide explains how the blog system is integrated between the frontend (React/TypeScript) and backend (Node.js/Express).

## 🏗️ Architecture Overview

```
Frontend (likes-admin)          Backend (likesio-backend)
├── React/TypeScript           ├── Node.js/Express
├── BlogDialog Component       ├── Blog Controller
├── BlogService               ├── Blog Routes
├── FileUpload Component      ├── Blog Models
└── Blog Page                 └── Cloudinary Integration
```

## 🔧 Backend Setup

### 1. Database Models

#### BlogPost Model (`models/BlogPost.js`)
```javascript
{
  title: String (required),
  slug: String (unique),
  excerpt: String (required),
  content: String (required),
  imageUrl: String (required),
  categoryId: String (required),
  published: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

#### BlogCategory Model (`models/BlogCategory.js`)
```javascript
{
  name: String (required),
  slug: String (unique),
  description: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 2. API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/blog` | Get all blog posts | Admin |
| GET | `/api/blog/published` | Get published posts | Public |
| GET | `/api/blog/:id` | Get single post | Public |
| POST | `/api/blog` | Create post | Admin |
| PUT | `/api/blog/:id` | Update post | Admin |
| DELETE | `/api/blog/:id` | Delete post | Admin |
| PUT | `/api/blog/:id/publish` | Toggle publish | Admin |
| POST | `/api/blog/upload` | Upload image | Admin |
| GET | `/api/blog/categories` | Get categories | Admin |
| POST | `/api/blog/categories` | Create category | Admin |
| PUT | `/api/blog/categories/:id` | Update category | Admin |
| DELETE | `/api/blog/categories/:id` | Delete category | Admin |

### 3. File Upload Configuration

- **Storage**: Cloudinary
- **File Size Limit**: 5MB
- **Supported Formats**: All image types
- **Field Names**: 
  - `image` for blog post creation/update
  - `banner` for image upload endpoint

## 🎨 Frontend Setup

### 1. Environment Variables

Create `.env` file in `likes-admin/`:
```env
VITE_BACKEND_URL=https://likes.io/api
```

### 2. Key Components

#### BlogService (`src/services/blog-service.ts`)
- Handles all API communication
- Manages file uploads with FormData
- Handles response structure `{ success: boolean, data: T }`

#### BlogDialog (`src/components/blog/BlogDialog.tsx`)
- Form for creating/editing posts
- Integrates FileUpload component
- Handles image upload before post creation

#### FileUpload (`src/components/ui/file-upload.tsx`)
- Drag & drop functionality
- Image preview
- File validation

### 3. State Management

```typescript
// Blog page state
const [posts, setPosts] = useState<BlogPost[]>([]);
const [categories, setCategories] = useState<BlogCategory[]>([]);
const [isLoading, setIsLoading] = useState(true);

// BlogDialog state
const [bannerImage, setBannerImage] = useState<File | null>(null);
const [isSubmitting, setIsSubmitting] = useState(false);
```

## 🔄 Data Flow

### Creating a Blog Post

1. **User Action**: Click "Create New Post"
2. **Frontend**: Opens BlogDialog
3. **User Input**: Fill form + upload image
4. **Image Upload**: 
   - File uploaded to `/api/blog/upload`
   - Returns Cloudinary URL
5. **Post Creation**: 
   - Form data + image URL sent to `/api/blog`
   - Returns created post
6. **UI Update**: Post list refreshed

### Editing a Blog Post

1. **User Action**: Click "Edit" on post
2. **Frontend**: Opens BlogDialog with existing data
3. **User Input**: Modify form + optionally upload new image
4. **Update Process**: Same as creation but PUT request
5. **UI Update**: Post list refreshed

## 🧪 Testing Integration

### 1. Backend Testing

```bash
# Start backend server
cd likesio-backend
npm start

# Seed database
node scripts/seed.js
```

### 2. Frontend Testing

```bash
# Start frontend
cd likes-admin
npm run dev

# Test integration
# Open browser console and run:
import { testBlogIntegration } from './src/utils/test-blog-integration';
testBlogIntegration();
```

### 3. Manual Testing Checklist

- [ ] Load blog page (should show posts)
- [ ] Load categories dropdown
- [ ] Create new post without image
- [ ] Create new post with image
- [ ] Edit existing post
- [ ] Delete post
- [ ] Toggle publish status
- [ ] Search posts
- [ ] Image upload preview

## 🐛 Common Issues & Solutions

### 1. CORS Errors
**Problem**: Frontend can't connect to backend
**Solution**: Ensure CORS is configured in backend:
```javascript
app.use(cors({
  origin: "*",
  credentials: true,
}));
```

### 2. Authentication Errors
**Problem**: 401 Unauthorized
**Solution**: 
- Check if admin token exists in localStorage
- Verify token is valid
- Ensure user has admin role

### 3. File Upload Issues
**Problem**: Image upload fails
**Solution**:
- Check file size (max 5MB)
- Verify file type is image
- Ensure Cloudinary credentials are set

### 4. Categories Not Loading
**Problem**: Categories dropdown is empty
**Solution**:
- Run seed script to create categories
- Check categories endpoint is working
- Verify API response structure

## 🔧 Configuration Files

### Backend Environment Variables
```env
MONGO_URI=mongodb://localhost:27017/likesio
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
```

### Frontend Environment Variables
```env
VITE_BACKEND_URL=https://likes.io/api
```

## 📊 API Response Format

All API responses follow this structure:
```typescript
{
  success: boolean;
  data: T;
  count?: number;
  error?: string;
}
```

## 🚀 Deployment Considerations

### Backend
- Ensure MongoDB is accessible
- Set up Cloudinary credentials
- Configure CORS for production domain
- Set up proper environment variables

### Frontend
- Update `VITE_BACKEND_URL` for production
- Build and deploy to hosting service
- Ensure HTTPS for file uploads

## 📝 Next Steps

1. **Add Category Management UI**
2. **Implement Blog Post Search**
3. **Add Pagination**
4. **Create Public Blog View**
5. **Add SEO Optimization**
6. **Implement Comments System**
7. **Add Analytics Tracking** 