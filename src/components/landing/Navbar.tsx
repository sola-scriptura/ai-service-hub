import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/auth/AuthModal';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const pendingNavigate = useRef(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigate to start-project after successful auth
  useEffect(() => {
    if (user && pendingNavigate.current) {
      pendingNavigate.current = false;
      setAuthModalOpen(false);
      navigate('/start-project');
    }
  }, [user, navigate]);

  const closeMenu = () => setMenuOpen(false);

  const handleStartProject = (e: React.MouseEvent) => {
    e.preventDefault();
    closeMenu();
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

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    closeMenu();
    await signOut();
    navigate('/');
  };

  const handleDashboard = (e: React.MouseEvent) => {
    e.preventDefault();
    closeMenu();
    navigate('/dashboard');
  };

  return (
    <>
      <nav className={scrolled ? 'scrolled' : ''}>
        <div className="nav-inner">
          <a href="/" className="logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            <span className="logo-mark">e</span>
            <span className="logo-text">eydits</span>
          </a>
          {!user && (
            <ul className="nav-links">
              <li><a href="#how">How it Works</a></li>
              <li><a href="#experts">Experts</a></li>
              <li><a href="#usecases">Use Cases</a></li>
              <li><a href="#features">Why eydits</a></li>
              <li><a href="#testimonials">Results</a></li>
            </ul>
          )}
          {user ? (
            <div className="nav-auth-group">
              <a href="/dashboard" className="nav-cta" onClick={handleDashboard}>
                Dashboard
              </a>
              <a href="#" className="nav-cta" onClick={handleStartProject}>Start a Project</a>
            </div>
          ) : (
            <a href="#" className="nav-cta" onClick={handleStartProject}>Start a Project</a>
          )}

          <button
            className="nav-menu-btn"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span><span></span>
          </button>
        </div>

        <div className={`nav-sheet${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
          {!user && (
            <>
              <a href="#how" onClick={closeMenu}>How it Works</a>
              <a href="#experts" onClick={closeMenu}>Experts</a>
              <a href="#usecases" onClick={closeMenu}>Use Cases</a>
              <a href="#features" onClick={closeMenu}>Why eydits</a>
              <a href="#testimonials" onClick={closeMenu}>Results</a>
            </>
          )}
          {user && (
            <a href="/dashboard" className="nav-sheet-link" onClick={handleDashboard}>
              Dashboard
            </a>
          )}
          <a href="#" className="nav-sheet-cta" onClick={handleStartProject}>Start a Project</a>
          {user && (
            <a href="#" className="nav-sheet-signout" onClick={handleSignOut}>
              Sign Out
            </a>
          )}
        </div>
        <div
          className={`nav-backdrop${menuOpen ? ' open' : ''}`}
          aria-hidden="true"
          onClick={closeMenu}
        />
      </nav>

      <AuthModal
        open={authModalOpen}
        onClose={handleAuthClose}
        defaultMode="signup"
      />
    </>
  );
};

export default Navbar;
