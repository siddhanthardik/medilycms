import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection time
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/user", {
          credentials: "include",
        });
        
        if (response.status === 401) {
          return null; // User not authenticated
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        // Return null for auth errors instead of throwing
        return null;
      }
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
