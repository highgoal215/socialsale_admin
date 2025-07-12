# Banner Image Upload Feature

This document explains how the banner image upload feature works in the blog management system.

## Overview

The banner image upload feature allows users to upload images when creating or editing blog posts. The images are uploaded to Cloudinary (via the backend) and the resulting URL is stored with the blog post.

## Components

### 1. FileUpload Component (`src/components/ui/file-upload.tsx`)
- Handles drag-and-drop and file selection
- Provides image preview
- Supports image file validation
- Allows file removal

### 2. BlogDialog Component (`src/components/blog/BlogDialog.tsx`)
- Integrates the FileUpload component
- Manages banner image state
- Handles form submission with image upload
- Provides user feedback via toast notifications

### 3. BlogService (`src/services/blog-service.ts`)
- Handles API communication with the backend
- Manages file uploads using FormData
- Provides methods for CRUD operations on blog posts

## How It Works

### Creating a New Blog Post
1. User opens the "Create New Post" dialog
2. User can drag and drop an image or click "Browse Files" to select an image
3. The image is previewed in the FileUpload component
4. When the form is submitted:
   - If a banner image is selected, it's uploaded to the backend first
   - The backend uploads the image to Cloudinary and returns the URL
   - The blog post is created with the image URL
   - Success/error feedback is shown to the user

### Editing an Existing Blog Post
1. User opens the "Edit Post" dialog
2. The existing image URL is displayed (if any)
3. User can upload a new image to replace the existing one
4. The same upload process occurs as with creating a new post

## Backend Integration

### API Endpoints
- `POST /api/blog` - Create blog post with image upload
- `PUT /api/blog/:id` - Update blog post with image upload
- `POST /api/blog/upload` - Upload image only (for preview)

### File Upload Handling
- Uses Multer middleware for file handling
- Images are uploaded to Cloudinary
- File size limit: 5MB
- Supported formats: All image types
- Images are automatically optimized and resized

## File Structure

```
likes-admin/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   └── file-upload.tsx          # File upload component
│   │   └── blog/
│   │       └── BlogDialog.tsx           # Blog dialog with image upload
│   ├── services/
│   │   └── blog-service.ts              # Blog API service
│   └── types/
│       └── blog.ts                      # Blog type definitions
```

## Usage Example

```typescript
// In BlogDialog component
const [bannerImage, setBannerImage] = useState<File | null>(null);

// FileUpload component usage
<FileUpload
  id="bannerImage"
  label="Banner Image"
  accept="image/*"
  currentFile={bannerImage}
  onFileChange={setBannerImage}
/>

// Form submission
const onSubmit = async (values: BlogFormValues) => {
  if (bannerImage) {
    const uploadResult = await BlogService.uploadImage(bannerImage);
    // Use uploadResult.imageUrl for the blog post
  }
  // Create/update blog post
};
```

## Error Handling

- File validation (image types only)
- File size limits
- Upload failures
- Network errors
- User feedback via toast notifications

## Future Enhancements

- Image cropping functionality
- Multiple image uploads
- Image optimization options
- Drag and drop reordering
- Image gallery management 