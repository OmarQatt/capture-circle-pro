import Layout from "@/components/Layout";
import { Film, Shield, Users, MapPin, Camera, CheckCircle, Star } from "lucide-react";

const About = () => (
  <Layout>
    {/* Hero */}
    <section className="border-b border-border bg-card/30 py-20">
      <div className="container max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
          <Film className="h-4 w-4" /> About PreProduction
        </div>
        <h1 className="font-display text-4xl text-foreground sm:text-5xl">
          The Marketplace Built for <span className="text-gradient-gold">Film Makers</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
          PreProduction connects filmmakers, directors, and production companies with verified locations, professional equipment, talented models, and experienced crew — all in one place.
        </p>
      </div>
    </section>

    {/* Mission */}
    <section className="py-16">
      <div className="container max-w-4xl">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div>
            <h2 className="font-display text-3xl text-foreground">Our Mission</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We built PreProduction to solve a real problem: finding the right people and places for your production is time-consuming, fragmented, and unreliable. Our platform brings everything under one roof — reviewed, verified, and bookable online.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Whether you're shooting a feature film, a commercial, a music video, or a social media campaign, PreProduction helps you move faster from concept to camera.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: MapPin, label: "Verified Locations", desc: "Studios, outdoor sets, and unique spaces" },
              { icon: Camera, label: "Pro Equipment", desc: "Cameras, lenses, lighting, and audio gear" },
              { icon: Users, label: "Talented Crew", desc: "DPs, gaffers, editors, sound engineers" },
              { icon: Star, label: "Vetted Models", desc: "Professional talent for every project" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-4 space-y-2">
                <Icon className="h-6 w-6 text-primary" />
                <p className="font-semibold text-foreground text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="border-t border-border bg-card/30 py-16">
      <div className="container max-w-4xl">
        <h2 className="font-display text-3xl text-foreground text-center mb-12">How It Works</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { step: "01", title: "Browse & Discover", desc: "Search locations, equipment, crew, and talent using our filters. Every listing is admin-reviewed before going live." },
            { step: "02", title: "Request & Pay", desc: "Select your dates, choose your duration, and submit a booking request with our secure built-in payment flow." },
            { step: "03", title: "Confirm & Shoot", desc: "The owner reviews and confirms your booking. Once approved, you're ready to go — focus on the creative work." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/30">
                <span className="font-display text-primary font-bold">{step}</span>
              </div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Why us */}
    <section className="py-16">
      <div className="container max-w-3xl">
        <h2 className="font-display text-3xl text-foreground text-center mb-10">Why PreProduction</h2>
        <div className="space-y-4">
          {[
            { title: "Admin-Verified Listings", desc: "Every location, equipment listing, crew profile, and talent profile is manually reviewed and approved by our team before it goes public." },
            { title: "Transparent Pricing", desc: "All prices are displayed upfront — per 6 hours, 12 hours, or full day. No hidden fees or surprise charges at checkout." },
            { title: "Secure Booking Flow", desc: "Booking requests go through our platform so both parties have a record, dispute protection, and a clear paper trail." },
            { title: "Built for the Region", desc: "PreProduction is designed with local production needs in mind, supporting both Arabic and English and tailored to the regional market." },
            { title: "Free to List", desc: "Listing your location, equipment, or profile is completely free. You only pay when a booking is confirmed." },
          ].map(({ title, desc }) => (
            <div key={title} className="flex gap-4 rounded-xl border border-border bg-card p-5">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Trust badge */}
    <section className="border-t border-border bg-card/30 py-12">
      <div className="container max-w-2xl text-center space-y-3">
        <Shield className="h-10 w-10 text-primary mx-auto" />
        <h3 className="font-display text-2xl text-foreground">Trusted by Production Professionals</h3>
        <p className="text-muted-foreground">
          From independent filmmakers to full production houses, PreProduction is the go-to platform for sourcing everything your production needs — fast, reliably, and professionally.
        </p>
      </div>
    </section>
  </Layout>
);

export default About;
