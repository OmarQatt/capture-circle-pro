import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Star, MapPin, Briefcase } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const mockCrew = [
  { id: 1, name: "Ahmed Salim", role: "Director of Photography", city: "Dubai", rating: 4.9, experience: "10 years", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80", available: true },
  { id: 2, name: "Fatima Zahra", role: "1st Assistant Camera", city: "Riyadh", rating: 4.7, experience: "5 years", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80", available: true },
  { id: 3, name: "Youssef Bakr", role: "2nd Assistant Camera", city: "Cairo", rating: 4.5, experience: "3 years", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80", available: false },
  { id: 4, name: "Layla Nasser", role: "Photographer", city: "Jeddah", rating: 4.8, experience: "7 years", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80", available: true },
  { id: 5, name: "Hassan Rami", role: "Gaffer", city: "Dubai", rating: 4.6, experience: "8 years", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80", available: true },
  { id: 6, name: "Dina Khalil", role: "3rd Assistant Camera", city: "Riyadh", rating: 4.4, experience: "2 years", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80", available: true },
];

const Crew = () => {
  const [search, setSearch] = useState("");

  const filtered = mockCrew.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase())
  );

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
            <Select>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="dp">Director of Photography</SelectItem>
                <SelectItem value="1ac">1st AC</SelectItem>
                <SelectItem value="2ac">2nd AC</SelectItem>
                <SelectItem value="3ac">3rd AC</SelectItem>
                <SelectItem value="photographer">Photographer</SelectItem>
                <SelectItem value="gaffer">Gaffer</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="City" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="dubai">Dubai</SelectItem>
                <SelectItem value="riyadh">Riyadh</SelectItem>
                <SelectItem value="cairo">Cairo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((crew) => (
              <Link to={`/crew/${crew.id}`} key={crew.id}>
                <Card className="group overflow-hidden border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-gold">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img src={crew.image} alt={crew.name} className="h-16 w-16 rounded-full object-cover ring-2 ring-border" loading="lazy" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">{crew.name}</h3>
                          <Badge className={crew.available ? "bg-green-600" : "bg-red-600"}>
                            {crew.available ? "Available" : "Busy"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm font-medium text-primary">{crew.role}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{crew.city}</span>
                      <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{crew.experience}</span>
                      <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-primary text-primary" />{crew.rating}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Crew;
