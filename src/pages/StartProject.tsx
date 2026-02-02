import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';
import FooterSection from '@/components/landing/FooterSection';
import { useServices } from '@/hooks/useServices';
import { ReactNode } from 'react';

// Icon map: maps the `icon` field from Supabase services to SVG elements
const iconMap: Record<string, ReactNode> = {
  document: (
    <svg viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  ),
  video: (
    <svg viewBox="0 0 24 24">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  ),
  box: (
    <svg viewBox="0 0 24 24">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
};

const defaultIcon = (
  <svg viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const StartProject = () => {
  const { data: services, isLoading, error } = useServices();
  const navigate = useNavigate();

  const handleServiceClick = (serviceId: string) => {
    navigate(`/services/${serviceId}`);
  };

  return (
    <div className="landing-page">
      <Navbar />
      <div className="start-project-page">
        <div className="start-project-inner">
          <div className="start-project-header">
            <h1>Choose a Service</h1>
            <p>
              Select the type of project you need expert review for. Our vetted specialists are
              ready to transform your AI output into production-ready deliverables.
            </p>
          </div>
          {isLoading ? (
            <div className="services-grid-loading">
              <p>Loading services...</p>
            </div>
          ) : error ? (
            <div className="services-grid-error">
              <p>Failed to load services. Please try again.</p>
            </div>
          ) : (
            <div className="services-grid">
              {services?.map((service) => (
                <div
                  key={service.id}
                  className="service-card"
                  onClick={() => handleServiceClick(service.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleServiceClick(service.id);
                    }
                  }}
                >
                  <div className="service-card-icon">
                    {iconMap[service.icon] || defaultIcon}
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <FooterSection />
    </div>
  );
};

export default StartProject;
