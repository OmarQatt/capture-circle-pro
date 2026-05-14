import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Camera, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/integrations/api/client";

const fallbackImage = "https://images.unsplash.com/photo-1585506942812-e72b29cef752?w=600&q=80";

const Equipment = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

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
            Equipment <span className="text-gradient-gold">Rental</span>
          </h1>
          <p className="mt-3 text-muted-foreground">Professional gear from verified equipment companies.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search equipment..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="camera">Camera</SelectItem>
                <SelectItem value="lighting">Lighting</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="lens">Lens</SelectItem>
                <SelectItem value="stabilizer">Stabilizer</SelectItem>
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
            <p className="text-center text-muted-foreground py-20">No equipment found yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((eq) => (
                <Card key={eq.id} className="group overflow-hidden border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-gold">
                  <div className="relative h-52 overflow-hidden">
                    <img src={eq.images?.[0] || fallbackImage} alt={eq.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                    <Badge className={`absolute top-3 right-3 ${eq.status === "available" ? "bg-green-600" : "bg-red-600"}`}>
                      {eq.status}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Camera className="h-3 w-3" />{eq.brand || "Unknown"}</p>
                    <h3 className="mt-1 font-semibold text-foreground">{eq.name}</h3>
                    <p className="text-sm text-muted-foreground">{eq.category}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-lg font-semibold text-primary">${Number(eq.daily_rate) || 0}<span className="text-sm text-muted-foreground">/day</span></p>
                      <Badge variant="outline">{eq.condition}</Badge>
                    </div>
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
