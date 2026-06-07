import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin, Camera, Briefcase, Ruler, User, Loader2,
  CalendarDays, ChevronRight, Video, ImagePlus, Save,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import api, { resolveImageUrl } from "@/integrations/api/client";
import ImageLightbox from "@/components/ImageLightbox";
import { useAuth } from "@/contexts/AuthContext";
import ImageUpload from "@/components/ImageUpload";

const roleLabels: Record<string, string> = {
  director_of_photography: "Director of Photography (DP)",
  first_ac: "1st AC", second_ac: "2nd AC", third_ac: "3rd AC",
  camera_operator: "Camera Operator", gaffer: "Gaffer",
  sound_engineer: "Sound Engineer", editor: "Editor", director: "Director",
};

const fallbackAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80";
const fallbackLocation = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80";
const fallbackEquip = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: authUser, setAuthUser } = useAuth();
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  // Portfolio edit state (own profile only)
  const [portfolioUrls, setPortfolioUrls] = useState<string[] | null>(null);
  const [portfolioSaving, setPortfolioSaving] = useState(false);



  const isOwnProfile = !!authUser && authUser.id === userId;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => api.get<any>(`/api/profiles/${userId}`),
    enabled: !!userId,
  });

  useEffect(() => {
    if (portfolioUrls === null && data?.user) {
      setPortfolioUrls(data.user.portfolio_urls || []);
    }
  }, [data]);

  // ── Avatar change ────────────────────────────────────────────────
  const handleAvatarChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("images", files[0]);
      const result = await api.upload<{ urls: string[] }>("/api/upload", formData);
      const avatarUrl = result.urls[0];
      const updated = await api.patch<any>("/api/profiles/me", { avatar_url: avatarUrl });
      setAuthUser({ ...authUser!, avatar_url: updated.avatar_url });
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
      toast.success("Profile photo updated!");
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  // ── Portfolio save ───────────────────────────────────────────────
  const savePortfolio = async () => {
    if (!portfolioUrls) return;
    setPortfolioSaving(true);
    try {
      await api.patch("/api/profiles/me", { portfolio_urls: portfolioUrls });
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
      toast.success("Portfolio saved!");
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    } finally {
      setPortfolioSaving(false);
    }
  };



  // ── Loading / error states ───────────────────────────────────────
  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (isError || !data || !data.user) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <User className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Profile not found.</p>
          <Button asChild variant="outline"><Link to="/">Go Home</Link></Button>
        </div>
      </Layout>
    );
  }

  const { user, locations, equipment, crew, talent } = data;
  const crewList: any[] = Array.isArray(crew) ? crew : (crew ? [crew] : []);
  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Anonymous";
  const memberSince = new Date(user.created_at).getFullYear();
  const displayPortfolio = portfolioUrls ?? (user.portfolio_urls || []);
  const hasContent = locations.length > 0 || equipment.length > 0 || crewList.length > 0 || talent || displayPortfolio.length > 0;


  return (
    <>
    {lightbox && (
      <ImageLightbox images={lightbox.images} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />
    )}
    <Layout>
      {/* Hero */}
      <section className="border-b border-border bg-card/30 py-16">
        <div className="container">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">

            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={user.avatar_url || fallbackAvatar}
                alt={fullName}
                className="h-28 w-28 rounded-full object-cover ring-4 ring-primary/30"
              />
              {isOwnProfile && (
                <>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                    title="Change profile photo"
                  >
                    {avatarUploading
                      ? <Loader2 className="h-6 w-6 animate-spin text-white" />
                      : <Camera className="h-6 w-6 text-white" />}
                  </button>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => handleAvatarChange(e.target.files)} />
                </>
              )}
            </div>

            {/* Name + meta */}
            <div className="flex-1">
              <h1 className="font-display text-4xl text-foreground">{fullName}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" /> Member since {memberSince}
              </p>

              {/* Gender (read-only) */}
              {user.gender && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground capitalize">
                  <User className="h-4 w-4" /> {user.gender.replace(/_/g, " ")}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {crewList.map((c: any) => (
                  <Badge key={c.id} variant="secondary">{roleLabels[c.role] || c.role}</Badge>
                ))}
                {talent && <Badge variant="secondary" className="capitalize">{talent.profile_type}</Badge>}
                {locations.length > 0 && <Badge variant="secondary">{locations.length} Location{locations.length > 1 ? "s" : ""}</Badge>}
                {equipment.length > 0 && <Badge variant="secondary">{equipment.length} Equipment</Badge>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-12 space-y-14">
        {!hasContent && !isOwnProfile && (
          <p className="text-center text-muted-foreground py-20">This user hasn't published any listings yet.</p>
        )}

        {/* ── Portfolio ─────────────────────────────────────────── */}
        {(isOwnProfile || displayPortfolio.length > 0) && (
          <section>
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl text-foreground flex items-center gap-2">
                <ImagePlus className="h-5 w-5 text-primary" /> Portfolio
              </h2>
              {isOwnProfile && (
                <Button size="sm" className="gap-2" onClick={savePortfolio} disabled={portfolioSaving}>
                  {portfolioSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save
                </Button>
              )}
            </div>

            {isOwnProfile ? (
              <ImageUpload
                urls={displayPortfolio}
                onChange={setPortfolioUrls}
                max={20}
                label="Upload your work photos"
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {displayPortfolio.map((url: string, i: number) => (
                  <div key={i} className="group cursor-zoom-in overflow-hidden rounded-lg border border-border/50 bg-muted/20"
                    onClick={() => setLightbox({ images: displayPortfolio, index: i })}>
                    <img src={resolveImageUrl(url)} alt=""
                      className="h-48 w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Crew Profiles ─────────────────────────────────────── */}
        {crewList.length > 0 && (
          <section>
            <h2 className="font-display text-2xl text-foreground mb-6 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" /> Crew Profiles
            </h2>
            <div className="space-y-4">
              {crewList.map((c: any) => (
                <Card key={c.id} className="border-border/50 bg-card">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-primary">{roleLabels[c.role] || c.role}</p>
                        <p className="text-sm text-muted-foreground">{c.experience_years || 0} years of experience</p>
                      </div>
                      {c.daily_rate && (
                        <p className="text-2xl font-bold text-foreground">${Number(c.daily_rate)}<span className="text-sm text-muted-foreground font-normal">/day</span></p>
                      )}
                    </div>
                    {c.bio && <p className="text-muted-foreground text-sm leading-relaxed">{c.bio}</p>}
                    {c.skills && c.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {c.skills.map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}
                      </div>
                    )}
                    {c.portfolio_urls?.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {c.portfolio_urls.map((url: string, i: number) => (
                          <div key={i} className="cursor-zoom-in overflow-hidden rounded-lg border border-border/50 bg-muted/20 h-32"
                            onClick={() => setLightbox({ images: c.portfolio_urls, index: i })}>
                            <img src={resolveImageUrl(url)} alt=""
                              className="h-full w-full object-contain"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* ── Talent / Model Profile ────────────────────────────── */}
        {talent && (
          <section>
            <h2 className="font-display text-2xl text-foreground mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <span className="capitalize">{talent.profile_type} Profile</span>
            </h2>
            <Card className="border-border/50 bg-card">
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {talent.gender && <Badge variant="secondary" className="capitalize">{talent.gender}</Badge>}
                    {talent.age && <Badge variant="secondary">Age {talent.age}</Badge>}
                    {talent.skin_tone && <Badge variant="secondary" className="capitalize">{talent.skin_tone}</Badge>}
                    {talent.height && (
                      <Badge variant="secondary">
                        <Ruler className="h-3 w-3 mr-1" />{talent.height} cm
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    {talent.daily_rate && <p className="text-2xl font-bold text-foreground">${Number(talent.daily_rate)}<span className="text-sm text-muted-foreground font-normal">/day</span></p>}
                    {talent.hourly_rate && <p className="text-sm text-muted-foreground">${Number(talent.hourly_rate)}/hour</p>}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{talent.experience_years || 0} years experience</p>
                {talent.bio && <p className="text-muted-foreground text-sm leading-relaxed">{talent.bio}</p>}
                {talent.portfolio_urls?.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {talent.portfolio_urls.map((url: string, i: number) => (
                      <div key={i} className="cursor-zoom-in overflow-hidden rounded-lg border border-border/50 bg-muted/20 h-64"
                        onClick={() => setLightbox({ images: talent.portfolio_urls, index: i })}>
                        <img src={resolveImageUrl(url)} alt=""
                          className="h-full w-full object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                    ))}
                  </div>
                )}
                {talent.portfolio_videos?.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Video className="h-4 w-4 text-primary" /> Work Videos
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {talent.portfolio_videos.map((url: string, i: number) => (
                        <video key={i} src={url} controls
                          className="w-full rounded-lg border border-border bg-black max-h-56 object-contain" />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* ── Locations ─────────────────────────────────────────── */}
        {locations.length > 0 && (
          <section>
            <h2 className="font-display text-2xl text-foreground mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Locations
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {locations.map((loc: any) => (
                <Link key={loc.id} to={`/locations/${loc.id}`}>
                  <Card className="group overflow-hidden border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-gold">
                    <div className="relative h-44 overflow-hidden">
                      <img src={loc.images?.[0] || fallbackLocation} alt={loc.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      {loc.category && (
                        <Badge className="absolute top-2 left-2 capitalize bg-background/80">{loc.category}</Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground">{loc.name}</h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" /> {loc.city || "Unknown"}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-primary font-semibold">
                          ${Number(loc.price_per_day) || 0}<span className="text-xs text-muted-foreground">/day</span>
                        </p>
                        <span className="flex items-center gap-1 text-xs text-primary">View <ChevronRight className="h-3 w-3" /></span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Equipment ─────────────────────────────────────────── */}
        {equipment.length > 0 && (
          <section>
            <h2 className="font-display text-2xl text-foreground mb-6 flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" /> Equipment
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {equipment.map((eq: any) => (
                <Card key={eq.id} className="overflow-hidden border-border/50 bg-card">
                  <div className="relative h-40 overflow-hidden">
                    <img src={eq.images?.[0] || fallbackEquip} alt={eq.name}
                      className="h-full w-full object-cover" />
                    <Badge className="absolute top-2 left-2 capitalize bg-background/80">{eq.condition}</Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground">{eq.name}</h3>
                    {eq.brand && <p className="text-sm text-muted-foreground">{eq.brand} {eq.model}</p>}
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="secondary" className="capitalize">{eq.category}</Badge>
                      {eq.daily_rate && <p className="text-primary font-semibold">${Number(eq.daily_rate)}/day</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
    </>
  );
};

export default UserProfile;
