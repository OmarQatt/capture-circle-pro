import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const mockLocations = [
  { id: 1, name: "Desert Oasis Villa", type: "Villa", city: "Dubai", price: 500, rating: 4.8, reviews: 24, image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80", status: "Available" },
  { id: 2, name: "Industrial Warehouse", type: "Warehouse", city: "Riyadh", price: 300, rating: 4.5, reviews: 18, image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80", status: "Available" },
  { id: 3, name: "Rooftop Studio", type: "Studio", city: "Jeddah", price: 750, rating: 4.9, reviews: 42, image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80", status: "Booked" },
  { id: 4, name: "Beach House", type: "Beach", city: "Dubai", price: 900, rating: 4.7, reviews: 31, image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&q=80", status: "Available" },
  { id: 5, name: "Old Town Quarter", type: "Historical", city: "Cairo", price: 200, rating: 4.3, reviews: 12, image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=600&q=80", status: "Available" },
  { id: 6, name: "Modern Loft", type: "Loft", city: "Riyadh", price: 450, rating: 4.6, reviews: 27, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80", status: "Available" },
];

const Locations = () => {
  const [search, setSearch] = useState("");

  const filtered = mockLocations.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <section className="border-b border-border bg-card/30 py-16">
        <div className="container">
          <h1 className="font-display text-4xl text-foreground sm:text-5xl">
            Filming <span className="text-gradient-gold">Locations</span>
          </h1>
          <p className="mt-3 text-muted-foreground">Discover verified filming locations for your next production.</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search locations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="City" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                <SelectItem value="dubai">Dubai</SelectItem>
                <SelectItem value="riyadh">Riyadh</SelectItem>
                <SelectItem value="jeddah">Jeddah</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="warehouse">Warehouse</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon"><SlidersHorizontal className="h-4 w-4" /></Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((loc) => (
              <Link to={`/locations/${loc.id}`} key={loc.id}>
                <Card className="group overflow-hidden border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-gold">
                  <div className="relative h-52 overflow-hidden">
                    <img src={loc.image} alt={loc.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                    <Badge className={`absolute top-3 right-3 ${loc.status === "Available" ? "bg-green-600" : "bg-red-600"}`}>
                      {loc.status}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{loc.name}</h3>
                        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" /> {loc.city}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        <span className="text-foreground">{loc.rating}</span>
                        <span className="text-muted-foreground">({loc.reviews})</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-lg font-semibold text-primary">${loc.price}<span className="text-sm text-muted-foreground">/day</span></p>
                      <Button size="sm" variant="outline">View Details</Button>
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

export default Locations;
