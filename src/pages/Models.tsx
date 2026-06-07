import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Ruler, Loader2 } from "lucide-react";
import ImageLightbox from "@/components/ImageLightbox";
import BookingDialog from "@/components/BookingDialog";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import api, { resolveImageUrl } from "@/integrations/api/client";

const fallbackImage = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80";

const Models = () => {
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [skinFilter, setSkinFilter] = useState("all");
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: allTalent = [], isLoading } = useQuery({
    queryKey: ["talent_profiles", "model"],
    queryFn: () => api.get<any[]>("/api/talent"),
  });

  const models = allTalent.filter((t: any) => t.profile_type === "model");

  const filtered = models.filter((m: any) => {
    const name = `${m.first_name || ""} ${m.last_name || ""}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchGender = genderFilter === "all" || (m.gender || "").toLowerCase() === genderFilter;
    const matchSkin = skinFilter === "all" || (m.skin_tone || "").toLowerCase() === skinFilter;
    return matchSearch && matchGender && matchSkin;
  });

  return (
    <>
    {lightbox && (
      <ImageLightbox images={lightbox.images} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />
    )}
    <Layout>
      <section className="border-b border-border bg-card/30 py-16">
        <div className="container">
          <h1 className="font-display text-4xl text-foreground sm:text-5xl">
            {t('models.titleMain')} <span className="text-gradient-gold">{t('models.titleHighlight')}</span>
          </h1>
          <p className="mt-3 text-muted-foreground">{t('models.desc')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={t('models.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="ps-10" />
            </div>
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder={t('models.gender')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('models.allGenders')}</SelectItem>
                <SelectItem value="male">{t('models.genders.male')}</SelectItem>
                <SelectItem value="female">{t('models.genders.female')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={skinFilter} onValueChange={setSkinFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder={t('models.skinTone')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('models.allSkinTones')}</SelectItem>
                <SelectItem value="light">{t('models.skinTones.light')}</SelectItem>
                <SelectItem value="medium">{t('models.skinTones.medium')}</SelectItem>
                <SelectItem value="dark">{t('models.skinTones.dark')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">{t('models.empty')}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((model: any) => (
                <Card key={model.id} className="group overflow-hidden border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-gold">
                  <div
                    className="relative h-80 overflow-hidden bg-muted/20 cursor-zoom-in"
                    onClick={() => setLightbox({ images: model.portfolio_urls?.length ? model.portfolio_urls : [fallbackImage], index: 0 })}
                  >
                    <img
                      src={resolveImageUrl(model.portfolio_urls?.[0] || fallbackImage)}
                      alt="Model"
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
                    />
                    {(model.portfolio_urls?.length || 0) > 1 && (
                      <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                        +{model.portfolio_urls.length - 1}
                      </span>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <Link to={`/profile/${model.user_id}`} className="block hover:opacity-80 transition-opacity">
                      <h3 className="font-semibold text-foreground text-lg">
                        {model.first_name || "—"} {model.last_name || ""}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {model.gender && <Badge variant="secondary">{model.gender}</Badge>}
                        {model.age && <Badge variant="secondary">{t('models.age')} {model.age}</Badge>}
                        {model.skin_tone && <Badge variant="secondary">{model.skin_tone}</Badge>}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                        {model.height && <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" />{model.height}cm</span>}
                        {model.daily_rate && <span className="text-primary font-semibold">${Number(model.daily_rate)}{t('equipment.perDay')}</span>}
                      </div>
                      <p className="mt-2 text-sm text-primary font-medium">{model.experience_years || 0} {t('models.yearsExp')}</p>
                      <p className="mt-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                        {t('models.viewProfile')} →
                      </p>
                    </Link>
                    <div className="mt-3 border-t border-border/50 pt-3">
                      {user?.id === model.user_id ? (
                        <Button disabled className="w-full opacity-50 cursor-not-allowed">Your Profile</Button>
                      ) : (
                        <BookingDialog
                          serviceId={model.id}
                          serviceType="talent"
                          providerId={model.user_id}
                          pricePerDay={Number(model.daily_rate) || 0}
                          triggerLabel="Book Model"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
    </>
  );
};

export default Models;
