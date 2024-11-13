import { config } from '@/lib/config';

const SPOTIFY_CLIENT_ID = config.spotify.clientId;
const SPOTIFY_REDIRECT_URI = config.spotify.redirectUri;

export const spotifyAuth = {
  authorize: () => {
    const scope = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'user-library-read',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: SPOTIFY_REDIRECT_URI,
      scope,
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params}`;
  },

  getToken: async (code: string) => {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(
          `${SPOTIFY_CLIENT_ID}:${config.spotify.clientSecret}`
        )}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get Spotify access token');
    }

    const data = await response.json();
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    };
  },

  refreshToken: async (refreshToken: string) => {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(
          `${SPOTIFY_CLIENT_ID}:${config.spotify.clientSecret}`
        )}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh Spotify access token');
    }

    const data = await response.json();
    return {
      access_token: data.access_token,
      expires_in: data.expires_in,
    };
  },
};
