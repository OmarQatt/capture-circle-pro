import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/integrations/api/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
    if (!authLoading && user && user.role !== "admin") navigate("/dashboard");
  }, [authLoading, user, navigate]);

  const { data: pendingLocations = [], isLoading: locLoading } = useQuery({
    queryKey: ["admin-pending-locations"],
    enabled: user?.role === "admin",
    queryFn: () => api.get<any[]>("/api/admin/locations/pending"),
  });

  const { data: allBookings = [], isLoading: bookLoading } = useQuery({
    queryKey: ["admin-bookings"],
    enabled: user?.role === "admin",
    queryFn: () => api.get<any[]>("/api/admin/bookings"),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["admin-users"],
    enabled: user?.role === "admin",
    queryFn: () => api.get<any[]>("/api/admin/users"),
  });

  const updateLocationStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/api/admin/locations/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-locations"] });
      toast({ title: "Location updated" });
    },
    onError: (err: any) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  if (authLoading) return <Layout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;

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
              <p className="mt-2 text-2xl font-bold text-foreground">{allUsers.length}</p>
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
                        {pendingLocations.map((loc: any) => (
                          <tr key={loc.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="p-4 font-medium text-foreground">{loc.name}</td>
                            <td className="p-4 text-muted-foreground">{loc.city}</td>
                            <td className="p-4 text-muted-foreground">{loc.first_name} {loc.last_name}</td>
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
                        {allBookings.map((b: any) => (
                          <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="p-4"><Badge variant="outline">{b.service_type}</Badge></td>
                            <td className="p-4 text-muted-foreground">{b.start_date?.slice(0,10)} → {b.end_date?.slice(0,10)}</td>
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
                {allUsers.length === 0 ? (
                  <p className="p-8 text-center text-muted-foreground">No users yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-sm text-muted-foreground">
                          <th className="p-4 text-left font-medium">Name</th>
                          <th className="p-4 text-left font-medium">Email</th>
                          <th className="p-4 text-left font-medium">Role</th>
                          <th className="p-4 text-left font-medium">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((u: any) => (
                          <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="p-4 font-medium text-foreground">{u.first_name} {u.last_name}</td>
                            <td className="p-4 text-muted-foreground">{u.email}</td>
                            <td className="p-4"><Badge variant="secondary">{u.role}</Badge></td>
                            <td className="p-4 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
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
