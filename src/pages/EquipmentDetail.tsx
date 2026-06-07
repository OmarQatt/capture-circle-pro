import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Loader2, CalendarDays, Images, Tag, Wrench, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api, { resolveImageUrl } from "@/integrations/api/client";
import BookingDialog from "@/components/BookingDialog";
import ImageLightbox from "@/components/ImageLightbox";
import { useAuth } from "@/contexts/AuthContext";

const fallbackImage = "https://images.unsplash.com/photo-1585506942812-e72b29cef752?w=600&q=80";
const fallbackAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80";

const conditionColor: Record<string, string> = {
  excellent: "bg-green-600",
  good:      "bg-blue-600",
  fair:      "bg-amber-600",
  poor:      "bg-red-600",
};

const EquipmentDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  const { data: eq, isLoading } = useQuery({
    queryKey: ["equipment", id],
    queryFn: () => api.get<any>(`/api/equipment/${id}`),
  });

  if (isLoading) return (
    <Layout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>
  );
  if (!eq) return (
    <Layout>
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Equipment not found.</p>
        <Link to="/equipment" className="text-primary hover:underline mt-4 inline-block">Back to Equipment</Link>
      </div>
    </Layout>
  );

  const ownerName = `${eq.first_name || ""} ${eq.last_name || ""}`.trim() || "Unknown";
  const images = eq.images?.length > 0 ? eq.images : [fallbackImage];
  const resolvedImages = images.map(resolveImageUrl);
  const memberSince = eq.created_at ? new Date(eq.created_at).getFullYear() : null;

  const specs = [
    eq.brand    && { label: "Brand",     value: eq.brand },
    eq.model    && { label: "Model",     value: eq.model },
    eq.category && { label: "Category",  value: eq.category },
    eq.condition && { label: "Condition", value: eq.condition },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
    {lightbox && (
      <ImageLightbox images={lightbox.images} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />
    )}
    <Layout>
      <div className="container py-8">
        <Link to="/equipment" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Equipment
        </Link>

        <div className="grid gap-10 lg:grid-cols-3">

          {/* ── Left column ─────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Image gallery */}
            <div>
              {images.length === 1 ? (
                <div className="overflow-hidden rounded-xl bg-muted/20 cursor-zoom-in"
                  onClick={() => setLightbox({ images: resolvedImages, index: 0 })}>
                  <img src={resolvedImages[0]} alt={eq.name}
                    className="h-[380px] w-full object-contain transition-transform hover:scale-[1.02] duration-500" />
                </div>
              ) : (
                <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[380px] overflow-hidden rounded-xl">
                  <div className="col-span-2 row-span-2 overflow-hidden bg-muted/20 cursor-zoom-in"
                    onClick={() => setLightbox({ images: resolvedImages, index: 0 })}>
                    <img src={resolvedImages[0]} alt={eq.name}
                      className="h-full w-full object-contain transition-transform hover:scale-105 duration-500" />
                  </div>
                  {resolvedImages.slice(1, 5).map((img, i) => (
                    <div key={i} className="relative overflow-hidden bg-muted/20 cursor-zoom-in"
                      onClick={() => setLightbox({ images: resolvedImages, index: i + 1 })}>
                      <img src={img} alt="" className="h-full w-full object-contain transition-transform hover:scale-105 duration-500" />
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
                <button onClick={() => setLightbox({ images: resolvedImages, index: 0 })}
                  className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Images className="h-3.5 w-3.5" /> View all {images.length} photos
                </button>
              )}
            </div>

            {/* Title + key facts */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="font-display text-4xl text-foreground leading-tight">{eq.name}</h1>
                <div className="flex gap-2 flex-wrap">
                  {eq.condition && (
                    <Badge className={`${conditionColor[eq.condition] || "bg-muted"} capitalize`}>
                      <Star className="h-3 w-3 mr-1" /> {eq.condition}
                    </Badge>
                  )}
                  <Badge className={eq.status === "available" ? "bg-green-600" : "bg-red-600"}>
                    {eq.status}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-b border-border pb-4">
                {eq.brand && (
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-4 w-4 text-primary" /> {eq.brand}
                    {eq.model && ` · ${eq.model}`}
                  </span>
                )}
                {eq.category && (
                  <span className="flex items-center gap-1.5">
                    <Wrench className="h-4 w-4 text-primary" /> {eq.category}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {eq.description && (
              <div className="space-y-3">
                <h2 className="font-display text-xl text-foreground">About this equipment</h2>
                <p className="text-muted-foreground leading-relaxed">{eq.description}</p>
              </div>
            )}

            {/* Specifications */}
            {specs.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-display text-xl text-foreground">Specifications</h2>
                <div className="rounded-xl border border-border/50 bg-card divide-y divide-border/40">
                  {specs.map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-5 py-3 text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-foreground capitalize">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Owner card (mobile) */}
            <div className="lg:hidden">
              <OwnerCard ownerName={ownerName} userId={eq.user_id} avatarUrl={eq.avatar_url} memberSince={memberSince} />
            </div>
          </div>

          {/* ── Right column (sticky sidebar) ──────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">

              {/* Booking card */}
              <Card className="border-border/50 shadow-gold">
                <CardContent className="p-6 space-y-5">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Daily Rate</p>
                    <p className="text-3xl font-bold text-primary">
                      ${Number(eq.daily_rate) || 0}
                      <span className="text-sm text-muted-foreground font-normal ms-1">/ day</span>
                    </p>
                  </div>

                  {user?.id === eq.user_id ? (
                    <Button disabled className="w-full opacity-50 cursor-not-allowed">Your Equipment</Button>
                  ) : (
                    <BookingDialog
                      serviceId={eq.id}
                      serviceType="equipment"
                      providerId={eq.user_id}
                      pricePerDay={Number(eq.daily_rate) || 0}
                      triggerLabel="Book Equipment"
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
                <OwnerCard ownerName={ownerName} userId={eq.user_id} avatarUrl={eq.avatar_url} memberSince={memberSince} />
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

export default EquipmentDetail;
