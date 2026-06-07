import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { MapPin, Camera, Users, Clapperboard, Star, ArrowRight, Shield, Clock, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import MarqueeSection from "@/components/MarqueeSection";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const services = [
    { icon: MapPin, titleKey: "home.services.locations.title", descKey: "home.services.locations.desc", link: "/locations" },
    { icon: Camera, titleKey: "home.services.equipment.title", descKey: "home.services.equipment.desc", link: "/equipment" },
    { icon: Users, titleKey: "home.services.models.title", descKey: "home.services.models.desc", link: "/models" },
    { icon: Clapperboard, titleKey: "home.services.crew.title", descKey: "home.services.crew.desc", link: "/crew" },
  ];

  const steps = [
    { num: "01", titleKey: "home.steps.01.title", descKey: "home.steps.01.desc" },
    { num: "02", titleKey: "home.steps.02.title", descKey: "home.steps.02.desc" },
    { num: "03", titleKey: "home.steps.03.title", descKey: "home.steps.03.desc" },
    { num: "04", titleKey: "home.steps.04.title", descKey: "home.steps.04.desc" },
  ];

  const features = [
    { icon: Shield, titleKey: "home.features.verified.title", descKey: "home.features.verified.desc" },
    { icon: Clock, titleKey: "home.features.realtime.title", descKey: "home.features.realtime.desc" },
    { icon: Star, titleKey: "home.features.reviews.title", descKey: "home.features.reviews.desc" },
    { icon: CheckCircle, titleKey: "home.features.protection.title", descKey: "home.features.protection.desc" },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
        <div className="container relative z-10">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              {t('home.badge')}
            </p>
            <h1 className="font-display text-5xl leading-tight text-foreground sm:text-7xl">
              {t('home.heroLine1')}<br />
              <span className="text-gradient-gold">{t('home.heroLine2')}</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {t('home.heroDesc')}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to={user ? "/locations" : "/signup"}>
                <Button size="lg" className="bg-gradient-gold text-lg font-semibold text-primary-foreground shadow-gold hover:opacity-90">
                  {t('home.startBooking')} <ArrowRight className="ms-2 h-5 w-5 rtl-flip" />
                </Button>
              </Link>
              <Link to="/locations">
                <Button size="lg" variant="outline" className="text-lg">
                  {t('home.exploreLocations')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    

      <MarqueeSection />

      {/* Services */}
      <section className="py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">{t('home.servicesLabel')}</p>
            <h2 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
              {t('home.servicesTitle')}
            </h2>
          </div>
          <div >
            {services.map((s) => (
              <Link to={s.link} key={s.link}>
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <s.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-display text-xl text-foreground">{t(s.titleKey)}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{t(s.descKey)}</p>
                    <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      {t('home.browse')} <ArrowRight className="ms-1 h-4 w-4 rtl-flip" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-border bg-card/30 py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">{t('home.howLabel')}</p>
            <h2 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">{t('home.howTitle')}</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.num} className="relative">
                <span className="font-display text-6xl text-primary/15">{s.num}</span>
                <h3 className="mt-2 font-display text-xl text-foreground">{t(s.titleKey)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(s.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-24">
        <div className="container">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">{t('home.whyLabel')}</p>
              <h2 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">{t('home.whyTitle')}</h2>
              <div className="mt-8 space-y-6">
                {features.map((f) => (
                  <div key={f.titleKey} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{t(f.titleKey)}</h4>
                      <p className="text-sm text-muted-foreground">{t(f.descKey)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80"
                alt="Film crew at work"
                className="h-[500px] w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA — hidden for logged-in users */}
      {!user && <section className="border-t border-border bg-card/50 py-24">
        <div className="container text-center">
          <h2 className="font-display text-4xl text-foreground sm:text-5xl">
            {t('home.ctaTitle')} <span className="text-gradient-gold">{t('home.ctaHighlight')}</span>{t('home.ctaTitleEnd')}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            {t('home.ctaDesc')}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-gold text-lg font-semibold text-primary-foreground shadow-gold">
                {t('home.createAccount')}
              </Button>
            </Link>
            <Link to="/locations">
              <Button size="lg" variant="outline" className="text-lg">{t('home.browseServices')}</Button>
            </Link>
          </div>
        </div>
      </section>}
    </Layout>
  );
};

export default Index;
