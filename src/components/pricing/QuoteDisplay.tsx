import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';
import ProjectSubmissionModal from '@/components/projects/ProjectSubmissionModal';

const QuoteDisplay = () => {
  const { currentQuote, selectedExpert } = useAppContext();
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  const handleGetStarted = () => {
    if (!user) {
      console.log('[QuoteDisplay] User not authenticated, showing auth modal');
      setAuthModalOpen(true);
      return;
    }

    console.log('[QuoteDisplay] Opening project submission form');
    console.log('[QuoteDisplay] Quote:', currentQuote);
    console.log('[QuoteDisplay] Selected Expert:', selectedExpert);
    console.log('[QuoteDisplay] User:', user);
    setProjectModalOpen(true);
  };

  return (
    <div className="quote-card">
      <h3>Your Custom Quote</h3>

      {currentQuote ? (
        <>
          {/* Price Breakdown */}
          <div className="quote-breakdown">
            {currentQuote.breakdown.map((item, index) => (
              <div key={index} className="quote-row">
                <span>{item.label}</span>
                <span>${item.amount}</span>
              </div>
            ))}
          </div>

          {/* Final Price */}
          <div>
            <div className="quote-price">
              ${currentQuote.finalPrice}
            </div>
            <div className="quote-delivery">
              Delivery: {currentQuote.turnaroundTime}
            </div>
          </div>

          {/* Selected Expert Info */}
          {selectedExpert && (
            <div className="quote-expert">
              <div className="quote-expert-avatar">
                {selectedExpert.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="quote-expert-name">{selectedExpert.name}</div>
                <div className="quote-expert-label">Your selected expert</div>
              </div>
            </div>
          )}

          {/* What's Included */}
          <div className="quote-includes">
            <p>What's included:</p>
            <ul>
              <li>
                <Check size={16} strokeWidth={3} />
                Expert human review
              </li>
              <li>
                <Check size={16} strokeWidth={3} />
                Unlimited revisions
              </li>
              <li>
                <Check size={16} strokeWidth={3} />
                100% satisfaction guarantee
              </li>
            </ul>
          </div>

          <Button
            onClick={handleGetStarted}
            style={{ width: '100%' }}
            size="lg"
            variant="cta"
            disabled={!selectedExpert}
          >
            {!selectedExpert
              ? 'Select an Expert First'
              : !user
              ? 'Sign In to Continue'
              : 'Get Started'}
          </Button>

          <div className="quote-note">
            Secure payment &middot; Money-back guarantee
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Configure your project to see pricing</p>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="signup"
      />

      {/* Project Submission Modal */}
      <ProjectSubmissionModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
      />
    </div>
  );
};

export default QuoteDisplay;
