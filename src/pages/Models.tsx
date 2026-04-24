import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Ruler, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fallbackImage = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80";

const Models = () => {
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [skinFilter, setSkinFilter] = useState("all");

  const { data: models = [], isLoading } = useQuery({
    queryKey: ["talent_profiles", "model"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("talent_profiles")
        .select("*")
        .eq("profile_type", "model")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const userIds = (data || []).map((m) => m.user_id);
      let profilesMap: Record<string, { first_name: string | null; last_name: string | null }> = {};
      if (userIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", userIds);
        profilesMap = Object.fromEntries((profs || []).map((p) => [p.user_id, p]));
      }
      return (data || []).map((m) => ({ ...m, profiles: profilesMap[m.user_id] || null }));
    },
  });

  const filtered = models.filter((m) => {
    const name = `${(m.profiles as any)?.first_name || ""} ${(m.profiles as any)?.last_name || ""}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchGender = genderFilter === "all" || (m.gender || "").toLowerCase() === genderFilter;
    const matchSkin = skinFilter === "all" || (m.skin_tone || "").toLowerCase() === skinFilter;
    return matchSearch && matchGender && matchSkin;
  });

  return (
    <Layout>
      <section className="border-b border-border bg-card/30 py-16">
        <div className="container">
          <h1 className="font-display text-4xl text-foreground sm:text-5xl">
            Models & <span className="text-gradient-gold">Casting</span>
          </h1>
          <p className="mt-3 text-muted-foreground">Find the perfect talent for your production.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search talent..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            <Select value={skinFilter} onValueChange={setSkinFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Skin Tone" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
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
            <p className="text-center text-muted-foreground py-20">No models found yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((model) => (
                <Card key={model.id} className="group overflow-hidden border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-gold">
                  <div className="relative h-72 overflow-hidden">
                    <img src={model.portfolio_urls?.[0] || fallbackImage} alt="Model" className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground text-lg">
                      {(model.profiles as any)?.first_name || "Unknown"} {(model.profiles as any)?.last_name || ""}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {model.gender && <Badge variant="secondary">{model.gender}</Badge>}
                      {model.age && <Badge variant="secondary">Age {model.age}</Badge>}
                      {model.skin_tone && <Badge variant="secondary">{model.skin_tone}</Badge>}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                      {model.height && <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" />{Number(model.height)}cm</span>}
                      {model.daily_rate && <span className="text-primary font-semibold">${Number(model.daily_rate)}/day</span>}
                    </div>
                    <p className="mt-2 text-sm text-primary font-medium">{model.experience_years || 0} years experience</p>
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

export default Models;
