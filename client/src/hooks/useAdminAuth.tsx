import { useState, useEffect } from 'react';

const ADMIN_AUTH_KEY = 'admin_authenticated';
const ADMIN_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const ADMIN_TIMESTAMP_KEY = 'admin_auth_timestamp';

export function useAdminAuth() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Clear any existing admin auth on page load for security
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    sessionStorage.removeItem(ADMIN_TIMESTAMP_KEY);
    setIsAdminAuthenticated(false);
    setIsLoading(false);
  }, []);

  const authenticateAdmin = () => {
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    sessionStorage.setItem(ADMIN_TIMESTAMP_KEY, Date.now().toString());
    setIsAdminAuthenticated(true);
  };

  const logoutAdmin = () => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    sessionStorage.removeItem(ADMIN_TIMESTAMP_KEY);
    setIsAdminAuthenticated(false);
  };

  return {
    isAdminAuthenticated,
    isLoading,
    authenticateAdmin,
    logoutAdmin
  };
}