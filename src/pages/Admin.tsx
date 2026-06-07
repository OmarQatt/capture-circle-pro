import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check, X, Shield, ExternalLink, ChevronRight, Trash2, AlertTriangle } from "lucide-react";
import ImageLightbox from "@/components/ImageLightbox";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/integrations/api/client";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  director_of_photography: "Director of Photography",
  first_ac: "1st AC", second_ac: "2nd AC", third_ac: "3rd AC",
  camera_operator: "Camera Operator", gaffer: "Gaffer",
  sound_engineer: "Sound Engineer", editor: "Editor", director: "Director",
};

const statusBadge = (status: string) => (
  <Badge className={
    status === "approved" ? "bg-green-600" :
    status === "rejected" ? "bg-red-600" :
    status === "pending" ? "bg-amber-600" : ""
  }>{status}</Badge>
);

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

const RejectReasonModal = ({
  onConfirm, onClose, loading,
}: { onConfirm: (reason: string) => void; onClose: () => void; loading: boolean }) => {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <X className="h-5 w-5 text-red-500" />
          <h3 className="font-semibold text-foreground">Reject Listing</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Provide a reason for rejection. This will be shown to the listing owner so they can fix the issue and resubmit.
        </p>
        <div>
          <Label className="text-sm">Rejection Reason <span className="text-red-500">*</span></Label>
          <Textarea
            className="mt-1"
            rows={3}
            placeholder="e.g. Photos are too dark, description is incomplete, pricing is missing..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button
            variant="destructive" className="flex-1"
            disabled={loading || !reason.trim()}
            onClick={() => onConfirm(reason.trim())}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Reject Listing
          </Button>
        </div>
      </div>
    </div>
  );
};

const DetailModal = ({ item, type, onClose }: { item: any; type: string; onClose: () => void }) => {
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const images = item.images || item.portfolio_urls || [];

  return (
    <>
    {lightbox && <ImageLightbox images={lightbox.images} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />}
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-background p-6 space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-lg capitalize">{type} Details</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {images.map((url: string, i: number) => (
              <img key={i} src={url} alt="" className="h-24 w-24 object-cover rounded-lg cursor-zoom-in border border-border" onClick={() => setLightbox({ images, index: i })} />
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {item.name && <div><span className="text-muted-foreground">Name</span><p className="font-medium">{item.name}</p></div>}
          {(item.first_name || item.last_name) && <div><span className="text-muted-foreground">Name</span><p className="font-medium">{item.first_name} {item.last_name}</p></div>}
          {item.email && <div><span className="text-muted-foreground">Email</span><p className="font-medium">{item.email}</p></div>}
          {item.city && <div><span className="text-muted-foreground">City</span><p className="font-medium">{item.city}</p></div>}
          {item.country && <div><span className="text-muted-foreground">Country</span><p className="font-medium">{item.country}</p></div>}
          {item.address && <div className="col-span-2"><span className="text-muted-foreground">Address</span><p className="font-medium">{item.address}</p></div>}
          {item.category && <div><span className="text-muted-foreground">Category</span><p className="font-medium capitalize">{item.category}</p></div>}
          {item.role && <div><span className="text-muted-foreground">Role</span><p className="font-medium">{roleLabels[item.role] || item.role}</p></div>}
          {item.profile_type && <div><span className="text-muted-foreground">Type</span><p className="font-medium capitalize">{item.profile_type}</p></div>}
          {item.gender && <div><span className="text-muted-foreground">Gender</span><p className="font-medium capitalize">{item.gender}</p></div>}
          {item.age && <div><span className="text-muted-foreground">Age</span><p className="font-medium">{item.age}</p></div>}
          {item.height && <div><span className="text-muted-foreground">Height</span><p className="font-medium">{item.height} cm</p></div>}
          {item.weight && <div><span className="text-muted-foreground">Weight</span><p className="font-medium">{item.weight} kg</p></div>}
          {item.skin_tone && <div><span className="text-muted-foreground">Skin Tone</span><p className="font-medium capitalize">{item.skin_tone}</p></div>}
          {item.brand && <div><span className="text-muted-foreground">Brand</span><p className="font-medium">{item.brand}</p></div>}
          {item.condition && <div><span className="text-muted-foreground">Condition</span><p className="font-medium capitalize">{item.condition}</p></div>}
          {item.experience_years !== undefined && <div><span className="text-muted-foreground">Experience</span><p className="font-medium">{item.experience_years} yrs</p></div>}
          {item.price_per_day && <div><span className="text-muted-foreground">Price/Day</span><p className="font-medium text-primary">${Number(item.price_per_day)}</p></div>}
          {item.price_per_6hours && <div><span className="text-muted-foreground">Price/6h</span><p className="font-medium text-primary">${Number(item.price_per_6hours)}</p></div>}
          {item.price_per_12hours && <div><span className="text-muted-foreground">Price/12h</span><p className="font-medium text-primary">${Number(item.price_per_12hours)}</p></div>}
          {item.daily_rate && <div><span className="text-muted-foreground">Daily Rate</span><p className="font-medium text-primary">${Number(item.daily_rate)}</p></div>}
          {item.hourly_rate && <div><span className="text-muted-foreground">Hourly Rate</span><p className="font-medium text-primary">${Number(item.hourly_rate)}</p></div>}
        </div>
        {item.bio && <div className="text-sm"><span className="text-muted-foreground">Bio</span><p className="mt-1 text-foreground">{item.bio}</p></div>}
        {item.description && <div className="text-sm"><span className="text-muted-foreground">Description</span><p className="mt-1 text-foreground">{item.description}</p></div>}
        {item.skills?.length > 0 && (
          <div className="text-sm"><span className="text-muted-foreground">Skills</span>
            <div className="mt-1 flex flex-wrap gap-1">{item.skills.map((s: string) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}</div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [detail, setDetail] = useState<{ item: any; type: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; mutate: (p: any) => void } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
    if (!authLoading && user && user.role !== "admin" && user.role !== "super_admin") navigate("/dashboard");
  }, [authLoading, user, navigate]);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";

  // ── Pending queries (approval flow) ──
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

  // ── All-listings queries (super_admin only) ──
  const { data: allLocations = [], isLoading: allLocLoading } = useQuery({
    queryKey: ["admin-all-locations"],
    enabled: isSuperAdmin,
    queryFn: () => api.get<any[]>("/api/admin/locations/all"),
  });
  const { data: allEquipment = [], isLoading: allEqLoading } = useQuery({
    queryKey: ["admin-all-equipment"],
    enabled: isSuperAdmin,
    queryFn: () => api.get<any[]>("/api/admin/equipment/all"),
  });
  const { data: allCrew = [], isLoading: allCrewLoading } = useQuery({
    queryKey: ["admin-all-crew"],
    enabled: isSuperAdmin,
    queryFn: () => api.get<any[]>("/api/admin/crew/all"),
  });
  const { data: allTalent = [], isLoading: allTalentLoading } = useQuery({
    queryKey: ["admin-all-talent"],
    enabled: isSuperAdmin,
    queryFn: () => api.get<any[]>("/api/admin/talent/all"),
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
      mutationFn: ({ id, status, rejection_reason }: { id: string; status: string; rejection_reason?: string }) =>
        api.patch(`/api/admin/${endpoint}/${id}/status`, { status, rejection_reason }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        setRejectModal(null);
        toast.success("Status updated");
      },
      onError: (err: any) => toast.error("Failed: " + err.message),
    });

  const locationMutation = makeStatusMutation("locations", "admin-pending-locations");
  const equipmentMutation = makeStatusMutation("equipment", "admin-pending-equipment");
  const crewMutation = makeStatusMutation("crew", "admin-pending-crew");
  const talentMutation = makeStatusMutation("talent", "admin-pending-talent");
  const bookingMutation = makeStatusMutation("bookings", "admin-bookings");

  const deleteListingMutation = useMutation({
    mutationFn: ({ type, id }: { type: string; id: string }) =>
      api.delete(`/api/admin/${type}/${id}`),
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: [`admin-all-${type.replace(/s$/, "")}`] });
      queryClient.invalidateQueries({ queryKey: [`admin-pending-${type.replace(/s$/, "")}`] });
      queryClient.invalidateQueries({ queryKey: [`admin-all-${type}`] });
      queryClient.invalidateQueries({ queryKey: [`admin-pending-${type}`] });
      toast.success("Deleted successfully");
      setDeleteConfirm(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deleted");
      setDeleteConfirm(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.patch(`/api/admin/users/${id}/role`, { role }),
    onMutate: async ({ id, role }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-users"] });
      const previousUsers = queryClient.getQueryData(["admin-users"]);
      queryClient.setQueryData(["admin-users"], (old: any[]) =>
        (old || []).map((u: any) => u.id === id ? { ...u, role } : u)
      );
      return { previousUsers };
    },
    onError: (err: any, _vars, context: any) => {
      queryClient.setQueryData(["admin-users"], context?.previousUsers);
      toast.error("Failed: " + err.message);
    },
    onSuccess: () => toast.success("Role updated"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  if (authLoading) return <Layout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;

  const totalPending = pendingLocations.length + pendingEquipment.length + pendingCrew.length + pendingTalent.length;

  const locData = isSuperAdmin ? allLocations : pendingLocations;
  const eqData = isSuperAdmin ? allEquipment : pendingEquipment;
  const crewData = isSuperAdmin ? allCrew : pendingCrew;
  const talentData = isSuperAdmin ? allTalent : pendingTalent;
  const isLocLoading = isSuperAdmin ? allLocLoading : locLoading;
  const isEqLoading = isSuperAdmin ? allEqLoading : eqLoading;
  const isCrewLoading = isSuperAdmin ? allCrewLoading : crewLoading;
  const isTalentLoading = isSuperAdmin ? allTalentLoading : talentLoading;

  return (
    <>
    {detail && <DetailModal item={detail.item} type={detail.type} onClose={() => setDetail(null)} />}
    {rejectModal && (
      <RejectReasonModal
        loading={locationMutation.isPending || equipmentMutation.isPending || crewMutation.isPending || talentMutation.isPending}
        onClose={() => setRejectModal(null)}
        onConfirm={(reason) => rejectModal.mutate({ id: rejectModal.id, status: "rejected", rejection_reason: reason })}
      />
    )}

    {/* Delete confirmation modal */}
    {deleteConfirm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-500/15 p-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="font-semibold text-foreground">Confirm Delete</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to permanently delete <span className="font-medium text-foreground">"{deleteConfirm.name}"</span>? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteListingMutation.isPending || deleteUserMutation.isPending}
              onClick={() => {
                if (deleteConfirm.type === "users") {
                  deleteUserMutation.mutate(deleteConfirm.id);
                } else {
                  deleteListingMutation.mutate({ type: deleteConfirm.type, id: deleteConfirm.id });
                }
              }}
            >
              {(deleteListingMutation.isPending || deleteUserMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </Button>
          </div>
        </div>
      </div>
    )}

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
                {isLocLoading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  : locData.length === 0 ? <p className="p-8 text-center text-muted-foreground">{isSuperAdmin ? "No locations." : "No pending locations."}</p>
                  : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className="border-b border-border text-sm text-muted-foreground">
                          <th className="p-4 text-left font-medium">Name</th>
                          <th className="p-4 text-left font-medium">City</th>
                          <th className="p-4 text-left font-medium">Owner</th>
                          {isSuperAdmin && <th className="p-4 text-left font-medium">Status</th>}
                          <th className="p-4 text-left font-medium">Price/Day</th>
                          <th className="p-4 text-right font-medium">Actions</th>
                        </tr></thead>
                        <tbody>
                          {locData.map((loc: any) => (
                            <tr key={loc.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer" onClick={() => setDetail({ item: loc, type: "location" })}>
                              <td className="p-4 font-medium text-foreground flex items-center gap-1">{loc.name}<ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /></td>
                              <td className="p-4 text-muted-foreground">{loc.city}</td>
                              <td className="p-4 text-muted-foreground">{loc.first_name} {loc.last_name}</td>
                              {isSuperAdmin && <td className="p-4">{statusBadge(loc.status)}</td>}
                              <td className="p-4 text-primary">${Number(loc.price_per_day) || 0}</td>
                              <td className="p-4" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-end items-center gap-2">
                                  {loc.status === "pending" && (
                                    <ApproveRejectButtons
                                      loading={locationMutation.isPending}
                                      onApprove={() => locationMutation.mutate({ id: loc.id, status: "approved" })}
                                      onReject={() => setRejectModal({ id: loc.id, mutate: locationMutation.mutate })}
                                    />
                                  )}
                                  {isSuperAdmin && (
                                    <Button size="sm" variant="outline" className="text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={() => setDeleteConfirm({ type: "locations", id: loc.id, name: loc.name })}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
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
                {isEqLoading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  : eqData.length === 0 ? <p className="p-8 text-center text-muted-foreground">{isSuperAdmin ? "No equipment." : "No pending equipment."}</p>
                  : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className="border-b border-border text-sm text-muted-foreground">
                          <th className="p-4 text-left font-medium">Name</th>
                          <th className="p-4 text-left font-medium">Category</th>
                          <th className="p-4 text-left font-medium">Owner</th>
                          {isSuperAdmin && <th className="p-4 text-left font-medium">Status</th>}
                          <th className="p-4 text-left font-medium">Rate/Day</th>
                          <th className="p-4 text-right font-medium">Actions</th>
                        </tr></thead>
                        <tbody>
                          {eqData.map((eq: any) => (
                            <tr key={eq.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer" onClick={() => setDetail({ item: eq, type: "equipment" })}>
                              <td className="p-4 font-medium text-foreground flex items-center gap-1">{eq.name}<ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /></td>
                              <td className="p-4 text-muted-foreground capitalize">{eq.category}</td>
                              <td className="p-4 text-muted-foreground">{eq.first_name} {eq.last_name}</td>
                              {isSuperAdmin && <td className="p-4">{statusBadge(eq.approval_status)}</td>}
                              <td className="p-4 text-primary">${Number(eq.daily_rate) || 0}</td>
                              <td className="p-4" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-end items-center gap-2">
                                  {eq.approval_status === "pending" && (
                                    <ApproveRejectButtons
                                      loading={equipmentMutation.isPending}
                                      onApprove={() => equipmentMutation.mutate({ id: eq.id, status: "approved" })}
                                      onReject={() => setRejectModal({ id: eq.id, mutate: equipmentMutation.mutate })}
                                    />
                                  )}
                                  {isSuperAdmin && (
                                    <Button size="sm" variant="outline" className="text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={() => setDeleteConfirm({ type: "equipment", id: eq.id, name: eq.name })}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
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
                {isCrewLoading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  : crewData.length === 0 ? <p className="p-8 text-center text-muted-foreground">{isSuperAdmin ? "No crew profiles." : "No pending crew profiles."}</p>
                  : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className="border-b border-border text-sm text-muted-foreground">
                          <th className="p-4 text-left font-medium">Name</th>
                          <th className="p-4 text-left font-medium">Role</th>
                          <th className="p-4 text-left font-medium">Email</th>
                          {isSuperAdmin && <th className="p-4 text-left font-medium">Status</th>}
                          <th className="p-4 text-left font-medium">Experience</th>
                          <th className="p-4 text-right font-medium">Actions</th>
                        </tr></thead>
                        <tbody>
                          {crewData.map((c: any) => (
                            <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer" onClick={() => setDetail({ item: c, type: "crew" })}>
                              <td className="p-4 font-medium text-foreground flex items-center gap-1">{c.first_name} {c.last_name}<ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /></td>
                              <td className="p-4 text-muted-foreground">{roleLabels[c.role] || c.role}</td>
                              <td className="p-4 text-muted-foreground">{c.email}</td>
                              {isSuperAdmin && <td className="p-4">{statusBadge(c.status)}</td>}
                              <td className="p-4 text-muted-foreground">{c.experience_years || 0} yrs</td>
                              <td className="p-4" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-end items-center gap-2">
                                  {c.status === "pending" && (
                                    <ApproveRejectButtons
                                      loading={crewMutation.isPending}
                                      onApprove={() => crewMutation.mutate({ id: c.id, status: "approved" })}
                                      onReject={() => setRejectModal({ id: c.id, mutate: crewMutation.mutate })}
                                    />
                                  )}
                                  {isSuperAdmin && (
                                    <Button size="sm" variant="outline" className="text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={() => setDeleteConfirm({ type: "crew", id: c.id, name: `${c.first_name} ${c.last_name}` })}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
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
                {isTalentLoading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  : talentData.length === 0 ? <p className="p-8 text-center text-muted-foreground">{isSuperAdmin ? "No talent profiles." : "No pending talent profiles."}</p>
                  : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className="border-b border-border text-sm text-muted-foreground">
                          <th className="p-4 text-left font-medium">Name</th>
                          <th className="p-4 text-left font-medium">Type</th>
                          <th className="p-4 text-left font-medium">Gender</th>
                          <th className="p-4 text-left font-medium">Email</th>
                          {isSuperAdmin && <th className="p-4 text-left font-medium">Status</th>}
                          <th className="p-4 text-right font-medium">Actions</th>
                        </tr></thead>
                        <tbody>
                          {talentData.map((t: any) => (
                            <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer" onClick={() => setDetail({ item: t, type: "talent" })}>
                              <td className="p-4 font-medium text-foreground flex items-center gap-1">{t.first_name} {t.last_name}<ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /></td>
                              <td className="p-4"><Badge variant="secondary" className="capitalize">{t.profile_type}</Badge></td>
                              <td className="p-4 text-muted-foreground capitalize">{t.gender || "—"}</td>
                              <td className="p-4 text-muted-foreground">{t.email}</td>
                              {isSuperAdmin && <td className="p-4">{statusBadge(t.status)}</td>}
                              <td className="p-4" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-end items-center gap-2">
                                  {t.status === "pending" && (
                                    <ApproveRejectButtons
                                      loading={talentMutation.isPending}
                                      onApprove={() => talentMutation.mutate({ id: t.id, status: "approved" })}
                                      onReject={() => setRejectModal({ id: t.id, mutate: talentMutation.mutate })}
                                    />
                                  )}
                                  {isSuperAdmin && (
                                    <Button size="sm" variant="outline" className="text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={() => setDeleteConfirm({ type: "talent", id: t.id, name: `${t.first_name} ${t.last_name}` })}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
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
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wide">
                          <th className="p-4 text-left font-medium">Service</th>
                          <th className="p-4 text-left font-medium">Client</th>
                          <th className="p-4 text-left font-medium">Provider</th>
                          <th className="p-4 text-left font-medium">Dates</th>
                          <th className="p-4 text-left font-medium">Type</th>
                          <th className="p-4 text-left font-medium">Status</th>
                          <th className="p-4 text-left font-medium">Amount</th>
                          <th className="p-4 text-left font-medium">Notes</th>
                          <th className="p-4 text-right font-medium">Actions</th>
                        </tr></thead>
                        <tbody>
                          {allBookings.map((b: any) => (
                            <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30 align-top">
                              <td className="p-4">
                                <p className="font-medium text-foreground">{b.service_name || "—"}</p>
                                <Badge variant="outline" className="mt-1 text-xs">{b.service_type}</Badge>
                              </td>
                              <td className="p-4">
                                <p className="font-medium text-foreground">{b.client_first_name} {b.client_last_name}</p>
                                <p className="text-xs text-muted-foreground">{b.client_email}</p>
                              </td>
                              <td className="p-4">
                                <p className="font-medium text-foreground">{b.provider_first_name} {b.provider_last_name}</p>
                                <p className="text-xs text-muted-foreground">{b.provider_email}</p>
                              </td>
                              <td className="p-4 text-muted-foreground whitespace-nowrap">
                                <p>{b.start_date?.slice(0, 10)}</p>
                                <p className="text-xs">→ {b.end_date?.slice(0, 10)}</p>
                              </td>
                              <td className="p-4 text-muted-foreground">{b.booking_type || "—"}</td>
                              <td className="p-4">
                                <Badge className={
                                  b.status === "confirmed" ? "bg-green-600" :
                                  b.status === "cancelled" ? "bg-red-600" :
                                  b.status === "completed" ? "bg-blue-600" : ""
                                }>{b.status}</Badge>
                              </td>
                              <td className="p-4 font-semibold text-primary whitespace-nowrap">${Number(b.total_price) || 0}</td>
                              <td className="p-4 text-muted-foreground max-w-[160px]">
                                <p className="line-clamp-2 text-xs">{b.notes || "—"}</p>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {b.status === "pending" && (
                                    <>
                                      <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700 text-white px-2 text-xs" disabled={bookingMutation.isPending}
                                        onClick={() => bookingMutation.mutate({ id: b.id, status: "confirmed" })}>
                                        <Check className="h-3 w-3 mr-1" /> Confirm
                                      </Button>
                                      <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" disabled={bookingMutation.isPending}
                                        onClick={() => bookingMutation.mutate({ id: b.id, status: "cancelled" })}>
                                        <X className="h-3 w-3 mr-1" /> Cancel
                                      </Button>
                                    </>
                                  )}
                                  {b.status === "confirmed" && (
                                    <>
                                      <Button size="sm" className="h-7 bg-blue-600 hover:bg-blue-700 text-white px-2 text-xs" disabled={bookingMutation.isPending}
                                        onClick={() => bookingMutation.mutate({ id: b.id, status: "completed" })}>
                                        <Check className="h-3 w-3 mr-1" /> Complete
                                      </Button>
                                      <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" disabled={bookingMutation.isPending}
                                        onClick={() => bookingMutation.mutate({ id: b.id, status: "cancelled" })}>
                                        <X className="h-3 w-3 mr-1" /> Cancel
                                      </Button>
                                    </>
                                  )}
                                  {(b.status === "completed" || b.status === "cancelled") && (
                                    <span className="text-xs text-muted-foreground">—</span>
                                  )}
                                </div>
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
                          <th className="p-4 text-left font-medium">Gender</th>
                          <th className="p-4 text-left font-medium">Verified</th>
                          <th className="p-4 text-left font-medium">Joined</th>
                          <th className="p-4 text-left font-medium">Role</th>
                          <th className="p-4 text-right font-medium">Actions</th>
                        </tr></thead>
                        <tbody>
                          {allUsers.map((u: any) => (
                            <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="p-4 font-medium text-foreground">{u.first_name} {u.last_name}</td>
                              <td className="p-4 text-muted-foreground text-sm">{u.email}</td>
                              <td className="p-4 text-muted-foreground capitalize text-sm">{u.gender || "—"}</td>
                              <td className="p-4">
                                <Badge variant={u.email_verified ? "default" : "secondary"} className="text-xs">
                                  {u.email_verified ? "Yes" : "No"}
                                </Badge>
                              </td>
                              <td className="p-4 text-muted-foreground text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                              <td className="p-4">
                                {isSuperAdmin && u.role !== "super_admin" && u.id !== user?.id ? (
                                  <Select
                                    value={u.role}
                                    onValueChange={(role) => roleMutation.mutate({ id: u.id, role })}
                                    disabled={roleMutation.isPending}
                                  >
                                    <SelectTrigger className="h-7 text-xs w-36">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {["user", "client", "location_owner", "equipment_provider", "model", "crew", "admin"].map(r => (
                                        <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Badge variant={u.role === "admin" || u.role === "super_admin" ? "default" : "secondary"} className="text-xs">
                                    {u.role}
                                  </Badge>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex justify-end items-center gap-2">
                                  <Link to={`/profile/${u.id}`}>
                                    <Button size="sm" variant="outline" className="gap-1.5">
                                      <ExternalLink className="h-3.5 w-3.5" /> View
                                    </Button>
                                  </Link>
                                  {isSuperAdmin && u.role !== "super_admin" && u.id !== user?.id && (
                                    <Button size="sm" variant="outline" className="text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={() => setDeleteConfirm({ type: "users", id: u.id, name: `${u.first_name} ${u.last_name}` })}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
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
    </>
  );
};

export default Admin;
