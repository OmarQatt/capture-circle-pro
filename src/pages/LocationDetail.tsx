import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { MapPin, Star, Clock, DollarSign, ArrowLeft, Shield, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";

const LocationDetail = () => {
  const { id } = useParams();
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Mock data
  const location = {
    name: "Desert Oasis Villa",
    type: "Villa",
    city: "Dubai",
    price: 500,
    rating: 4.8,
    reviews: 24,
    description: "A stunning desert villa perfect for luxury brand shoots, music videos, and film scenes. Features an infinity pool, sprawling gardens, and dramatic desert backdrop. Available for full-day bookings with optional overnight access.",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
    ],
    status: "Available",
    owner: "Mohammed Al-Rashid",
    amenities: ["Parking", "Power Supply", "Restrooms", "Wi-Fi", "Air Conditioning"],
  };

  const mockReviews = [
    { user: "Sarah K.", rating: 5, comment: "Perfect location for our commercial. The owner was very accommodating.", date: "2 weeks ago" },
    { user: "Ali M.", rating: 4, comment: "Beautiful villa, great lighting conditions. A bit far from the city.", date: "1 month ago" },
  ];

  return (
    <Layout>
      <div className="container py-8">
        <Link to="/locations" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Locations
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl">
              <img src={location.images[0]} alt={location.name} className="h-[400px] w-full object-cover" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {location.images.slice(1).map((img, i) => (
                <img key={i} src={img} alt="" className="h-40 w-full rounded-lg object-cover" />
              ))}
            </div>

            <div className="mt-8">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-display text-4xl text-foreground">{location.name}</h1>
                  <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {location.city}
                    <span>·</span>
                    <Badge variant="secondary">{location.type}</Badge>
                  </p>
                </div>
                <Badge className="bg-green-600 text-sm">{location.status}</Badge>
              </div>

              <Tabs defaultValue="details" className="mt-6">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews ({location.reviews})</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-4 space-y-4">
                  <p className="text-muted-foreground leading-relaxed">{location.description}</p>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {location.amenities.map((a) => (
                        <Badge key={a} variant="outline">{a}</Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="reviews" className="mt-4 space-y-4">
                  {mockReviews.map((r, i) => (
                    <Card key={i} className="border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{r.user}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                            <span className="text-sm">{r.rating}</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{r.date}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-border/50">
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-3xl font-bold text-primary">${location.price}<span className="text-base text-muted-foreground font-normal">/day</span></p>
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                    <span>{location.rating}</span>
                    <span className="text-muted-foreground">({location.reviews} reviews)</span>
                  </div>
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
                  <p className="font-medium text-foreground">{location.owner}</p>
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
