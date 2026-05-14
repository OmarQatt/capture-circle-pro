import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Briefcase, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/integrations/api/client";

const fallbackAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80";

const roleLabels: Record<string, string> = {
  camera_operator: "Camera Operator",
  director_of_photography: "Director of Photography",
  first_ac: "1st AC",
  second_ac: "2nd AC",
  third_ac: "3rd AC",
  photographer: "Photographer",
  videographer: "Videographer",
  gaffer: "Gaffer",
};

const Crew = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: crew = [], isLoading } = useQuery({
    queryKey: ["crew_profiles"],
    queryFn: () => api.get<any[]>("/api/crew"),
  });

  const filtered = crew.filter((c: any) => {
    const name = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || (c.role || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || c.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <Layout>
      <section className="border-b border-border bg-card/30 py-16">
        <div className="container">
          <h1 className="font-display text-4xl text-foreground sm:text-5xl">
            Production <span className="text-gradient-gold">Crew</span>
          </h1>
          <p className="mt-3 text-muted-foreground">Hire experienced DPs, ACs, photographers, and specialists.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search crew..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.entries(roleLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
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
            <p className="text-center text-muted-foreground py-20">No crew members found yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((member: any) => (
                <Card key={member.id} className="group overflow-hidden border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-gold">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img src={member.avatar_url || fallbackAvatar} alt="" className="h-16 w-16 rounded-full object-cover ring-2 ring-border" loading="lazy" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {member.first_name || "Unknown"} {member.last_name || ""}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-primary">{roleLabels[member.role] || member.role}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{member.experience_years || 0} years</span>
                      {member.daily_rate && <span className="text-primary font-semibold">${Number(member.daily_rate)}/day</span>}
                    </div>
                    {member.skills && member.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {member.skills.slice(0, 3).map((s: string) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                      </div>
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

export default Crew;
