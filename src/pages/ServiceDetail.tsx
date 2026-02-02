import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import FooterSection from '@/components/landing/FooterSection';
import { useService } from '@/hooks/useServices';
import ExpertSelector from '@/components/experts/ExpertSelector';
import PriceCalculator from '@/components/pricing/PriceCalculator';
import QuoteDisplay from '@/components/pricing/QuoteDisplay';
import { useAppContext } from '@/context/AppContext';
import { FileText, Edit, Video, Image, Box, Book, ArrowLeft, Check } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  document: FileText,
  edit: Edit,
  video: Video,
  image: Image,
  box: Box,
  book: Book,
};

const ServiceDetail = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { data: service, isLoading, error } = useService(serviceId);
  const { setSelectedService } = useAppContext();

  // Update context when service data is loaded
  useEffect(() => {
    if (service) {
      setSelectedService(service);
    }
  }, [service, setSelectedService]);

  if (isLoading) {
    return (
      <div className="landing-page">
        <Navbar />
        <main className="centered-page">
          <div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading service...</p>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="landing-page">
        <Navbar />
        <main className="centered-page">
          <div>
            <h1>Service Not Found</h1>
            <p>The service you're looking for doesn't exist.</p>
            <Link to="/">Back to Home</Link>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  const Icon = iconMap[service.icon] || FileText;

  return (
    <div className="landing-page">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="page-hero">
          <div className="page-hero-bg" />
          <div className="page-hero-inner">
            <Link to="/" className="back-link">
              <ArrowLeft size={16} />
              Back to Home
            </Link>

            <div className="service-hero-layout">
              <div className="service-hero-icon">
                <Icon size={40} strokeWidth={2} />
              </div>
              <div>
                {service.badge && (
                  <span className="service-badge">{service.badge}</span>
                )}
                <h1>{service.title}</h1>
                <p>{service.description}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Details Section */}
        <section className="detail-section">
          <div className="detail-grid">
            <div className="detail-main">
              {/* What's Included */}
              <div className="detail-block">
                <h2>What's Included</h2>
                <ul className="feature-list">
                  {service.features.map((feature) => (
                    <li key={feature}>
                      <div className="feature-check">
                        <Check size={16} strokeWidth={3} />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Calculator */}
              <PriceCalculator service={service} />

              {/* Expert Selection */}
              <ExpertSelector serviceId={service.id} />

              {/* How It Works */}
              <div className="detail-block">
                <h2>How It Works</h2>
                <div className="process-steps">
                  <div className="process-step">
                    <div className="process-step-num">1</div>
                    <div>
                      <h3>Configure & Select Expert</h3>
                      <p>Choose your project criteria and select your preferred expert.</p>
                    </div>
                  </div>
                  <div className="process-step">
                    <div className="process-step-num">2</div>
                    <div>
                      <h3>Submit Your Project</h3>
                      <p>Upload your AI-generated content through our secure platform.</p>
                    </div>
                  </div>
                  <div className="process-step">
                    <div className="process-step-num">3</div>
                    <div>
                      <h3>Receive Deliverable</h3>
                      <p>Get your polished, production-ready work within the agreed timeframe.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote Display - Sticky Sidebar */}
            <div className="detail-sidebar">
              <QuoteDisplay />
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
};

export default ServiceDetail;
