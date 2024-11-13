import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface MusicService {
  id: string;
  name: string;
  connected: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

interface ServicesState {
  services: MusicService[];
  addService: (service: MusicService) => void;
  updateService: (id: string, updates: Partial<MusicService>) => void;
  removeService: (id: string) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useServices = create<ServicesState>()(
  persist(
    (set) => ({
      services: [],
      addService: (service) =>
        set((state) => ({
          services: [...state.services, service],
        })),
      updateService: (id, updates) =>
        set((state) => ({
          services: state.services.map((service) =>
            service.id === id ? { ...service, ...updates } : service
          ),
        })),
      removeService: (id) =>
        set((state) => ({
          services: state.services.filter((service) => service.id !== id),
        })),
    }),
    {
      name: 'services-storage',
    }
  )
);
