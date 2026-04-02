import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, TrendingUp, Users, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const statusColor = (s: string) => {
  switch (s) {
    case "confirmed": return "bg-green-600";
    case "pending": return "bg-amber-600";
    case "completed": return "bg-blue-600";
    case "cancelled": return "bg-red-600";
    default: return "bg-muted";
  }
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data;
    },
  });

  const { data: myLocations = [] } = useQuery({
    queryKey: ["my-locations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("locations").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });

  const { data: myEquipment = [] } = useQuery({
    queryKey: ["my-equipment", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("equipment").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });

  if (authLoading) return <Layout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;

  const stats = [
    { label: "Bookings", value: bookings.length.toString(), icon: Calendar },
    { label: "My Locations", value: myLocations.length.toString(), icon: TrendingUp },
    { label: "My Equipment", value: myEquipment.length.toString(), icon: DollarSign },
  ];

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.user_metadata?.first_name || "User"}!</p>
          </div>
          <Button className="bg-gradient-gold text-primary-foreground font-semibold">
            <Plus className="h-4 w-4 mr-2" /> Add Listing
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          {stats.map((s) => (
            <Card key={s.label} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="bookings">
          <TabsList>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
          </TabsList>
          <TabsContent value="bookings" className="mt-4">
            <Card className="border-border/50">
              <CardContent className="p-0">
                {bookingsLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : bookings.length === 0 ? (
                  <p className="p-8 text-center text-muted-foreground">No bookings yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-sm text-muted-foreground">
                          <th className="p-4 text-left font-medium">Type</th>
                          <th className="p-4 text-left font-medium">Dates</th>
                          <th className="p-4 text-left font-medium">Status</th>
                          <th className="p-4 text-right font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((b) => (
                          <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="p-4"><Badge variant="outline">{b.service_type}</Badge></td>
                            <td className="p-4 text-muted-foreground">{b.start_date} → {b.end_date}</td>
                            <td className="p-4"><Badge className={statusColor(b.status)}>{b.status}</Badge></td>
                            <td className="p-4 text-right font-semibold text-primary">${Number(b.total_price) || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="listings" className="mt-4">
            <Card className="border-border/50">
              <CardContent className="p-6">
                {myLocations.length + myEquipment.length === 0 ? (
                  <div className="text-center">
                    <p className="text-muted-foreground">You haven't added any listings yet.</p>
                    <Button className="mt-4 bg-gradient-gold text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Add Your First Listing</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myLocations.map((l) => (
                      <div key={l.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                        <div>
                          <p className="font-medium text-foreground">{l.name}</p>
                          <p className="text-sm text-muted-foreground">Location · {l.city}</p>
                        </div>
                        <Badge className={l.status === "approved" ? "bg-green-600" : "bg-amber-600"}>{l.status}</Badge>
                      </div>
                    ))}
                    {myEquipment.map((e) => (
                      <div key={e.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                        <div>
                          <p className="font-medium text-foreground">{e.name}</p>
                          <p className="text-sm text-muted-foreground">Equipment · {e.brand}</p>
                        </div>
                        <Badge className={e.status === "available" ? "bg-green-600" : "bg-amber-600"}>{e.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
