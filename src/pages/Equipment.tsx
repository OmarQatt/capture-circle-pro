import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Camera, Loader2, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api from "@/integrations/api/client";

const fallbackImage = "https://images.unsplash.com/photo-1585506942812-e72b29cef752?w=600&q=80";

const Equipment = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { t } = useTranslation();

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ["equipment"],
    queryFn: () => api.get<any[]>("/api/equipment"),
  });

  const filtered = equipment.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || (e.category || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || (e.category || "").toLowerCase() === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <Layout>
      <section className="border-b border-border bg-card/30 py-16">
        <div className="container">
          <h1 className="font-display text-4xl text-foreground sm:text-5xl">
            {t('equipment.titleMain')} <span className="text-gradient-gold">{t('equipment.titleHighlight')}</span>
          </h1>
          <p className="mt-3 text-muted-foreground">{t('equipment.desc')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={t('equipment.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="ps-10" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder={t('equipment.category')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('equipment.allCategories')}</SelectItem>
                <SelectItem value="camera">{t('equipment.categories.camera')}</SelectItem>
                <SelectItem value="lighting">{t('equipment.categories.lighting')}</SelectItem>
                <SelectItem value="audio">{t('equipment.categories.audio')}</SelectItem>
                <SelectItem value="lens">{t('equipment.categories.lens')}</SelectItem>
                <SelectItem value="stabilizer">{t('equipment.categories.stabilizer')}</SelectItem>
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
            <p className="text-center text-muted-foreground py-20">{t('equipment.empty')}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((eq) => (
                <Card key={eq.id} className="group overflow-hidden border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-gold">
                  <div className="relative h-52 overflow-hidden">
                    <img src={eq.images?.[0] || fallbackImage} alt={eq.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                    <Badge className={`absolute top-3 end-3 ${eq.status === "available" ? "bg-green-600" : "bg-red-600"}`}>
                      {eq.status}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Camera className="h-3 w-3" />{eq.brand || "—"}</p>
                    <h3 className="mt-1 font-semibold text-foreground">{eq.name}</h3>
                    <p className="text-sm text-muted-foreground">{eq.category}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-lg font-semibold text-primary">${Number(eq.daily_rate) || 0}<span className="text-sm text-muted-foreground">{t('equipment.perDay')}</span></p>
                      <Badge variant="outline">{eq.condition}</Badge>
                    </div>
                    {eq.user_id && (
                      <Link
                        to={`/profile/${eq.user_id}`}
                        className="mt-3 flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="h-5 w-5 rounded-full bg-muted overflow-hidden shrink-0">
                          {eq.avatar_url
                            ? <img src={eq.avatar_url} alt="" className="h-full w-full object-cover" />
                            : <User className="h-3 w-3 m-auto mt-1 text-muted-foreground" />}
                        </div>
                        {eq.first_name || "—"} {eq.last_name || ""}
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
  );
};

export default Equipment;
