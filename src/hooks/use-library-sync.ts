import { useEffect, useCallback } from 'react';
import { useServices } from '@/lib/store';
import { useLibrary } from '@/lib/library-store';
import { spotifyService, appleMusicService } from '@/lib/music-services';
import { useToast } from '@/hooks/use-toast';

const SYNC_INTERVAL = 1000 * 60 * 30; // 30 minutes

export function useLibrarySync() {
  const { services, updateService } = useServices();
  const { setAlbums, setTracks, lastFetched, setLoading } = useLibrary();
  const { toast } = useToast();

  const syncLibrary = useCallback(async () => {
    setLoading(true);
    const allAlbums = [];
    const allTracks = [];

    for (const service of services) {
      try {
        if (service.id === 'spotify' && service.connected) {
          if (service.expiresAt && service.expiresAt <= Date.now()) {
            const refreshedTokens = await spotifyService.refreshToken(
              service.refreshToken!
            );
            updateService(service.id, {
              ...service,
              accessToken: refreshedTokens.access_token,
              expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
            });
          }

          if (service.accessToken) {
            const [albums, tracks] = await Promise.all([
              spotifyService.fetchAlbums(service.accessToken),
              spotifyService.fetchTracks(service.accessToken),
            ]);
            allAlbums.push(...albums.items);
            allTracks.push(...tracks);
          }
        }

        if (service.id === 'apple-music' && service.connected) {
          const music = await MusicKit.getInstance();
          if (music.isAuthorized) {
            const [albums, tracks] = await Promise.all([
              appleMusicService.fetchAlbums(music),
              appleMusicService.fetchTracks(music),
            ]);
            allAlbums.push(...albums.items);
            allTracks.push(...tracks);
          }
        }
      } catch (error) {
        console.error(`Error syncing ${service.id} library:`, error);
        toast({
          title: `${service.name} Sync Error`,
          description: `Failed to sync your ${service.name} library.`,
          variant: 'destructive',
        });
      }
    }

    setAlbums(allAlbums);
    setTracks(allTracks);
    setLoading(false);
  }, [services, updateService, setAlbums, setTracks, setLoading, toast]);

  useEffect(() => {
    const shouldSync = !lastFetched || Date.now() - lastFetched > SYNC_INTERVAL;

    if (shouldSync) {
      syncLibrary();
    }

    const interval = setInterval(syncLibrary, SYNC_INTERVAL);
    return () => clearInterval(interval);
  }, [syncLibrary, lastFetched]);

  return { syncLibrary };
}
