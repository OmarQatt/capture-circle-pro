import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Loader2, User } from "lucide-react";
import ImageCarousel from "@/components/ImageCarousel";
import ImageLightbox from "@/components/ImageLightbox";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api, { resolveImageUrl } from "@/integrations/api/client";

const fallbackImage = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80";

const Locations = () => {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const { t } = useTranslation();

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: () => api.get<any[]>("/api/locations"),
  });

  const filtered = locations.filter((l: any) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || (l.city || "").toLowerCase().includes(search.toLowerCase());
    const matchCity = cityFilter === "all" || (l.city || "").toLowerCase() === cityFilter;
    const matchType = typeFilter === "all" || (l.category || "").toLowerCase() === typeFilter;
    return matchSearch && matchCity && matchType;
  });

  const cities = [...new Set(locations.map((l: any) => l.city).filter(Boolean))];

  return (
    <>
    {lightbox && (
      <ImageLightbox images={lightbox.images} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />
    )}
    <Layout>
      <section className="border-b border-border bg-card/30 py-16">
        <div className="container">
          <h1 className="font-display text-4xl text-foreground sm:text-5xl">
            {t('locations.titleMain')} <span className="text-gradient-gold">{t('locations.titleHighlight')}</span>
          </h1>
          <p className="mt-3 text-muted-foreground">{t('locations.desc')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={t('locations.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="ps-10" />
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder={t('locations.city')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('locations.allCities')}</SelectItem>
                {cities.map((c: any) => <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder={t('locations.type')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('locations.allTypes')}</SelectItem>
                <SelectItem value="villa">{t('locations.types.villa')}</SelectItem>
                <SelectItem value="studio">{t('locations.types.studio')}</SelectItem>
                <SelectItem value="warehouse">{t('locations.types.warehouse')}</SelectItem>
                <SelectItem value="beach">{t('locations.types.beach')}</SelectItem>
                <SelectItem value="historical">{t('locations.types.historical')}</SelectItem>
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
            <p className="text-center text-muted-foreground py-20">{t('locations.empty')}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((loc: any) => (
                <Card key={loc.id} className="group overflow-hidden border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-gold">
                  <div className="relative h-52 overflow-hidden">
                    <ImageCarousel
                      images={loc.images?.length ? loc.images : [fallbackImage]}
                      alt={loc.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      onImageClick={(i) => { setLightbox({ images: loc.images?.length ? loc.images : [fallbackImage], index: i }); }}
                    />
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground">{loc.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {loc.city || t('locations.empty')}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        {loc.price_per_6hours && (
                          <p className="text-sm text-muted-foreground">${Number(loc.price_per_6hours)}<span className="text-xs"> {t('locations.per6h')}</span></p>
                        )}
                        <p className="text-lg font-semibold text-primary">${Number(loc.price_per_day) || 0}<span className="text-sm text-muted-foreground"> {t('locations.perDay')}</span></p>
                      </div>
                      <Link to={`/locations/${loc.id}`}>
                        <Button size="sm" variant="outline">{t('locations.viewDetails')}</Button>
                      </Link>
                    </div>
                    {loc.user_id && (
                      <Link
                        to={`/profile/${loc.user_id}`}
                        className="mt-3 flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors border-t border-border/50 pt-3"
                      >
                        <div className="h-5 w-5 rounded-full bg-muted overflow-hidden shrink-0">
                          {loc.avatar_url
                            ? <img src={resolveImageUrl(loc.avatar_url)} alt="" className="h-full w-full object-cover" />
                            : <User className="h-3 w-3 m-auto mt-1 text-muted-foreground" />}
                        </div>
                        <span>{loc.first_name || t('locations.empty')} {loc.last_name || ""}</span>
                        <span className="ms-auto text-primary">{t('locations.viewProfile')}</span>
                      </Link>
                    )}
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

export default Locations;
