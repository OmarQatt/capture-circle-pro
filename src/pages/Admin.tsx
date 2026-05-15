import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, Shield, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/integrations/api/client";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

const roleLabels: Record<string, string> = {
  director_of_photography: "Director of Photography",
  first_ac: "1st AC", second_ac: "2nd AC", third_ac: "3rd AC",
  camera_operator: "Camera Operator", gaffer: "Gaffer",
  sound_engineer: "Sound Engineer", editor: "Editor", director: "Director",
};

const ApproveRejectButtons = ({
  onApprove, onReject, loading,
}: { onApprove: () => void; onReject: () => void; loading: boolean }) => (
  <div className="flex justify-end gap-2">
    <Button size="sm" variant="outline" className="text-green-500 border-green-500/30" disabled={loading} onClick={onApprove}>
      <Check className="h-4 w-4 mr-1" /> Approve
    </Button>
    <Button size="sm" variant="outline" className="text-red-500 border-red-500/30" disabled={loading} onClick={onReject}>
      <X className="h-4 w-4 mr-1" /> Reject
    </Button>
  </div>
);

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
    if (!authLoading && user && user.role !== "admin") navigate("/dashboard");
  }, [authLoading, user, navigate]);

  const isAdmin = user?.role === "admin";

  const { data: pendingLocations = [], isLoading: locLoading } = useQuery({
    queryKey: ["admin-pending-locations"],
    enabled: isAdmin,
    queryFn: () => api.get<any[]>("/api/admin/locations/pending"),
  });
  const { data: pendingEquipment = [], isLoading: eqLoading } = useQuery({
    queryKey: ["admin-pending-equipment"],
    enabled: isAdmin,
    queryFn: () => api.get<any[]>("/api/admin/equipment/pending"),
  });
  const { data: pendingCrew = [], isLoading: crewLoading } = useQuery({
    queryKey: ["admin-pending-crew"],
    enabled: isAdmin,
    queryFn: () => api.get<any[]>("/api/admin/crew/pending"),
  });
  const { data: pendingTalent = [], isLoading: talentLoading } = useQuery({
    queryKey: ["admin-pending-talent"],
    enabled: isAdmin,
    queryFn: () => api.get<any[]>("/api/admin/talent/pending"),
  });
  const { data: allBookings = [], isLoading: bookLoading } = useQuery({
    queryKey: ["admin-bookings"],
    enabled: isAdmin,
    queryFn: () => api.get<any[]>("/api/admin/bookings"),
  });
  const { data: allUsers = [] } = useQuery({
    queryKey: ["admin-users"],
    enabled: isAdmin,
    queryFn: () => api.get<any[]>("/api/admin/users"),
  });

  const makeStatusMutation = (endpoint: string, queryKey: string) =>
    useMutation({
      mutationFn: ({ id, status }: { id: string; status: string }) =>
        api.patch(`/api/admin/${endpoint}/${id}/status`, { status }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        toast({ title: "Status updated" });
      },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });

  const locationMutation = makeStatusMutation("locations", "admin-pending-locations");
  const equipmentMutation = makeStatusMutation("equipment", "admin-pending-equipment");
  const crewMutation = makeStatusMutation("crew", "admin-pending-crew");
  const talentMutation = makeStatusMutation("talent", "admin-pending-talent");

  if (authLoading) return <Layout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;

  const totalPending = pendingLocations.length + pendingEquipment.length + pendingCrew.length + pendingTalent.length;

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-display text-4xl text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground">Review pending submissions and manage the platform.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          {[
            { label: "Pending Approvals", value: totalPending },
            { label: "Total Bookings", value: allBookings.length },
            { label: "Registered Users", value: allUsers.length },
            { label: "Pending Locations", value: pendingLocations.length },
          ].map(s => (
            <Card key={s.label} className="border-border/50">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="locations">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="locations">
              Locations {pendingLocations.length > 0 && <Badge className="ml-1 h-5 px-1.5 text-xs">{pendingLocations.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="equipment">
              Equipment {pendingEquipment.length > 0 && <Badge className="ml-1 h-5 px-1.5 text-xs">{pendingEquipment.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="crew">
              Crew {pendingCrew.length > 0 && <Badge className="ml-1 h-5 px-1.5 text-xs">{pendingCrew.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="talent">
              Models {pendingTalent.length > 0 && <Badge className="ml-1 h-5 px-1.5 text-xs">{pendingTalent.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* Locations */}
          <TabsContent value="locations" className="mt-4">
            <Card className="border-border/50">
              <CardContent className="p-0">
                {locLoading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  : pendingLocations.length === 0 ? <p className="p-8 text-center text-muted-foreground">No pending locations.</p>
                  : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className="border-b border-border text-sm text-muted-foreground">
                          <th className="p-4 text-left font-medium">Name</th>
                          <th className="p-4 text-left font-medium">City</th>
                          <th className="p-4 text-left font-medium">Owner</th>
                          <th className="p-4 text-left font-medium">Price/Day</th>
                          <th className="p-4 text-right font-medium">Actions</th>
                        </tr></thead>
                        <tbody>
                          {pendingLocations.map((loc: any) => (
                            <tr key={loc.id} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="p-4 font-medium text-foreground">{loc.name}</td>
                              <td className="p-4 text-muted-foreground">{loc.city}</td>
                              <td className="p-4 text-muted-foreground">{loc.first_name} {loc.last_name}</td>
                              <td className="p-4 text-primary">${Number(loc.price_per_day) || 0}</td>
                              <td className="p-4">
                                <ApproveRejectButtons
                                  loading={locationMutation.isPending}
                                  onApprove={() => locationMutation.mutate({ id: loc.id, status: "approved" })}
                                  onReject={() => locationMutation.mutate({ id: loc.id, status: "rejected" })}
                                />
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

          {/* Equipment */}
          <TabsContent value="equipment" className="mt-4">
            <Card className="border-border/50">
              <CardContent className="p-0">
                {eqLoading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  : pendingEquipment.length === 0 ? <p className="p-8 text-center text-muted-foreground">No pending equipment.</p>
                  : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className="border-b border-border text-sm text-muted-foreground">
                          <th className="p-4 text-left font-medium">Name</th>
                          <th className="p-4 text-left font-medium">Category</th>
                          <th className="p-4 text-left font-medium">Owner</th>
                          <th className="p-4 text-left font-medium">Rate/Day</th>
                          <th className="p-4 text-right font-medium">Actions</th>
                        </tr></thead>
                        <tbody>
                          {pendingEquipment.map((eq: any) => (
                            <tr key={eq.id} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="p-4 font-medium text-foreground">{eq.name}</td>
                              <td className="p-4 text-muted-foreground capitalize">{eq.category}</td>
                              <td className="p-4 text-muted-foreground">{eq.first_name} {eq.last_name}</td>
                              <td className="p-4 text-primary">${Number(eq.daily_rate) || 0}</td>
                              <td className="p-4">
                                <ApproveRejectButtons
                                  loading={equipmentMutation.isPending}
                                  onApprove={() => equipmentMutation.mutate({ id: eq.id, status: "approved" })}
                                  onReject={() => equipmentMutation.mutate({ id: eq.id, status: "rejected" })}
                                />
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

          {/* Crew */}
          <TabsContent value="crew" className="mt-4">
            <Card className="border-border/50">
              <CardContent className="p-0">
                {crewLoading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  : pendingCrew.length === 0 ? <p className="p-8 text-center text-muted-foreground">No pending crew profiles.</p>
                  : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className="border-b border-border text-sm text-muted-foreground">
                          <th className="p-4 text-left font-medium">Name</th>
                          <th className="p-4 text-left font-medium">Role</th>
                          <th className="p-4 text-left font-medium">Email</th>
                          <th className="p-4 text-left font-medium">Experience</th>
                          <th className="p-4 text-right font-medium">Actions</th>
                        </tr></thead>
                        <tbody>
                          {pendingCrew.map((c: any) => (
                            <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="p-4 font-medium text-foreground">{c.first_name} {c.last_name}</td>
                              <td className="p-4 text-muted-foreground">{roleLabels[c.role] || c.role}</td>
                              <td className="p-4 text-muted-foreground">{c.email}</td>
                              <td className="p-4 text-muted-foreground">{c.experience_years || 0} yrs</td>
                              <td className="p-4">
                                <ApproveRejectButtons
                                  loading={crewMutation.isPending}
                                  onApprove={() => crewMutation.mutate({ id: c.id, status: "approved" })}
                                  onReject={() => crewMutation.mutate({ id: c.id, status: "rejected" })}
                                />
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

          {/* Talent / Models */}
          <TabsContent value="talent" className="mt-4">
            <Card className="border-border/50">
              <CardContent className="p-0">
                {talentLoading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  : pendingTalent.length === 0 ? <p className="p-8 text-center text-muted-foreground">No pending talent profiles.</p>
                  : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className="border-b border-border text-sm text-muted-foreground">
                          <th className="p-4 text-left font-medium">Name</th>
                          <th className="p-4 text-left font-medium">Type</th>
                          <th className="p-4 text-left font-medium">Gender</th>
                          <th className="p-4 text-left font-medium">Email</th>
                          <th className="p-4 text-right font-medium">Actions</th>
                        </tr></thead>
                        <tbody>
                          {pendingTalent.map((t: any) => (
                            <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="p-4 font-medium text-foreground">{t.first_name} {t.last_name}</td>
                              <td className="p-4"><Badge variant="secondary" className="capitalize">{t.profile_type}</Badge></td>
                              <td className="p-4 text-muted-foreground capitalize">{t.gender || "—"}</td>
                              <td className="p-4 text-muted-foreground">{t.email}</td>
                              <td className="p-4">
                                <ApproveRejectButtons
                                  loading={talentMutation.isPending}
                                  onApprove={() => talentMutation.mutate({ id: t.id, status: "approved" })}
                                  onReject={() => talentMutation.mutate({ id: t.id, status: "rejected" })}
                                />
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

          {/* Bookings */}
          <TabsContent value="bookings" className="mt-4">
            <Card className="border-border/50">
              <CardContent className="p-0">
                {bookLoading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  : allBookings.length === 0 ? <p className="p-8 text-center text-muted-foreground">No bookings yet.</p>
                  : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className="border-b border-border text-sm text-muted-foreground">
                          <th className="p-4 text-left font-medium">Type</th>
                          <th className="p-4 text-left font-medium">Dates</th>
                          <th className="p-4 text-left font-medium">Status</th>
                          <th className="p-4 text-right font-medium">Amount</th>
                        </tr></thead>
                        <tbody>
                          {allBookings.map((b: any) => (
                            <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="p-4"><Badge variant="outline">{b.service_type}</Badge></td>
                              <td className="p-4 text-muted-foreground">{b.start_date?.slice(0, 10)} → {b.end_date?.slice(0, 10)}</td>
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

          {/* Users */}
          <TabsContent value="users" className="mt-4">
            <Card className="border-border/50">
              <CardContent className="p-0">
                {allUsers.length === 0 ? <p className="p-8 text-center text-muted-foreground">No users yet.</p>
                  : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className="border-b border-border text-sm text-muted-foreground">
                          <th className="p-4 text-left font-medium">Name</th>
                          <th className="p-4 text-left font-medium">Email</th>
                          <th className="p-4 text-left font-medium">Role</th>
                          <th className="p-4 text-left font-medium">Joined</th>
                          <th className="p-4 text-right font-medium">Profile</th>
                        </tr></thead>
                        <tbody>
                          {allUsers.map((u: any) => (
                            <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="p-4 font-medium text-foreground">{u.first_name} {u.last_name}</td>
                              <td className="p-4 text-muted-foreground">{u.email}</td>
                              <td className="p-4"><Badge variant="secondary">{u.role}</Badge></td>
                              <td className="p-4 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                              <td className="p-4 text-right">
                                <Link to={`/profile/${u.id}`}>
                                  <Button size="sm" variant="outline" className="gap-1.5">
                                    <ExternalLink className="h-3.5 w-3.5" /> View
                                  </Button>
                                </Link>
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
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
