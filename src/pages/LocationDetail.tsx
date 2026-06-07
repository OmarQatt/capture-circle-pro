import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowLeft, Shield, Loader2, Navigation, Clock, Tag, CalendarDays, Images } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api, { resolveImageUrl } from "@/integrations/api/client";
import BookingDialog from "@/components/BookingDialog";
import ImageLightbox from "@/components/ImageLightbox";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const fallbackImage = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80";
const fallbackAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80";

const LocationDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  const { data: location, isLoading } = useQuery({
    queryKey: ["location", id],
    queryFn: () => api.get<any>(`/api/locations/${id}`),
  });

  if (isLoading) return (
    <Layout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>
  );
  if (!location) return (
    <Layout>
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Location not found.</p>
        <Link to="/locations" className="text-primary hover:underline mt-4 inline-block">Back to Locations</Link>
      </div>
    </Layout>
  );

  const ownerName = `${location.first_name || ""} ${location.last_name || ""}`.trim() || "Unknown";
  const images = location.images?.length > 0 ? location.images : [fallbackImage];
  const resolvedImages = images.map(resolveImageUrl);
  const memberSince = location.created_at ? new Date(location.created_at).getFullYear() : null;

  const priceTiers = [
    location.price_per_6hours  ? { label: "6 Hours",   price: Number(location.price_per_6hours) }  : null,
    location.price_per_12hours ? { label: "12 Hours",  price: Number(location.price_per_12hours) } : null,
    location.price_per_day     ? { label: "Full Day",  price: Number(location.price_per_day) }     : null,
  ].filter(Boolean) as { label: string; price: number }[];

  const mapsUrl = location.latitude && location.longitude
    ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
    : location.address
    ? `https://www.google.com/maps/search/${encodeURIComponent([location.address, location.city, location.country].filter(Boolean).join(", "))}`
    : null;

  return (
    <>
    {lightbox && (
      <ImageLightbox images={lightbox.images} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />
    )}
    <Layout>
      <div className="container py-8">
        <Link to="/locations" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Locations
        </Link>

        <div className="grid gap-10 lg:grid-cols-3">

          {/* ── Left column ─────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Image gallery */}
            <div>
              {images.length === 1 ? (
                <div className="overflow-hidden rounded-xl cursor-zoom-in"
                  onClick={() => setLightbox({ images: resolvedImages, index: 0 })}>
                  <img src={resolvedImages[0]} alt={location.name}
                    className="h-[420px] w-full object-cover transition-transform hover:scale-[1.02] duration-500" />
                </div>
              ) : (
                <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] overflow-hidden rounded-xl">
                  {/* Main large image */}
                  <div className="col-span-2 row-span-2 overflow-hidden cursor-zoom-in"
                    onClick={() => setLightbox({ images: resolvedImages, index: 0 })}>
                    <img src={resolvedImages[0]} alt={location.name}
                      className="h-full w-full object-cover transition-transform hover:scale-105 duration-500" />
                  </div>
                  {/* Thumbnails */}
                  {resolvedImages.slice(1, 5).map((img, i) => (
                    <div key={i} className="relative overflow-hidden cursor-zoom-in"
                      onClick={() => setLightbox({ images: resolvedImages, index: i + 1 })}>
                      <img src={img} alt="" className="h-full w-full object-cover transition-transform hover:scale-105 duration-500" />
                      {i === 3 && images.length > 5 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <span className="flex items-center gap-1.5 text-white font-semibold text-sm">
                            <Images className="h-4 w-4" /> +{images.length - 5} more
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {images.length > 1 && (
                <button
                  onClick={() => setLightbox({ images: resolvedImages, index: 0 })}
                  className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Images className="h-3.5 w-3.5" /> View all {images.length} photos
                </button>
              )}
            </div>

            {/* Title + badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="font-display text-4xl text-foreground leading-tight">{location.name}</h1>
                {location.category && (
                  <Badge variant="secondary" className="capitalize text-sm px-3 py-1">{location.category}</Badge>
                )}
              </div>

              {/* Key facts strip */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-b border-border pb-4">
                {location.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    {[location.city, location.country].filter(Boolean).join(", ")}
                  </span>
                )}
                {location.category && (
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-4 w-4 text-primary" />
                    {location.category}
                  </span>
                )}
                {priceTiers.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    From ${Math.min(...priceTiers.map(t => t.price))} / session
                  </span>
                )}
              </div>
            </div>

            {/* About */}
            <div className="space-y-3">
              <h2 className="font-display text-xl text-foreground">About this location</h2>
              <p className="text-muted-foreground leading-relaxed">
                {location.description || "No description has been provided for this location."}
              </p>
            </div>

            {/* Location */}
            {(location.address || location.city || location.country || mapsUrl) && (
              <div className="space-y-3">
                <h2 className="font-display text-xl text-foreground">Where you'll be</h2>
                <div className="rounded-xl border border-border/50 bg-card p-5 space-y-3">
                  {location.address && (
                    <p className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {location.address}
                    </p>
                  )}
                  {(location.city || location.country) && (
                    <p className="text-sm text-muted-foreground ps-6">
                      {[location.city, location.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {mapsUrl && (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                      <Navigation className="h-4 w-4" /> View on Google Maps
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Owner card (mobile — shown below content on small screens, hidden on lg) */}
            <div className="lg:hidden">
              <OwnerCard
                ownerName={ownerName}
                userId={location.user_id}
                avatarUrl={location.avatar_url}
                memberSince={memberSince}
              />
            </div>
          </div>

          {/* ── Right column (sticky sidebar) ─────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">

              {/* Booking card */}
              <Card className="border-border/50 shadow-gold">
                <CardContent className="p-6 space-y-5">
                  {/* Price */}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Starting from</p>
                    <p className="text-3xl font-bold text-primary">
                      ${priceTiers.length > 0 ? Math.min(...priceTiers.map(t => t.price)) : 0}
                      <span className="text-sm text-muted-foreground font-normal ms-1">
                        / {priceTiers.find(t => t.label === "6 Hours") ? "6 hours" : "day"}
                      </span>
                    </p>
                    {priceTiers.length > 1 && (
                      <div className="mt-2 space-y-1">
                        {priceTiers.map(tier => (
                          <div key={tier.label} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{tier.label}</span>
                            <span className="font-semibold text-foreground">${tier.price}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  {user?.id === location.user_id ? (
                    <Button disabled className="w-full bg-gradient-gold text-primary-foreground font-semibold opacity-50 cursor-not-allowed">
                      Your Listing
                    </Button>
                  ) : (
                    <BookingDialog
                      serviceId={location.id}
                      serviceType="location"
                      providerId={location.user_id}
                      pricePerDay={Number(location.price_per_day) || 0}
                      pricePer6Hours={location.price_per_6hours ? Number(location.price_per_6hours) : undefined}
                      pricePer12Hours={location.price_per_12hours ? Number(location.price_per_12hours) : undefined}
                    />
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
                    Verified listing · Secure booking
                  </div>
                </CardContent>
              </Card>

              {/* Owner card (desktop) */}
              <div className="hidden lg:block">
                <OwnerCard
                  ownerName={ownerName}
                  userId={location.user_id}
                  avatarUrl={location.avatar_url}
                  memberSince={memberSince}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
    </>
  );
};

const OwnerCard = ({ ownerName, userId, avatarUrl, memberSince }: {
  ownerName: string; userId: string; avatarUrl?: string; memberSince: number | null;
}) => (
  <Card className="border-border/50">
    <CardContent className="p-5">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Listed by</p>
      <Link to={`/profile/${userId}`} className="flex items-center gap-3 group">
        <img
          src={resolveImageUrl(avatarUrl || fallbackAvatar)}
          alt={ownerName}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/50 transition-all"
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackAvatar; }}
        />
        <div>
          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{ownerName}</p>
          {memberSince && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" /> Member since {memberSince}
            </p>
          )}
        </div>
      </Link>
    </CardContent>
  </Card>
);

export default LocationDetail;
