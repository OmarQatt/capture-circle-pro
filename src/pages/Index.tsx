import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { MapPin, Camera, Users, Clapperboard, Star, ArrowRight, Shield, Clock, CheckCircle } from "lucide-react";

const services = [
  { icon: MapPin, title: "Filming Locations", desc: "Discover unique venues — studios, rooftops, villas, deserts — verified by our team.", link: "/locations" },
  { icon: Camera, title: "Equipment Rental", desc: "Professional cameras, lighting, grip, and sound gear from trusted companies.", link: "/equipment" },
  { icon: Users, title: "Models & Casting", desc: "Browse talent by look, experience, and availability for your next shoot.", link: "/models" },
  { icon: Clapperboard, title: "Crew Hire", desc: "Find DPs, ACs, photographers, and specialists — filter by role and availability.", link: "/crew" },
];

const steps = [
  { num: "01", title: "Browse & Filter", desc: "Search locations, equipment, talent, or crew with powerful filters." },
  { num: "02", title: "Check Availability", desc: "View real-time calendars and select your preferred dates and times." },
  { num: "03", title: "Book & Pay", desc: "Secure your booking with transparent pricing and commission-based fees." },
  { num: "04", title: "Shoot & Review", desc: "Complete your production and leave reviews for the community." },
];

const stats = [
  { value: "500+", label: "Locations" },
  { value: "1,200+", label: "Equipment" },
  { value: "800+", label: "Talent" },
  { value: "350+", label: "Crew" },
];

const Index = () => (
  <Layout>
    {/* Hero */}
    <section className="relative flex min-h-[85vh] items-center overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&q=80')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
      <div className="container relative z-10">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
            Production Marketplace
          </p>
          <h1 className="font-display text-5xl leading-tight text-foreground sm:text-7xl">
            Everything Your<br />
            <span className="text-gradient-gold">Production Needs</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            The all-in-one marketplace connecting filmmakers with locations, equipment, talent, and crew.
            Book with confidence — every listing is verified.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-gold text-lg font-semibold text-primary-foreground shadow-gold hover:opacity-90">
                Start Booking <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/locations">
              <Button size="lg" variant="outline" className="text-lg">
                Explore Locations
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="border-y border-border bg-card/50 py-12">
      <div className="container grid grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-4xl text-primary">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Services */}
    <section className="py-24">
      <div className="container">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Our Services</p>
          <h2 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
            Four Pillars of Production
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <Link to={s.link} key={s.title}>
              <Card className="group h-full border-border/50 bg-card transition-all hover:border-primary/50 hover:shadow-gold">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <s.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                  <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Browse <ArrowRight className="ml-1 h-4 w-4" />
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
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">How It Works</p>
          <h2 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">Simple & Transparent</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.num} className="relative">
              <span className="font-display text-6xl text-primary/15">{s.num}</span>
              <h3 className="mt-2 font-display text-xl text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
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
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Why ProdHub</p>
            <h2 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">Built for Trust</h2>
            <div className="mt-8 space-y-6">
              {[
                { icon: Shield, title: "Verified Listings", desc: "Every location is reviewed by our admin team before going live." },
                { icon: Clock, title: "Real-Time Availability", desc: "Live calendars so you never double-book." },
                { icon: Star, title: "Reviews & Ratings", desc: "Community-driven feedback on every service." },
                { icon: CheckCircle, title: "Equipment Protection", desc: "Photo evidence policy protects both parties." },
              ].map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{f.title}</h4>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src="https://images.unsplash.com/photo-1540655037529-dec987b21078?w=800&q=80"
              alt="Film crew at work"
              className="h-[500px] w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="border-t border-border bg-card/50 py-24">
      <div className="container text-center">
        <h2 className="font-display text-4xl text-foreground sm:text-5xl">
          Ready to <span className="text-gradient-gold">Produce</span>?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Join hundreds of production professionals already using ProdHub to streamline their projects.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-gold text-lg font-semibold text-primary-foreground shadow-gold">
              Create Account
            </Button>
          </Link>
          <Link to="/locations">
            <Button size="lg" variant="outline" className="text-lg">Browse Services</Button>
          </Link>
        </div>
      </div>
    </section>
  </Layout>
);

export default Index;
