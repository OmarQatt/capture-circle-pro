import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import api from "@/integrations/api/client";

/* ─── Fallback images per category ─────────────────────────────────────── */
const FALLBACKS: Record<string, string[]> = {
  locations: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=75",
    "https://images.unsplash.com/photo-1464146072230-91cabc968266?w=700&q=75",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=700&q=75",
    "https://images.unsplash.com/photo-1501183638710-841dd1904471?w=700&q=75",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=700&q=75",
    "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=700&q=75",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700&q=75",
  ],
  equipment: [
    "https://images.unsplash.com/photo-1585506942812-e72b29cef752?w=700&q=75",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=700&q=75",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=75",
    "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=700&q=75",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=700&q=75",
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700&q=75",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=700&q=75",
  ],
  talent: [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&q=75",
    "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=700&q=75",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=700&q=75",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=700&q=75",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=700&q=75",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=700&q=75",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=700&q=75",
  ],
  crew: [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&q=75",
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=700&q=75",
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=700&q=75",
    "https://images.unsplash.com/photo-1519508234439-4f23643125c1?w=700&q=75",
    "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=700&q=75",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=700&q=75",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=700&q=75",
  ],
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const ensureCount = (imgs: string[], min = 10): string[] => {
  if (!imgs.length) return [];
  const out = [...imgs];
  while (out.length < min) out.push(...imgs);
  return out;
};

/* ─── Single marquee row ─────────────────────────────────────────────────── */
interface RowProps {
  title: string;
  subtitle: string;
  link: string;
  images: string[];
  durationSec?: number;
  reverse?: boolean;
}

const MarqueeRow = ({ title, subtitle, link, images, durationSec = 38, reverse = false }: RowProps) => {
  const [paused, setPaused] = useState(false);

  const filled  = ensureCount(images, 10);
  const track   = [...filled, ...filled];

  const animName = reverse ? "marquee-rtl" : "marquee-ltr";

  return (
    <div className="py-5">
      {/* Row header */}
      <div className="container flex items-end justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">{subtitle}</p>
          <h3 className="font-display text-2xl sm:text-3xl text-foreground leading-tight">{title}</h3>
        </div>
        <Link
          to={link}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline shrink-0 mb-1"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Marquee strip */}
      <div
        className="relative overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            width: "max-content",
            animation: `${animName} ${durationSec}s linear infinite`,
            animationPlayState: paused ? "paused" : "running",
            willChange: "transform",
          }}
        >
          {track.map((src, i) => (
            <div
              key={i}
              className="shrink-0 relative overflow-hidden rounded-xl group/img"
              style={{ width: "clamp(180px, 22vw, 300px)", height: "clamp(120px, 15vw, 200px)" }}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Main section ───────────────────────────────────────────────────────── */
const MarqueeSection = () => {
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => api.get<any[]>("/api/locations"),
    staleTime: 5 * 60 * 1000,
  });
  const { data: equipment = [] } = useQuery({
    queryKey: ["equipment"],
    queryFn: () => api.get<any[]>("/api/equipment"),
    staleTime: 5 * 60 * 1000,
  });
  const { data: talent = [] } = useQuery({
    queryKey: ["talent_profiles", "model"],
    queryFn: () => api.get<any[]>("/api/talent"),
    staleTime: 5 * 60 * 1000,
  });
  const { data: crew = [] } = useQuery({
    queryKey: ["crew_profiles"],
    queryFn: () => api.get<any[]>("/api/crew"),
    staleTime: 5 * 60 * 1000,
  });

  const locationImgs = (locations as any[]).flatMap((l) => l.images ?? []).filter(Boolean);
  const equipmentImgs = (equipment as any[]).flatMap((e) => e.images ?? []).filter(Boolean);
  const talentImgs = (talent as any[]).flatMap((t) => t.portfolio_urls ?? []).filter(Boolean);
  const crewImgs = (crew as any[]).flatMap((c) => c.portfolio_urls ?? []).filter(Boolean);

  const rows: RowProps[] = [
    {
      title: "Filming Locations",
      subtitle: "Discover",
      link: "/locations",
      images: locationImgs.length >= 4 ? locationImgs : FALLBACKS.locations,
      durationSec: 42,
      reverse: false,
    },
    {
      title: "Professional Equipment",
      subtitle: "Rent",
      link: "/equipment",
      images: equipmentImgs.length >= 4 ? equipmentImgs : FALLBACKS.equipment,
      durationSec: 32,
      reverse: true,
    },
    {
      title: "Talent & Models",
      subtitle: "Cast",
      link: "/models",
      images: talentImgs.length >= 4 ? talentImgs : FALLBACKS.talent,
      durationSec: 48,
      reverse: false,
    },
    {
      title: "Film Crew",
      subtitle: "Hire",
      link: "/crew",
      images: crewImgs.length >= 4 ? crewImgs : FALLBACKS.crew,
      durationSec: 36,
      reverse: true,
    },
  ];

  return (
    <section className="py-16 overflow-hidden">
      {/* Keyframes — injected once */}
      <style>{`
        @keyframes marquee-ltr {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marquee-rtl {
          from { transform: translate3d(-50%, 0, 0); }
          to   { transform: translate3d(0, 0, 0); }
        }
      `}</style>

      {/* Section heading */}
      <div className="container text-center mb-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Explore</p>
        <h2 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
          Browse Our <span className="text-gradient-gold">Collections</span>
        </h2>
        <p className="mt-3 max-w-lg mx-auto text-muted-foreground">
          Discover top-rated locations, equipment, talent, and crew — all in one place.
        </p>
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <MarqueeRow key={row.title} {...row} />
        ))}
      </div>
    </section>
  );
};

export default MarqueeSection;
