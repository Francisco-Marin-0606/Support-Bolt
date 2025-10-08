"use client";
import { getAudioRequestStats } from '@/app/_services/audioRequestService';
import { AudioRequestStats } from '@/app/types/audioRequest';
import { useQuery } from '@tanstack/react-query';

export const useAudioStats = () => {
  return useQuery({
    queryKey: ['audioStats'],
    queryFn: async (): Promise<AudioRequestStats> => {
      try {
        const response = await getAudioRequestStats();
        return response;
      } catch (error) {
        console.error('Error en useAudioStats:', error);
        return {
          totalRequests: 0,
          byStatus: {
            pending: 0,
            created: 0,
            sended: 0,
            completed: 0,
            error: 0,
            review: 0
          }
        };
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 2,
  });
}; 