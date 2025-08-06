import { useQuery } from "@tanstack/react-query";

async function fetchUser() {
  const sessionId = localStorage.getItem('sessionId');
  const response = await fetch('/api/auth/user', {
    headers: sessionId ? { 'X-Session-Id': sessionId } : {},
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  
  return response.json();
}

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}