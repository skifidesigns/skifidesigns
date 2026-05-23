import React, { useState, useEffect } from 'react';
import { Calendar, Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, login, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBookCall = () => {
    window.open('https://cal.com/skifi/30min', '_blank');
  };

  const scrollToSection = (sectionId) => {
    if (!isHome) {
      navigate(`/#${sectionId}`);
      setIsMobileMenuOpen(false);
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Services', id: 'services', type: 'scroll' },
    { label: 'Portfolio', id: 'portfolio', type: 'scroll' },
    { label: 'Pricing', id: 'pricing', type: 'scroll' },
    { label: 'Resources', path: '/resources', type: 'route' },
    { label: 'FAQ', id: 'faq', type: 'scroll' }
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/90 backdrop-blur-lg border-b border-border shadow-xl'
            : 'bg-transparent'
        }`}
      >
      <nav className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => {
              if (isHome) window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center cursor-pointer"
            aria-label="SkiFi Designs Home"
            data-testid="header-logo"
          >
            <img
              src={theme === 'dark' 
                ? "https://customer-assets.emergentagent.com/job_4d8ff9b3-24bd-4129-8ede-3c7cee7e66af/artifacts/hrib62cx_logo-b.svg"
                : "https://customer-assets.emergentagent.com/job_presentation-studio-22/artifacts/xoisqdyd_logo.svg"
              }
              alt="SkiFi Designs"
              className="h-7 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              link.type === 'route' ? (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`font-medium transition-colors duration-200 ${
                    location.pathname === link.path
                      ? 'text-[#2A7AFE]'
                      : 'text-foreground/80 hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-foreground/80 hover:text-foreground font-medium transition-colors duration-200"
                >
                  {link.label}
                </button>
              )
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-accent transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-foreground" />
              )}
            </button>

            {/* User / Login */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-accent/50">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#2A7AFE] text-white flex items-center justify-center text-xs font-semibold">
                      {(user.name || user.email)[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                    {user.name || user.email}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                  aria-label="Logout"
                  data-testid="header-logout"
                >
                  <LogOut className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                data-testid="header-login"
                onClick={login}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors px-3 py-2"
              >
                Sign in
              </button>
            )}

            {/* CTA Button */}
            <Button
              onClick={handleBookCall}
              className="bg-[#2A7AFE] hover:bg-[#3B82F6] text-white px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50 group"
            >
              <Calendar className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
              Book a Call
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-accent transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-foreground" />
              )}
            </button>
            <button
              className="text-foreground p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                link.type === 'route' ? (
                  <Link
                    key={link.label}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-foreground/80 hover:text-foreground font-medium transition-colors duration-200 text-left"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="text-foreground/80 hover:text-foreground font-medium transition-colors duration-200 text-left"
                  >
                    {link.label}
                  </button>
                )
              ))}
              {user ? (
                <button onClick={logout} className="text-left text-sm font-medium text-foreground/80">
                  Sign out ({user.name || user.email})
                </button>
              ) : (
                <button onClick={login} className="text-left text-sm font-medium text-foreground/80">
                  Sign in with Google
                </button>
              )}
              <Button
                onClick={handleBookCall}
                className="bg-[#2A7AFE] hover:bg-[#3B82F6] text-white w-full mt-2"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book a Call
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
    </>
  );
};
