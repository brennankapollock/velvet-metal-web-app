import { Music, Library, PlayCircle, Disc, ListMusic } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="pb-12 h-full w-64 border-r bg-background">
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <Link to="/" className="flex items-center gap-2 px-2">
            <Music className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold tracking-tight">
              Velvet Metal
            </h2>
          </Link>
        </div>
        <div className="px-4">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Library
          </h2>
          <div className="space-y-1">
            <Link to="/albums">
              <Button
                variant={
                  location.pathname === '/albums' ? 'secondary' : 'ghost'
                }
                className="w-full justify-start"
              >
                <Disc className="mr-2 h-4 w-4" />
                Albums
              </Button>
            </Link>
            <Link to="/tracks">
              <Button
                variant={
                  location.pathname === '/tracks' ? 'secondary' : 'ghost'
                }
                className="w-full justify-start"
              >
                <ListMusic className="mr-2 h-4 w-4" />
                Tracks
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
