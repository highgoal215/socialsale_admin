import axios from 'axios';

const backendUrl = "http://localhost:5005/api";

export const signin = async (email: string, password: string) => {
  console.log("email and password ", email, password);
  try {
    const response = await axios.post(`${backendUrl}/auth/login`, { email, password });
    
    if (response.data && response.data.token) {
      localStorage.setItem('admin_token', response.data.token);
      
      if (response.data.user) {
        localStorage.setItem('admin_user', JSON.stringify(response.data.user));
      }
    }
    
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const signout = async () => {
  try {
    console.log("response");
    const token = localStorage.getItem('admin_token');
    
    const response = await axios.post(`${backendUrl}/auth/logout`, {}, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    
    return response.data;
  } catch (error) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    console.error("Logout error:", error);
    throw error;
  }
};
export const getUser = async () => {
  const token = localStorage.getItem('admin_token');
  
  try {
    // Change this endpoint to match your backend API
    const response = await axios.get(`${backendUrl}/auth/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    
    return response.data;
  } catch (error) {
    console.error("Get users error:", error);
    throw error;
  }
};

export const updateUserState = async (userId: string, status: number) => {
  const token = localStorage.getItem('admin_token');
  
  try {
    const response = await axios.post(
      `${backendUrl}/updateUserStatus`, 
      { userId, status },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Update user status error:", error);
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  const token = localStorage.getItem('admin_token');
  
  try {
    const response = await axios.delete(`${backendUrl}/removeUser/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    
    return response.data;
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }
};