import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Film, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();

  const navLinks = [
    { label: t('nav.locations'), href: "/locations" },
    { label: t('nav.equipment'), href: "/equipment" },
    { label: t('nav.models'), href: "/models" },
    { label: t('nav.crew'), href: "/crew" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Film className="h-7 w-7 text-primary" />
          <span className="font-display text-2xl tracking-wider text-foreground">
            Pre<span className="text-primary">Production</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" /> {t('nav.dashboard')}
                </Button>
              </Link>
              <Link to={`/profile/${user.id}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  {t('nav.myProfile')}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" /> {t('nav.signOut')}
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">{t('nav.signIn')}</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-gradient-gold font-semibold text-primary-foreground hover:opacity-90">
                  {t('nav.getStarted')}
                </Button>
              </Link>
            </>
          )}
          <button
            onClick={toggleLanguage}
            className="min-w-[2.5rem] rounded-md border border-border/60 px-2.5 py-1 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            title={i18n.language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            {t('nav.language')}
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleLanguage}
            className="rounded-md border border-border/60 px-2 py-1 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary"
          >
            {t('nav.language')}
          </button>
          <button onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background p-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-2">
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full gap-2"><User className="h-4 w-4" /> {t('nav.dashboard')}</Button>
                </Link>
                <Link to={`/profile/${user.id}`} onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full">{t('nav.myProfile')}</Button>
                </Link>
                <Button variant="ghost" className="w-full gap-2" onClick={() => { handleSignOut(); setOpen(false); }}>
                  <LogOut className="h-4 w-4" /> {t('nav.signOut')}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full">{t('nav.signIn')}</Button>
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-gradient-gold text-primary-foreground">{t('nav.getStarted')}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
