export const config = {
  spotify: {
    clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || '',
    redirectUri: `${window.location.origin}/callback/spotify`,
  },
  appleMusic: {
    developerToken: import.meta.env.VITE_APPLE_DEVELOPER_TOKEN || '',
  },
};
