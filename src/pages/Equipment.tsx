import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, Search, Camera } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const mockEquipment = [
  { id: 1, name: "ARRI ALEXA Mini LF", category: "Camera", company: "CineGear Pro", price: 800, rating: 4.9, image: "https://images.unsplash.com/photo-1585506942812-e72b29cef752?w=600&q=80", status: "Available" },
  { id: 2, name: "Aputure 600d Pro", category: "Lighting", company: "LightHouse", price: 120, rating: 4.7, image: "https://images.unsplash.com/photo-1598743400863-0bc09fd1c2b4?w=600&q=80", status: "Available" },
  { id: 3, name: "DJI Ronin 2", category: "Stabilizer", company: "CineGear Pro", price: 200, rating: 4.6, image: "https://images.unsplash.com/photo-1616161560417-66d4db5892ec?w=600&q=80", status: "Rented" },
  { id: 4, name: "Sennheiser MKH 416", category: "Audio", company: "SoundWorks", price: 75, rating: 4.8, image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80", status: "Available" },
  { id: 5, name: "ARRI SkyPanel S60", category: "Lighting", company: "LightHouse", price: 250, rating: 4.9, image: "https://images.unsplash.com/photo-1574717025058-2f8737d2e2b7?w=600&q=80", status: "Available" },
  { id: 6, name: "Canon CN-E 50mm T1.3", category: "Lens", company: "OpticsPro", price: 150, rating: 4.5, image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600&q=80", status: "Available" },
];

const Equipment = () => {
  const [search, setSearch] = useState("");

  const filtered = mockEquipment.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

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
            <Select>
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((eq) => (
              <Link to={`/equipment/${eq.id}`} key={eq.id}>
                <Card className="group overflow-hidden border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-gold">
                  <div className="relative h-52 overflow-hidden">
                    <img src={eq.image} alt={eq.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                    <Badge className={`absolute top-3 right-3 ${eq.status === "Available" ? "bg-green-600" : "bg-red-600"}`}>
                      {eq.status}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Camera className="h-3 w-3" />{eq.company}</p>
                    <h3 className="mt-1 font-semibold text-foreground">{eq.name}</h3>
                    <p className="text-sm text-muted-foreground">{eq.category}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-lg font-semibold text-primary">${eq.price}<span className="text-sm text-muted-foreground">/day</span></p>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        <span>{eq.rating}</span>
                      </div>
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

export default Equipment;
