const APPLE_DEVELOPER_TOKEN =
  'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjZLVkRTNjc2NVMifQ.eyJpYXQiOjE3MzE0NTQ2OTEsImV4cCI6MTc0NzAwNjY5MSwiaXNzIjoiRFlXNEFHOTQ0MiJ9.Us6UP86UTEZJtCdyVLlOGGj-hw_pZ4lu4Pk-htEbolgWrph6P_toc9INvLhzVgVlD5ToyiD_m8CssZlPunUGHw';

export const appleMusicAuth = {
  initialize: () => {
    return new Promise<MusicKit.Instance>((resolve, reject) => {
      if (!APPLE_DEVELOPER_TOKEN) {
        reject(new Error('Apple Music developer token is not configured'));
        return;
      }

      console.log('Token length:', APPLE_DEVELOPER_TOKEN?.length);
      console.log(
        'Token starts with:',
        APPLE_DEVELOPER_TOKEN?.substring(0, 10) + '...'
      );

      // Ensure the token is properly formatted
      const cleanToken = APPLE_DEVELOPER_TOKEN.trim();

      console.log('Clean Token', cleanToken);

      // Check if MusicKit is already loaded
      if (window.MusicKit) {
        try {
          const instance = MusicKit.configure({
            developerToken: APPLE_DEVELOPER_TOKEN,
            app: {
              name: 'Harmony Hub',
              build: '1.0.0',
            },
          });
          resolve(instance);
          return;
        } catch (error) {
          console.error('MusicKit configuration error:', error);
          reject(error);
          return;
        }
      }

      // If not loaded, add script and configure
      const script = document.createElement('script');
      script.src = 'https://js-cdn.music.apple.com/musickit/v1/musickit.js';
      script.async = true;

      script.onload = () => {
        try {
          const instance = MusicKit.configure({
            developerToken: cleanToken,
            app: {
              name: 'Harmony Hub',
              build: '1.0.0',
            },
          });
          resolve(instance);
        } catch (error) {
          console.error('MusicKit configuration error:', error);
          reject(error);
        }
      };

      script.onerror = () => {
        reject(new Error('Failed to load MusicKit JS'));
      };

      document.body.appendChild(script);
    });
  },

  authorize: async (): Promise<any> => {
    try {
      const music = await MusicKit.getInstance();
      const token = await music.authorize();

      return {
        musicUserToken: token,
        isAuthorized: music.isAuthorized,
      };
    } catch (error) {
      console.error('Apple Music authorization error:', error);
      throw error;
    }
  },
};
