import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../services/categoryApi';

export function useCategories(type = 'all') {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: () => categoryApi.getCategories(type),
    select: (response) => response.data.data.categories,
    staleTime: 1000 * 60 * 30, // 30 minutes (categories rarely change)
  });
}

export function useCategory(id) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => categoryApi.getCategory(id),
    select: (response) => response.data.data.category,
    enabled: !!id,
    staleTime: 1000 * 60 * 30,
  });
}
