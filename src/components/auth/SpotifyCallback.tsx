import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '@/lib/store';
import { spotifyAuth } from '@/lib/api/spotify';
import { useToast } from '@/hooks/use-toast';

export function SpotifyCallback() {
  const navigate = useNavigate();
  const { addService } = useServices();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      console.log('Received auth code:', code ? 'Present' : 'Missing');

      if (code) {
        try {
          console.log('Getting tokens from Spotify...');
          const tokens = await spotifyAuth.getToken(code);
          console.log('Received tokens:', {
            accessToken: tokens.access_token ? 'Present' : 'Missing',
            refreshToken: tokens.refresh_token ? 'Present' : 'Missing',
            expiresIn: tokens.expires_in,
          });

          const serviceData = {
            id: 'spotify',
            name: 'Spotify',
            connected: true,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: Date.now() + tokens.expires_in * 1000,
          };

          console.log('Adding service with data:', {
            ...serviceData,
            accessToken: serviceData.accessToken ? 'Present' : 'Missing',
            refreshToken: serviceData.refreshToken ? 'Present' : 'Missing',
          });

          addService(serviceData);

          toast({
            title: 'Success',
            description: 'Successfully connected to Spotify!',
          });
        } catch (error) {
          console.error('Spotify connection error:', error);
          toast({
            title: 'Error',
            description: 'Failed to connect to Spotify',
            variant: 'destructive',
          });
        }
      } else {
        console.error('No authorization code received from Spotify');
      }

      navigate('/');
    };

    handleCallback();
  }, [addService, navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">
          Connecting to Spotify...
        </h2>
        <p className="text-muted-foreground">
          Please wait while we complete the connection.
        </p>
      </div>
    </div>
  );
}
