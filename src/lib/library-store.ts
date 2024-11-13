import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MusicAlbum, MusicTrack } from '@/lib/music-services';

interface LibraryState {
  albums: MusicAlbum[];
  tracks: MusicTrack[];
  lastFetched: number | null;
  isLoading: boolean;
  hasMore: boolean;
  setAlbums: (albums: MusicAlbum[]) => void;
  setTracks: (tracks: MusicTrack[]) => void;
  appendAlbums: (albums: MusicAlbum[]) => void;
  appendTracks: (tracks: MusicTrack[]) => void;
  setLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  clearLibrary: () => void;
}

export const useLibrary = create<LibraryState>()(
  persist(
    (set) => ({
      albums: [], // Initialize with empty array
      tracks: [], // Initialize with empty array
      lastFetched: null,
      isLoading: false,
      hasMore: true,
      setAlbums: (albums) => set({ albums, lastFetched: Date.now() }),
      setTracks: (tracks) => set({ tracks, lastFetched: Date.now() }),
      appendAlbums: (newAlbums) =>
        set((state) => ({
          albums: [...state.albums, ...newAlbums],
          lastFetched: Date.now(),
        })),
      appendTracks: (newTracks) =>
        set((state) => ({
          tracks: [...state.tracks, ...newTracks],
          lastFetched: Date.now(),
        })),
      setLoading: (isLoading) => set({ isLoading }),
      setHasMore: (hasMore) => set({ hasMore }),
      clearLibrary: () =>
        set({
          albums: [],
          tracks: [],
          lastFetched: null,
          hasMore: true,
          isLoading: false,
        }),
    }),
    {
      name: 'music-library-storage',
    }
  )
);
