import { Link } from "react-router-dom";
import { Film } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Film className="h-6 w-6 text-primary" />
              <span className="font-display text-xl text-foreground">Pre<span className="text-primary">Production</span></span>
            </div>
            <p className="text-sm text-muted-foreground">{t('footer.tagline')}</p>
          </div>
          <div>
            <h4 className="font-display text-lg text-foreground mb-3">{t('footer.services')}</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/locations" className="hover:text-primary">{t('nav.locations')}</Link>
              <Link to="/equipment" className="hover:text-primary">{t('nav.equipment')}</Link>
              <Link to="/models" className="hover:text-primary">{t('nav.models')} & Casting</Link>
              <Link to="/crew" className="hover:text-primary">{t('nav.crew')}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display text-lg text-foreground mb-3">{t('footer.company')}</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-primary">{t('footer.about')}</Link>
              <Link to="/contact" className="hover:text-primary">{t('footer.contact')}</Link>
              <Link to="/policies" className="hover:text-primary">{t('footer.policies')}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display text-lg text-foreground mb-3">{t('footer.legal')}</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-primary">{t('footer.terms')}</Link>
              <Link to="/privacy" className="hover:text-primary">{t('footer.privacy')}</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} PreProduction. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
