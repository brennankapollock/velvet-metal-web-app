import { useEffect, useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from './ui/input';
import { useServices } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import {
  appleMusicService,
  spotifyService,
  type MusicAlbum,
} from '@/lib/music-services';
import { Badge } from '@/components/ui/badge';
import { ServiceFilter } from '@/components/ServiceFilter';

export default function Albums() {
  const [albums, setAlbums] = useState<MusicAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const { toast } = useToast();
  const observer = useRef<IntersectionObserver>();
  const [activeServices, setActiveServices] = useState<string[]>([
    'spotify',
    'apple-music',
  ]);
  const { services, updateService } = useServices();

  const filteredAlbums = albums.filter(
    (album) =>
      album.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.artists.some((artist) =>
        artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const lastAlbumElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setOffset((prevOffset) => prevOffset + 20);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  const fetchAlbums = async (service: any, offsetVal: number) => {
    if (!activeServices.includes(service.id)) return [];

    if (service.id === 'spotify' && service.connected && service.accessToken) {
      const { items, total } = await spotifyService.fetchAlbums(
        service.accessToken,
        offsetVal
      );
      setHasMore(albums.length + items.length < total);
      return items;
    }

    if (service.id === 'apple-music' && service.connected) {
      const music = await MusicKit.getInstance();
      if (music.isAuthorized) {
        const { items, total } = await appleMusicService.fetchAlbums(
          music,
          offsetVal
        );
        setHasMore(albums.length + items.length < total);
        return items;
      }
    }

    return [];
  };

  const handleServiceToggle = (serviceId: string) => {
    setActiveServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      }
      return [...prev, serviceId];
    });
  };

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    const fetchAllUserContent = async () => {
      if (!mounted) return;
      setIsLoading(true);

      try {
        const newAlbums = await Promise.all(
          services.map((service) => fetchAlbums(service, offset))
        );

        if (mounted) {
          setAlbums((prev) =>
            offset === 0 ? newAlbums.flat() : [...prev, ...newAlbums.flat()]
          );
        }
      } catch (error) {
        console.error('Fetch error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch your music library.',
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
  }, [services, offset, activeServices, toast]);

  return (
    <div className="p-8 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Your Albums</h1>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search albums..."
            className="w-[200px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ServiceFilter
            activeServices={activeServices}
            onToggleService={handleServiceToggle}
          />
        </div>
      </div>
      <div className="w-full">
        <ScrollArea className="w-full h-[calc(100vh-12rem)] rounded-md border">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 p-4">
            {filteredAlbums.map((album, index) => (
              <Card
                key={`${album.service}-${album.id}`}
                className="w-full"
                ref={index === albums.length - 1 ? lastAlbumElementRef : null}
              >
                <div className="p-2">
                  <div className="overflow-hidden rounded-md relative group">
                    <img
                      src={album.cover}
                      alt={album.name}
                      className="aspect-square object-cover transition-all group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Badge variant="secondary">{album.type}</Badge>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h3 className="text-sm font-medium truncate">
                      {album.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {album.artists.join(', ')}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        {new Date(album.releaseDate).getFullYear()} •{' '}
                        {album.totalTracks} tracks
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {album.service}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {isLoading && (
            <div className="flex justify-center p-4">
              <p className="text-muted-foreground">Loading more albums...</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
