import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard, Shield, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import { servicesApi } from '@/services/servicesApi';
import { Service } from '@/types';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [services, setServices] = useState<Service[]>([]);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  // Fetch services on mount
  useEffect(() => {
    const fetchServices = async () => {
      const data = await servicesApi.getAll();
      setServices(data);
    };
    fetchServices();
  }, []);

  const handleServiceClick = (serviceId: string) => {
    navigate(`/services/${serviceId}`);
    setIsMobileMenuOpen(false);
    setMobileServicesOpen(false);
  };

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'How It Works', href: '#how' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' },
  ];

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm shadow-sm">
      <nav className="max-w-[1400px] mx-auto px-[5%] py-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-4">
          <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center text-accent-foreground font-extrabold text-lg">
            e
          </div>
          <span className="font-display text-2xl font-extrabold text-foreground">eydits</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-sm font-medium text-primary-700 hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-4 rounded"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop Get Quote Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="hidden md:inline-flex gap-2" variant="cta">
              Get Your Free Quote
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {services.map((service) => (
              <DropdownMenuItem
                key={service.id}
                onClick={() => handleServiceClick(service.id)}
                className="cursor-pointer py-3"
              >
                <div>
                  <p className="font-medium">{service.title}</p>
                  <p className="text-xs text-muted-foreground">{service.price} {service.priceLabel}</p>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Auth Buttons */}
        {!loading && (
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-neutral-100 rounded-lg">
                  <User className="w-4 h-4 text-primary-700" />
                  <span className="text-sm font-medium text-primary-700">
                    {user.fullName || user.email}
                  </span>
                </div>
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <Link to={user.role === 'admin' ? '/admin' : '/dashboard'}>
                    {user.role === 'admin' ? (
                      <Shield className="w-4 h-4" />
                    ) : (
                      <LayoutDashboard className="w-4 h-4" />
                    )}
                    {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                  </Link>
                </Button>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => handleAuthClick('signin')}
                  variant="outline"
                  size="sm"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => handleAuthClick('signup')}
                  variant="cta"
                  size="sm"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        )}

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-foreground" />
          ) : (
            <Menu className="w-6 h-6 text-foreground" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border px-[5%] py-4">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="block text-sm font-medium text-primary-700 hover:text-accent transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Button
                className="w-full gap-2"
                variant="cta"
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
              >
                Get Your Free Quote
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} />
              </Button>
              {mobileServicesOpen && (
                <ul className="mt-2 space-y-1 bg-neutral-50 rounded-lg p-2">
                  {services.map((service) => (
                    <li key={service.id}>
                      <button
                        onClick={() => handleServiceClick(service.id)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-100 transition-colors"
                      >
                        <p className="font-medium text-sm">{service.title}</p>
                        <p className="text-xs text-muted-foreground">{service.price} {service.priceLabel}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            {!loading && (
              <>
                {user ? (
                  <>
                    <li className="px-4 py-2 bg-neutral-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary-700" />
                        <span className="text-sm font-medium text-primary-700">
                          {user.fullName || user.email}
                        </span>
                      </div>
                    </li>
                    <li>
                      <Button asChild variant="outline" className="w-full gap-2">
                        <Link to={user.role === 'admin' ? '/admin' : '/dashboard'}>
                          {user.role === 'admin' ? (
                            <Shield className="w-4 h-4" />
                          ) : (
                            <LayoutDashboard className="w-4 h-4" />
                          )}
                          {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                        </Link>
                      </Button>
                    </li>
                    <li>
                      <Button
                        onClick={handleSignOut}
                        variant="outline"
                        className="w-full gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </Button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Button
                        onClick={() => handleAuthClick('signin')}
                        variant="outline"
                        className="w-full"
                      >
                        Sign In
                      </Button>
                    </li>
                    <li>
                      <Button
                        onClick={() => handleAuthClick('signup')}
                        variant="cta"
                        className="w-full"
                      >
                        Sign Up
                      </Button>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </header>
  );
};

export default Header;
