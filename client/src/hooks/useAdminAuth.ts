import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAdminAuth() {
  const { data: adminUser, isLoading, error } = useQuery({
    queryKey: ['/api/admin/current-user'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/current-user");
      if (!response.ok) {
        throw new Error('Not authenticated');
      }
      return response.json();
    },
    retry: false,
    staleTime: 30 * 60 * 1000, // 30 minutes for faster loading
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection time
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  return {
    adminUser,
    isLoading,
    isAuthenticated: !!adminUser,
    error
  };
}