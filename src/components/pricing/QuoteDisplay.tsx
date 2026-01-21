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
    <div className="sticky top-32 bg-white rounded-2xl p-8 border-2 border-accent/20 shadow-lg">
      <h3 className="font-display text-xl font-bold mb-6">Your Custom Quote</h3>

      {currentQuote ? (
        <>
          {/* Price Breakdown */}
          <div className="space-y-3 mb-6 pb-6 border-b border-neutral-200">
            {currentQuote.breakdown.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-primary-700">{item.label}</span>
                <span className="font-semibold">${item.amount}</span>
              </div>
            ))}
          </div>

          {/* Final Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-display text-4xl font-extrabold text-foreground">
                ${currentQuote.finalPrice}
              </span>
            </div>
            <p className="text-sm text-primary-600">
              Delivery: {currentQuote.turnaroundTime}
            </p>
          </div>

          {/* Selected Expert Info */}
          {selectedExpert && (
            <div className="mb-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {selectedExpert.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-sm">{selectedExpert.name}</p>
                  <p className="text-xs text-primary-600">Your selected expert</p>
                </div>
              </div>
            </div>
          )}

          {/* What's Included */}
          <div className="mb-6">
            <p className="text-sm font-semibold mb-3">What's included:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-primary-700">
                <Check className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" strokeWidth={3} />
                Expert human review
              </li>
              <li className="flex items-start gap-2 text-sm text-primary-700">
                <Check className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" strokeWidth={3} />
                Unlimited revisions
              </li>
              <li className="flex items-start gap-2 text-sm text-primary-700">
                <Check className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" strokeWidth={3} />
                100% satisfaction guarantee
              </li>
            </ul>
          </div>

          <Button 
            onClick={handleGetStarted}
            className="w-full" 
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

          <p className="text-xs text-center text-primary-500 mt-4">
            Secure payment • Money-back guarantee
          </p>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-primary-600">Configure your project to see pricing</p>
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
