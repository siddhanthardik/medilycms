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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    adminUser,
    isLoading,
    isAuthenticated: !!adminUser,
    error
  };
}