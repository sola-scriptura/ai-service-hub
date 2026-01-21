import ServiceCard from '@/components/ServiceCard';
import SectionHeader from '@/components/SectionHeader';
import { useServices } from '@/hooks/useServices';

const Services = () => {
  const { data: services = [], isLoading, error } = useServices();

  if (isLoading) {
    return (
      <section className="py-24 px-[5%] bg-white" id="services">
        <div className="max-w-[1400px] mx-auto">
          <SectionHeader
            label="Our Services"
            title="Expert human review for every AI output type"
            subtitle="From legal documents to video editing, our vetted professionals ensure your AI work meets the highest standards"
          />
          <div className="text-center py-12">
            <p className="text-primary-600">Loading services...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 px-[5%] bg-white" id="services">
        <div className="max-w-[1400px] mx-auto">
          <SectionHeader
            label="Our Services"
            title="Expert human review for every AI output type"
            subtitle="From legal documents to video editing, our vetted professionals ensure your AI work meets the highest standards"
          />
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load services. Please refresh the page.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-[5%] bg-white" id="services">
      <div className="max-w-[1400px] mx-auto">
        <SectionHeader
          label="Our Services"
          title="Expert human review for every AI output type"
          subtitle="From legal documents to video editing, our vetted professionals ensure your AI work meets the highest standards"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
