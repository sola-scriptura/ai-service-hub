import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/auth/AuthModal';

const CTASection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const pendingNavigate = useRef(false);

  useEffect(() => {
    if (user && pendingNavigate.current) {
      pendingNavigate.current = false;
      setAuthModalOpen(false);
      navigate('/start-project');
    }
  }, [user, navigate]);

  const handleStartProject = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      pendingNavigate.current = true;
      setAuthModalOpen(true);
      return;
    }
    navigate('/start-project');
  };

  const handleAuthClose = () => {
    pendingNavigate.current = false;
    setAuthModalOpen(false);
  };

  return (
    <>
      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">Ready to ship perfect?</h2>
          <p className="cta-sub">
            Join 10,000+ professionals who trust eydits to review their AI outputs before they go
            live.
          </p>
          <div className="cta-buttons">
            <a href="#" className="btn btn-primary btn-shimmer" onClick={handleStartProject}>
              Start Your First Project
            </a>
            <a href="#how" className="btn btn-secondary">
              How It Works
            </a>
          </div>
          <p className="cta-note">
            24-hour turnaround · 99.8% satisfaction · Unlimited revisions
          </p>
        </div>
      </section>

      <AuthModal
        open={authModalOpen}
        onClose={handleAuthClose}
        defaultMode="signup"
      />
    </>
  );
};

export default CTASection;
