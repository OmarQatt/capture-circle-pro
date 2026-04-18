import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user!.id).eq("role", "admin");
      if (error) throw error;
      return data && data.length > 0;
    },
  });

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
    if (!authLoading && !roleLoading && user && isAdmin === false) navigate("/dashboard");
  }, [authLoading, roleLoading, user, isAdmin, navigate]);

  const { data: pendingLocations = [], isLoading: locLoading } = useQuery({
    queryKey: ["admin-pending-locations"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("locations").select("*").eq("status", "pending").order("created_at", { ascending: false });
      if (error) throw error;
      const userIds = [...new Set((data || []).map((l: any) => l.user_id))];
      const { data: profs } = await supabase.from("profiles").select("user_id, first_name, last_name").in("user_id", userIds);
      const profMap = new Map((profs || []).map((p: any) => [p.user_id, p]));
      return (data || []).map((l: any) => ({ ...l, profiles: profMap.get(l.user_id) }));
    },
  });

  const { data: allBookings = [], isLoading: bookLoading } = useQuery({
    queryKey: ["admin-bookings"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ["admin-profiles"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateLocationStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("locations").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-locations"] });
      toast({ title: "Location updated" });
    },
  });

  if (authLoading || roleLoading) return <Layout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-display text-4xl text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground">Manage locations, bookings, and users.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Pending Locations</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{pendingLocations.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{allBookings.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Registered Users</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{allProfiles.length}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="locations">
          <TabsList>
            <TabsTrigger value="locations">Pending Locations</TabsTrigger>
            <TabsTrigger value="bookings">All Bookings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="locations" className="mt-4">
            <Card className="border-border/50">
              <CardContent className="p-0">
                {locLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : pendingLocations.length === 0 ? (
                  <p className="p-8 text-center text-muted-foreground">No pending locations to review.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-sm text-muted-foreground">
                          <th className="p-4 text-left font-medium">Name</th>
                          <th className="p-4 text-left font-medium">City</th>
                          <th className="p-4 text-left font-medium">Owner</th>
                          <th className="p-4 text-left font-medium">Price/Day</th>
                          <th className="p-4 text-right font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingLocations.map((loc) => (
                          <tr key={loc.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="p-4 font-medium text-foreground">{loc.name}</td>
                            <td className="p-4 text-muted-foreground">{loc.city}</td>
                            <td className="p-4 text-muted-foreground">{(loc.profiles as any)?.first_name} {(loc.profiles as any)?.last_name}</td>
                            <td className="p-4 text-primary">${Number(loc.price_per_day) || 0}</td>
                            <td className="p-4 text-right space-x-2">
                              <Button size="sm" variant="outline" className="text-green-500 border-green-500/30" onClick={() => updateLocationStatus.mutate({ id: loc.id, status: "approved" })}>
                                <Check className="h-4 w-4 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-500 border-red-500/30" onClick={() => updateLocationStatus.mutate({ id: loc.id, status: "rejected" })}>
                                <X className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="mt-4">
            <Card className="border-border/50">
              <CardContent className="p-0">
                {bookLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : allBookings.length === 0 ? (
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
                        {allBookings.map((b) => (
                          <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="p-4"><Badge variant="outline">{b.service_type}</Badge></td>
                            <td className="p-4 text-muted-foreground">{b.start_date} → {b.end_date}</td>
                            <td className="p-4"><Badge>{b.status}</Badge></td>
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

          <TabsContent value="users" className="mt-4">
            <Card className="border-border/50">
              <CardContent className="p-0">
                {allProfiles.length === 0 ? (
                  <p className="p-8 text-center text-muted-foreground">No users yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-sm text-muted-foreground">
                          <th className="p-4 text-left font-medium">Name</th>
                          <th className="p-4 text-left font-medium">Role</th>
                          <th className="p-4 text-left font-medium">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allProfiles.map((p) => (
                          <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="p-4 font-medium text-foreground">{p.first_name} {p.last_name}</td>
                            <td className="p-4"><Badge variant="secondary">{p.role}</Badge></td>
                            <td className="p-4 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default Admin;
