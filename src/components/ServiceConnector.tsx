import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth, useServices } from '@/lib/store';
import { spotifyAuth } from '@/lib/api/spotify';
import { appleMusicAuth } from '@/lib/api/apple-music';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

const services = [
  {
    id: 'spotify',
    name: 'Spotify',
    logo: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=64&h=64&fit=crop&auto=format',
    connect: () => spotifyAuth.authorize(),
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    logo: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=64&h=64&fit=crop&auto=format',
    connect: () => appleMusicAuth.authorize(),
  },
];

const ServiceConnector = () => {
  const [isMusicKitLoaded, setIsMusicKitLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const { isAuthenticated } = useAuth();
  const {
    services: connectedServices,
    addService,
    removeService,
  } = useServices();
  const { toast } = useToast();

  useEffect(() => {
    const initializeMusicKit = async () => {
      try {
        setIsInitializing(true);
        await appleMusicAuth.initialize();
        setIsMusicKitLoaded(true);
      } catch (error) {
        console.error('Failed to initialize MusicKit:', error);
        toast({
          title: 'Apple Music Error',
          description:
            'Failed to initialize Apple Music. Some features may be unavailable.',
          variant: 'destructive',
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initializeMusicKit();
  }, [toast]);

  // Create a map of connected services for easy lookup
  const connectedServiceMap = new Map(
    connectedServices.map((service) => [service.id, service])
  );

  const handleConnect = async (service: (typeof services)[0]) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to connect music services.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (service.id === 'apple-music') {
        if (!isMusicKitLoaded || isInitializing) {
          toast({
            title: 'Service Not Ready',
            description:
              'Apple Music is still initializing. Please try again in a moment.',
            variant: 'destructive',
          });
          return;
        }

        const result = await service.connect();

        if (result.isAuthorized) {
          addService({
            id: 'apple-music',
            name: 'Apple Music',
            connected: true,
            accessToken: result.musicUserToken,
          });

          toast({
            title: 'Success',
            description: 'Successfully connected to Apple Music!',
          });
        }
      } else {
        // Handle Spotify and other services
        await service.connect();
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: 'Error',
        description: `Failed to connect to ${service.name}.`,
        variant: 'destructive',
      });
    }
  };

  // Filter available services to only show unconnected ones
  const availableServices = services.filter(
    (service) =>
      !connectedServiceMap.has(service.id) &&
      (service.id !== 'apple-music' || isMusicKitLoaded)
  );

  const handleDisconnect = (serviceId: string, serviceName: string) => {
    removeService(serviceId);
    toast({
      title: 'Service Disconnected',
      description: `Successfully disconnected from ${serviceName}.`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Connected Services
        </h2>
        {availableServices.length > 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect a Music Service</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {availableServices.map((service) => (
                  <Card
                    key={service.id}
                    className="p-4 hover:bg-accent cursor-pointer"
                    onClick={() => handleConnect(service)}
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={service.logo}
                        alt={service.name}
                        className="h-12 w-12 rounded-full"
                      />
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Connect your {service.name} account
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectedServices.map((service) => (
          <Card key={service.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={services.find((s) => s.id === service.id)?.logo}
                  alt={service.name}
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <h3 className="font-medium">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">Connected</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDisconnect(service.id, service.name)}
              >
                Disconnect
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServiceConnector;
