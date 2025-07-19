const axios = require('axios');

// Configuration
const API_URL = process.env.VITE_BACKEND_URL || 'http://localhost:5005';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

// Test functions
const testAuth = async () => {
  console.log('🔐 Testing authentication...');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    if (response.data.success) {
      // console.log('✅ Authentication successful');
      return response.data.data.token;
    } else {
      // console.log('❌ Authentication failed');
      return null;
    }
  } catch (error) {
    // console.log('❌ Authentication error:', error.message);
    return null;
  }
};

const testCategories = async (token) => {
  console.log('📋 Testing categories endpoint...');
  try {
    const response = await axios.get(`${API_URL}/blog/categories`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      // console.log(`✅ Categories loaded: ${response.data.data.length}`);
      return response.data.data;
    } else {
      // console.log('❌ Categories failed');
      return [];
    }
  } catch (error) {
    // console.log('❌ Categories error:', error.message);
    return [];
  }
};

const testBlogPosts = async (token) => {
  // console.log('📝 Testing blog posts endpoint...');
  try {
    const response = await axios.get(`${API_URL}/blog`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      // console.log(`✅ Blog posts loaded: ${response.data.data.length}`);
      return response.data.data;
    } else {
      // console.log('❌ Blog posts failed');
      return [];
    }
  } catch (error) {
    // console.log('❌ Blog posts error:', error.message);
    return [];
  }
};

const testImageUpload = async (token) => {
  // console.log('🖼️ Testing image upload endpoint...');
  try {
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    const formData = new FormData();
    formData.append('banner', testImageBuffer, { filename: 'test.png', contentType: 'image/png' });
    
    const response = await axios.post(`${API_URL}/blog/upload`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.data.success) {
      // console.log('✅ Image upload successful');
      return response.data.data.url;
    } else {
      // console.log('❌ Image upload failed');
      return null;
    }
  } catch (error) {
    // console.log('❌ Image upload error:', error.message);
    return null;
  }
};

const testCreatePost = async (token, categories) => {
  console.log('✍️ Testing blog post creation...');
  try {
    const postData = {
      title: 'Test Blog Post',
      slug: 'test-blog-post',
      excerpt: 'This is a test blog post for integration testing.',
      content: 'This is the content of the test blog post. It contains some sample text to verify that the blog post creation is working correctly.',
      categoryId: categories[0]?.id || 'test-category',
      published: false
    };
    
    const response = await axios.post(`${API_URL}/blog`, postData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      // console.log('✅ Blog post created successfully');
      return response.data.data;
    } else {
      // console.log('❌ Blog post creation failed');
      return null;
    }
  } catch (error) {
    // console.log('❌ Blog post creation error:', error.message);
    return null;
  }
};

// Main test function
const runIntegrationTests = async () => {
  // console.log('🧪 Starting Blog Integration Tests...\n');
  
  // Test authentication
  const token = await testAuth();
  if (!token) {
    // console.log('\n❌ Authentication failed. Cannot proceed with tests.');
    return;
  }
  

  // Test categories
  const categories = await testCategories(token);

  
  // Test blog posts
  const posts = await testBlogPosts(token);
  
 
  
  // Test image upload
  const imageUrl = await testImageUpload(token);
 
  
  // Test post creation
  const newPost = await testCreatePost(token, categories);
  
  // console.log('\n🎉 Integration tests completed!');
  
  // Summary
  // console.log('\n📊 Test Summary:');
  // console.log(`- Authentication: ${token ? '✅' : '❌'}`);
  // console.log(`- Categories: ${categories.length > 0 ? '✅' : '❌'} (${categories.length} found)`);
  // console.log(`- Blog Posts: ${posts.length >= 0 ? '✅' : '❌'} (${posts.length} found)`);
  // console.log(`- Image Upload: ${imageUrl ? '✅' : '❌'}`);
  // console.log(`- Post Creation: ${newPost ? '✅' : '❌'}`);
};

// Run tests
runIntegrationTests().catch(console.error); 