import { useQuery } from '@tanstack/react-query';
import { spotifyService, appleMusicService } from '@/lib/music-services';
import { useServices } from '@/lib/store';

export function useAlbums(offset = 0) {
  const { services } = useServices();

  return useQuery({
    queryKey: ['albums', offset],
    queryFn: async () => {
      const allAlbums = [];

      for (const service of services) {
        if (
          service.id === 'spotify' &&
          service.connected &&
          service.accessToken
        ) {
          const { items } = await spotifyService.fetchAlbums(
            service.accessToken,
            offset
          );
          allAlbums.push(...items);
        }

        if (service.id === 'apple-music' && service.connected) {
          const music = await MusicKit.getInstance();
          if (music.isAuthorized) {
            const { items } = await appleMusicService.fetchAlbums(
              music,
              offset
            );
            allAlbums.push(...items);
          }
        }
      }

      return allAlbums;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
  });
}
