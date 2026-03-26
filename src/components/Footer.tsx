import { Link } from "react-router-dom";
import { Film } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card/50">
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Film className="h-6 w-6 text-primary" />
            <span className="font-display text-xl text-foreground">PROD<span className="text-primary">HUB</span></span>
          </div>
          <p className="text-sm text-muted-foreground">
            The marketplace for production professionals. Find locations, equipment, talent, and crew.
          </p>
        </div>
        <div>
          <h4 className="font-display text-lg text-foreground mb-3">Services</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/locations" className="hover:text-primary">Locations</Link>
            <Link to="/equipment" className="hover:text-primary">Equipment</Link>
            <Link to="/models" className="hover:text-primary">Models & Casting</Link>
            <Link to="/crew" className="hover:text-primary">Crew</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-lg text-foreground mb-3">Company</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-primary">About</Link>
            <Link to="/contact" className="hover:text-primary">Contact</Link>
            <Link to="/policies" className="hover:text-primary">Policies</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-lg text-foreground mb-3">Legal</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-primary">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ProdHub. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
