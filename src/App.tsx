import { Routes, Route, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { AuthDialog } from './components/auth/AuthDialog';
import ServiceConnector from './components/ServiceConnector';
import Sidebar from './components/Sidebar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useLibrarySync } from './hooks/use-library-sync';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const { isAuthenticated, user, logout } = useAuth();
  useLibrarySync();

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="h-screen flex bg-background">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="h-full">
              <div className="flex justify-end p-4">
                {isAuthenticated ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm">Welcome, {user?.name}</span>
                    <Button variant="outline" onClick={logout}>
                      Logout
                    </Button>
                  </div>
                ) : (
                  <AuthDialog />
                )}
              </div>
              <Routes>
                <Route
                  path="/"
                  element={
                    <div className="p-8 space-y-8">
                      <div>
                        <h1 className="text-4xl font-bold tracking-tight">
                          Welcome, Brennan
                        </h1>
                        <p className="text-muted-foreground mt-2">
                          Manage all your music in one place
                        </p>
                      </div>
                      <ServiceConnector />
                    </div>
                  }
                />
              </Routes>
              <Outlet />
            </div>
          </main>
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
