import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useServices } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import {
  spotifyService,
  appleMusicService,
  type MusicTrack,
} from '@/lib/music-services';

export default function Tracks() {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { services, updateService } = useServices();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const fetchAllUserContent = async () => {
      if (!mounted) return;
      setIsLoading(true);
      const allTracks: MusicTrack[] = [];

      try {
        await Promise.all(
          services.map(async (service) => {
            if (!mounted) return;

            try {
              if (service.id === 'spotify' && service.connected) {
                if (service.expiresAt && service.expiresAt <= Date.now()) {
                  if (service.refreshToken) {
                    const refreshedTokens = await spotifyService.refreshToken(
                      service.refreshToken
                    );

                    if (!mounted) return;

                    const updatedService = {
                      ...service,
                      accessToken: refreshedTokens.access_token,
                      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
                    };
                    updateService(service.id, updatedService);
                    service = updatedService;
                  }
                }

                if (service.accessToken) {
                  const spotifyTracks = await spotifyService.fetchTracks(
                    service.accessToken
                  );
                  if (mounted) {
                    allTracks.push(...spotifyTracks);
                  }
                }
              }
              if (service.id === 'apple-music' && service.connected) {
                const music = await MusicKit.getInstance();
                if (music.isAuthorized && mounted) {
                  const appleMusicTracks = await appleMusicService.fetchTracks(
                    music
                  );
                  allTracks.push(...appleMusicTracks);
                }
              }
            } catch (error) {
              if (!mounted) return;

              console.error(`Error fetching from ${service.id}:`, error);
              if (error.message.includes('token')) {
                updateService(service.id, {
                  ...service,
                  connected: false,
                  accessToken: undefined,
                  refreshToken: undefined,
                  expiresAt: undefined,
                });
              }

              toast({
                title: `${service.name} Error`,
                description: `Failed to fetch tracks from ${service.name}.`,
                variant: 'destructive',
              });
            }
          })
        );

        if (mounted) {
          setTracks(allTracks);
        }
      } catch (error) {
        if (!mounted) return;
        console.error('Fetch error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch your tracks.',
          variant: 'destructive',
        });
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAllUserContent();

    return () => {
      mounted = false;
    };
  }, [services, updateService, toast]);

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Your Tracks</h1>
      <div className="w-full">
        <ScrollArea className="w-full h-[calc(100vh-12rem)] rounded-md border">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Loading your tracks...</p>
            </div>
          ) : tracks.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">
                No tracks found. Connect a music service to see your tracks.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {tracks.map((track) => (
                <div
                  key={`${track.service}-${track.id}`}
                  className="flex items-center p-3 hover:bg-accent"
                >
                  <img
                    src={track.albumCover}
                    alt={track.album}
                    className="h-12 w-12 rounded object-cover"
                  />
                  <div className="ml-3 flex-1 overflow-hidden">
                    <p className="font-medium truncate">{track.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {track.artist} • {track.album}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground ml-3">
                    {track.service === 'spotify' ? 'Spotify' : 'Apple Music'}
                  </span>
                </div>
              ))}
            </div>
          )}
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </div>
  );
}
