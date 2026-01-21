import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

const AuthModal = ({ open, onClose, defaultMode = 'signin' }: AuthModalProps) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);

  const handleSuccess = () => {
    console.log('[AuthModal] Authentication successful');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <VisuallyHidden>
          <DialogTitle>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</DialogTitle>
          <DialogDescription>
            {mode === 'signin'
              ? 'Sign in to your account to continue'
              : 'Create a new account to get started'}
          </DialogDescription>
        </VisuallyHidden>
        {mode === 'signin' ? (
          <SignInForm
            onSuccess={handleSuccess}
            onSwitchToSignUp={() => setMode('signup')}
          />
        ) : (
          <SignUpForm
            onSuccess={handleSuccess}
            onSwitchToSignIn={() => setMode('signin')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
