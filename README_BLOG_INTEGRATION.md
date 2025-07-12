# Blog Integration - Quick Start

This guide helps you quickly set up and test the blog integration between frontend and backend.

## 🚀 Quick Setup

### 1. Backend Setup
```bash
cd likesio-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB and Cloudinary credentials

# Start the server
npm start

# In another terminal, seed the database
node scripts/seed.js
```

### 2. Frontend Setup
```bash
cd likes-admin

# Install dependencies
npm install

# Set up environment variables
echo "VITE_BACKEND_URL=http://localhost:5005/api" > .env

# Start the development server
npm run dev
```

## 🧪 Testing the Integration

### Option 1: Manual Testing
1. Open `http://localhost:5173` in your browser
2. Login with admin credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Navigate to the Blog page
4. Try creating, editing, and deleting blog posts

### Option 2: Automated Testing
```bash
# In the likes-admin directory
node scripts/test-integration.js
```

## ✅ What Should Work

- ✅ Load blog posts from database
- ✅ Load categories from database
- ✅ Create new blog posts
- ✅ Upload banner images
- ✅ Edit existing posts
- ✅ Delete posts
- ✅ Toggle publish status
- ✅ Search posts

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Ensure backend is running on port 5005
   - Check that CORS is enabled in backend

2. **Authentication Errors**
   - Make sure you're logged in as admin
   - Check that JWT token is valid

3. **Categories Not Loading**
   - Run the seed script: `node scripts/seed.js`
   - Check that categories endpoint is working

4. **Image Upload Fails**
   - Verify Cloudinary credentials in backend .env
   - Check file size (max 5MB)
   - Ensure file is an image

### Debug Commands:
```bash
# Check if backend is running
curl http://localhost:5005/api

# Check if categories endpoint works
curl http://localhost:5005/api/blog/categories

# Check if blog posts endpoint works
curl http://localhost:5005/api/blog
```

## 📁 Key Files

### Backend
- `likesio-backend/models/BlogPost.js` - Blog post model
- `likesio-backend/models/BlogCategory.js` - Category model
- `likesio-backend/controllers/blog.js` - Blog controller
- `likesio-backend/routes/blog.js` - Blog routes

### Frontend
- `likes-admin/src/services/blog-service.ts` - API service
- `likes-admin/src/components/blog/BlogDialog.tsx` - Blog form
- `likes-admin/src/pages/Blog.tsx` - Blog page
- `likes-admin/src/components/ui/file-upload.tsx` - File upload

## 🎯 Next Steps

Once the basic integration is working:

1. Add category management UI
2. Implement pagination
3. Add rich text editor
4. Create public blog view
5. Add SEO optimization

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure both frontend and backend are running
4. Check the detailed integration guide: `BLOG_INTEGRATION_GUIDE.md` 