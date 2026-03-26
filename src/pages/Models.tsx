import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Ruler } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const mockModels = [
  { id: 1, name: "Sara Ahmed", gender: "Female", age: 24, height: "170cm", skinTone: "Light", city: "Dubai", experience: "5 years", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80", available: true },
  { id: 2, name: "Omar Hassan", gender: "Male", age: 28, height: "185cm", skinTone: "Medium", city: "Riyadh", experience: "3 years", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80", available: true },
  { id: 3, name: "Lina Farid", gender: "Female", age: 22, height: "168cm", skinTone: "Dark", city: "Cairo", experience: "2 years", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80", available: false },
  { id: 4, name: "Khalid Noor", gender: "Male", age: 31, height: "180cm", skinTone: "Light", city: "Jeddah", experience: "7 years", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80", available: true },
  { id: 5, name: "Nadia Karam", gender: "Female", age: 26, height: "175cm", skinTone: "Medium", city: "Dubai", experience: "4 years", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80", available: true },
  { id: 6, name: "Tariq Mansour", gender: "Male", age: 25, height: "178cm", skinTone: "Medium", city: "Riyadh", experience: "1 year", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80", available: true },
];

const Models = () => {
  const [search, setSearch] = useState("");

  const filtered = mockModels.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.city.toLowerCase().includes(search.toLowerCase())
  );

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
            <Select>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Skin Tone" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
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
            {filtered.map((model) => (
              <Link to={`/models/${model.id}`} key={model.id}>
                <Card className="group overflow-hidden border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-gold">
                  <div className="relative h-72 overflow-hidden">
                    <img src={model.image} alt={model.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                    <Badge className={`absolute top-3 right-3 ${model.available ? "bg-green-600" : "bg-red-600"}`}>
                      {model.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground text-lg">{model.name}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="secondary">{model.gender}</Badge>
                      <Badge variant="secondary">Age {model.age}</Badge>
                      <Badge variant="secondary">{model.skinTone}</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" />{model.height}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{model.city}</span>
                    </div>
                    <p className="mt-2 text-sm text-primary font-medium">{model.experience} experience</p>
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

export default Models;
