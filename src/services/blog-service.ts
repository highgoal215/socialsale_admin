import ApiService from '@/api/services/api-services';
import { BlogPost, BlogCategory } from '@/types/blog';

export interface CreateBlogPostData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  published: boolean;
  bannerImage?: File;
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {
  id: string;
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
}

export const BlogService = {
  // Get all blog posts
  getAllPosts: async (): Promise<BlogPost[]> => {
    const response = await ApiService.get<ApiResponse<BlogPost[]>>('/blog');
    return response.data;
  },

  // Get a single blog post by ID
  getPostById: async (id: string): Promise<BlogPost> => {
    const response = await ApiService.get<ApiResponse<BlogPost>>(`/blog/${id}`);
    return response.data;
  },

  // Create a new blog post
  createPost: async (data: CreateBlogPostData): Promise<BlogPost> => {
    const formData = new FormData();

    // Add text fields
    formData.append('title', data.title);
    formData.append('slug', data.slug);
    formData.append('excerpt', data.excerpt);
    formData.append('content', data.content);
    formData.append('categoryId', data.categoryId);
    formData.append('published', data.published.toString());

    // Add banner image if provided (backend expects 'image' field)
    if (data.bannerImage) {
      formData.append('blog', data.bannerImage);
    }

    const response = await ApiService.post<ApiResponse<BlogPost>>('/blog', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update an existing blog post
  updatePost: async (data: UpdateBlogPostData): Promise<BlogPost> => {
    const formData = new FormData();

    // Add text fields
    if (data.title) formData.append('title', data.title);
    if (data.slug) formData.append('slug', data.slug);
    if (data.excerpt) formData.append('excerpt', data.excerpt);
    if (data.content) formData.append('content', data.content);
    if (data.categoryId) formData.append('categoryId', data.categoryId);
    if (data.published !== undefined) formData.append('published', data.published.toString());

    // Add banner image if provided (backend expects 'image' field)
    if (data.bannerImage) {
      formData.append('blog', data.bannerImage);
    }

    const response = await ApiService.put<ApiResponse<BlogPost>>(`/blog/${data.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete a blog post
  deletePost: async (id: string): Promise<void> => {
    await ApiService.delete<ApiResponse<{}>>(`/blog/${id}`);
  },

  // Get all categories
  getCategories: async (): Promise<BlogCategory[]> => {
    const response = await ApiService.get<ApiResponse<BlogCategory[]>>('/blog/categories');
    return response.data;
  },

  // Create a new category
  createCategory: async (data: CreateCategoryData): Promise<BlogCategory> => {
    const response = await ApiService.post<ApiResponse<BlogCategory>>('/blog/categories', data);
    return response.data;
  },

  // Update an existing category
  updateCategory: async (data: UpdateCategoryData): Promise<BlogCategory> => {
    const response = await ApiService.put<ApiResponse<BlogCategory>>(`/blog/categories/${data.id}`, data);
    return response.data;
  },

  // Delete a category
  deleteCategory: async (id: string): Promise<void> => {
    await ApiService.delete<ApiResponse<{}>>(`/blog/categories/${id}`);
  },

  getPostCount: async (categoryId: string): Promise<number> => {
    const response = await ApiService.get<{ count: number }>(`/blog/categories/${categoryId}`);
    return response.count || 0;
  },

  // Upload image only (for preview purposes)
  uploadImage: async (file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('banner', file); // Backend expects 'banner' field for upload endpoint

    const response = await ApiService.post<ApiResponse<{ url: string; filename: string }>>('/blog/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return { imageUrl: response.data.url };
  },
}; 