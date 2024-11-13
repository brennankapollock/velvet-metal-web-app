import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.tsx';
import Albums from './components/Albums.tsx';
import Tracks from './components/Tracks.tsx';
import { SpotifyCallback } from './components/auth/SpotifyCallback.tsx';
import { Toaster } from '@/components/ui/toaster';
import './index.css';

const router = createBrowserRouter([
  {
    path: '*',
    element: <App />,
    children: [
      {
        path: 'albums',
        element: <Albums />,
      },
      {
        path: 'tracks',
        element: <Tracks />,
      },
    ],
  },
  {
    path: '/callback/spotify',
    element: <SpotifyCallback />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster />
  </StrictMode>
);
