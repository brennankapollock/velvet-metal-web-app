import { spotifyAuth } from './api/spotify';

interface MusicAlbum {
  id: string;
  name: string;
  artist: string;
  artists: string[];
  cover: string;
  service: string;
  totalTracks: number;
  releaseDate: string;
  uri: string;
  type: string;
}

interface MusicTrack {
  id: string;
  name: string;
  artist: string;
  cover: string;
  service: string;
}

export const spotifyService = {
  // FETCH ALL ALBUMS IN USERS SPOTIFY LIBRARY
  fetchAlbums: async (
    token: string,
    offset = 0
  ): Promise<{ items: MusicAlbum[]; total: number }> => {
    const limit = 20;

    const response = await fetch(
      `https://api.spotify.com/v1/me/albums?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Spotify albums');
    }

    const data = await response.json();
    console.log('Raw Spotify albums response:', JSON.stringify(data, null, 2));

    return {
      items: data.items.map((item: any) => ({
        id: item.album.id,
        name: item.album.name,
        artist: item.album.artists[0].name,
        artists: item.album.artists.map((artist: any) => artist.name),
        cover: item.album.images[0]?.url,
        service: 'spotify',
        totalTracks: item.album.total_tracks,
        releaseDate: item.album.release_date,
        uri: item.album.uri,
        type: item.album.album_type,
      })),
      total: data.total,
    };
  },

  // FETCH ALL TRACKS IN USERS SPOTIFY LIBRARY

  fetchTracks: async (token: string): Promise<MusicTrack[]> => {
    const response = await fetch('https://api.spotify.com/v1/me/tracks', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Spotify tracks');
    }

    const data = await response.json();
    return data.items.map((item: any) => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists[0].name,
      album: item.track.album.name,
      albumCover: item.track.album.images[0]?.url,
      service: 'spotify',
    }));
  },

  refreshToken: spotifyAuth.refreshToken,
};

export const appleMusicService = {
  fetchAlbums: async (
    music: MusicKit.Instance,
    offset = 0
  ): Promise<{ items: MusicAlbum[]; total: number }> => {
    if (!music.isAuthorized) {
      throw new Error('Apple Music is not authorized');
    }

    const limit = 20;
    const response = await music.api.library.albums({ limit, offset });
    console.log('Apple Music albums response:', response);

    return {
      items: response.map((album: any) => ({
        id: album.id,
        name: album.attributes.name,
        artist: album.attributes.artistName,
        artists: [album.attributes.artistName], // Apple Music typically provides single artist
        cover: album.attributes.artwork.url.replace('{w}x{h}', '300x300'),
        service: 'apple-music',
        totalTracks: album.attributes.trackCount,
        releaseDate: album.attributes.releaseDate,
        uri: album.id,
        type: album.type === 'library-albums' ? 'album' : album.type,
      })),
      total: response.meta?.total || response.length,
    };
  },

  fetchTracks: async (music: MusicKit.Instance): Promise<MusicTrack[]> => {
    if (!music.isAuthorized) {
      throw new Error('Apple Music is not authorized');
    }

    const response = await music.api.library.songs();
    console.log('Apple Music tracks response:', response);

    return response.map((track: any) => ({
      id: track.id,
      name: track.attributes.name,
      artist: track.attributes.artistName,
      album: track.attributes.albumName,
      albumCover: track.attributes.artwork.url.replace('{w}x{h}', '64x64'),
      service: 'apple-music',
    }));
  },
};

export type { MusicAlbum, MusicTrack };
