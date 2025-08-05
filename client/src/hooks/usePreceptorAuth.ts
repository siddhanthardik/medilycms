import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function usePreceptorAuth() {
  const { data: preceptor, isLoading, error } = useQuery({
    queryKey: ['/api/preceptor/current-user'],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/preceptor/current-user");
        return response.json();
      } catch (error) {
        return null;
      }
    },
    retry: false,
    staleTime: 30 * 60 * 1000, // 30 minutes for faster loading
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection time
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    preceptor,
    isLoading,
    isAuthenticated: !!preceptor,
    error
  };
}