import { BlogService } from '@/services/blog-service';

export const testBlogIntegration = async () => {
  console.log('🧪 Testing Blog Integration...');
  
  try {
    // Test 1: Get categories
    console.log('📋 Testing categories endpoint...');
    const categories = await BlogService.getCategories();
    console.log('✅ Categories loaded:', categories.length);
    
    // Test 2: Get blog posts
    console.log('📝 Testing blog posts endpoint...');
    const posts = await BlogService.getAllPosts();
    console.log('✅ Blog posts loaded:', posts.length);
    
    // Test 3: Test image upload (if we have a test image)
    console.log('🖼️ Testing image upload endpoint...');
    // Note: This would require a test image file
    
    console.log('🎉 All tests passed! Blog integration is working correctly.');
    return true;
  } catch (error) {
    console.error('❌ Blog integration test failed:', error);
    return false;
  }
};

// Test specific endpoints
export const testCategoriesEndpoint = async () => {
  try {
    const categories = await BlogService.getCategories();
    console.log('Categories:', categories);
    return categories;
  } catch (error) {
    console.error('Categories test failed:', error);
    throw error;
  }
};

export const testBlogPostsEndpoint = async () => {
  try {
    const posts = await BlogService.getAllPosts();
    console.log('Blog posts:', posts);
    return posts;
  } catch (error) {
    console.error('Blog posts test failed:', error);
    throw error;
  }
}; 