import { useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('admin_token');
      const wasAuthenticated = isAuthenticated;
      const newAuthState = !!token;
      
      // console.log('AuthGuard: Checking authentication', { 
      //   wasAuthenticated, 
      //   newAuthState, 
      //   hasToken: !!token 
      // });
      
      setIsAuthenticated(newAuthState);
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = useCallback((email: string, password: string, userData: any): Promise<boolean> => {
    // console.log('AuthGuard: Login called');
    return new Promise((resolve) => {
      // Token is already stored by the signin function
      setIsAuthenticated(true);
      resolve(true);
    });
  }, []);

  const logout = useCallback(() => {
    // console.log('AuthGuard: Logout called');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setIsAuthenticated(false);
  }, []);

  const authValue = useMemo(() => ({
    isAuthenticated,
    isLoading,
    login,
    logout
  }), [isAuthenticated, isLoading, login, logout]);

  return authValue;
};

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // console.log('AuthGuard: Render', { 
  //   isAuthenticated, 
  //   isLoading, 
  //   pathname: location.pathname 
  // });

  useEffect(() => {
    if (!isLoading && !isAuthenticated && location.pathname !== '/login') {
      // console.log('AuthGuard: Redirecting to login');
      // Redirect to login page if not authenticated
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  useEffect(() => {
    if (isAuthenticated && location.pathname === '/login') {
      // console.log('AuthGuard: Redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export { useAuth };