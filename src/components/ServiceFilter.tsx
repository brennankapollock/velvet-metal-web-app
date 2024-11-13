import { Button } from '@/components/ui/button';
import { useServices } from '@/lib/store';
import { Music, Apple } from 'lucide-react';

interface ServiceFilterProps {
  activeServices: string[];
  onToggleService: (serviceId: string) => void;
}

export function ServiceFilter({
  activeServices,
  onToggleService,
}: ServiceFilterProps) {
  const { services } = useServices();

  return (
    <div className="flex gap-2">
      {services.map((service) => {
        if (!service.connected) return null;

        return (
          <Button
            key={service.id}
            variant={
              activeServices.includes(service.id) ? 'default' : 'outline'
            }
            size="sm"
            onClick={() => onToggleService(service.id)}
          >
            {service.id === 'spotify' ? (
              <Music className="mr-2 h-4 w-4" />
            ) : (
              <Apple className="mr-2 h-4 w-4" />
            )}
            {service.name}
          </Button>
        );
      })}
    </div>
  );
}
