import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { servicesApi } from '@/services/servicesApi';
import { Service } from '@/types';

const FinalCTA = () => {
  const [services, setServices] = useState<Service[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      const data = await servicesApi.getAll();
      setServices(data);
    };
    fetchServices();
  }, []);

  const handleServiceClick = (serviceId: string) => {
    navigate(`/services/${serviceId}`);
  };

  return (
    <section className="py-24 px-[5%] bg-neutral-50 text-center" id="contact">
      <div className="max-w-[700px] mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-extrabold mb-8 text-foreground">
          Ready to perfect your AI outputs?
        </h2>
        <p className="text-lg text-primary-600 mb-12">
          Join 10,000+ professionals who trust eydits to make their AI work production-ready
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" variant="cta" className="gap-2">
                Get Your Free Quote
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-72">
              <p className="px-2 py-2 text-xs text-muted-foreground font-medium">
                Select a service to get started
              </p>
              {services.map((service) => (
                <DropdownMenuItem
                  key={service.id}
                  onClick={() => handleServiceClick(service.id)}
                  className="cursor-pointer py-3"
                >
                  <div>
                    <p className="font-medium">{service.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {service.price} {service.priceLabel}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild size="lg" variant="secondary">
            <a href="#services">Browse All Services</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
