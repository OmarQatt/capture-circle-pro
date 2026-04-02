import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Film, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "Locations", href: "/locations" },
  { label: "Equipment", href: "/equipment" },
  { label: "Models", href: "/models" },
  { label: "Crew", href: "/crew" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Film className="h-7 w-7 text-primary" />
          <span className="font-display text-2xl tracking-wider text-foreground">
            PROD<span className="text-primary">HUB</span>
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
                  <User className="h-4 w-4" /> Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-gradient-gold font-semibold text-primary-foreground hover:opacity-90">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
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
                  <Button variant="ghost" className="w-full gap-2"><User className="h-4 w-4" /> Dashboard</Button>
                </Link>
                <Button variant="ghost" className="w-full gap-2" onClick={() => { handleSignOut(); setOpen(false); }}>
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full">Sign In</Button>
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-gradient-gold text-primary-foreground">Get Started</Button>
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
