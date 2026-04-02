import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { MapPin, Star, ArrowLeft, Shield, User, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fallbackImage = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80";

const LocationDetail = () => {
  const { id } = useParams();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: location, isLoading } = useQuery({
    queryKey: ["location", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("locations").select("*, profiles:user_id(first_name, last_name)").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <Layout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  if (!location) return <Layout><div className="container py-20 text-center"><p className="text-muted-foreground">Location not found.</p><Link to="/locations" className="text-primary hover:underline mt-4 inline-block">Back to Locations</Link></div></Layout>;

  const ownerName = `${(location.profiles as any)?.first_name || ""} ${(location.profiles as any)?.last_name || ""}`.trim() || "Unknown";
  const images = location.images && location.images.length > 0 ? location.images : [fallbackImage];

  return (
    <Layout>
      <div className="container py-8">
        <Link to="/locations" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Locations
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl">
              <img src={images[0]} alt={location.name} className="h-[400px] w-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {images.slice(1, 3).map((img, i) => (
                  <img key={i} src={img} alt="" className="h-40 w-full rounded-lg object-cover" />
                ))}
              </div>
            )}

            <div className="mt-8">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-display text-4xl text-foreground">{location.name}</h1>
                  <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {location.city || "Unknown"}
                    <span>·</span>
                    <Badge variant="secondary">{location.category}</Badge>
                  </p>
                </div>
                <Badge className={location.status === "approved" ? "bg-green-600" : "bg-amber-600"}>{location.status}</Badge>
              </div>

              <Tabs defaultValue="details" className="mt-6">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-4 space-y-4">
                  <p className="text-muted-foreground leading-relaxed">{location.description || "No description available."}</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-border/50">
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-3xl font-bold text-primary">${Number(location.price_per_day) || 0}<span className="text-base text-muted-foreground font-normal">/day</span></p>
                  {location.price_per_hour && (
                    <p className="text-sm text-muted-foreground">${Number(location.price_per_hour)}/hour also available</p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Select Date</p>
                  <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border border-border" />
                </div>

                <Button className="w-full bg-gradient-gold text-primary-foreground font-semibold shadow-gold">
                  Request Booking
                </Button>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Employee-verified visit available</span>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">Listed by</p>
                  <p className="font-medium text-foreground">{ownerName}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LocationDetail;
