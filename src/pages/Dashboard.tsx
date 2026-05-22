import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, TrendingUp, Loader2, MapPin, Camera, Briefcase, User, Clock, AlertTriangle, Timer, CalendarOff, X, Pencil, Trash2, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AddLocationDialog from "@/components/AddLocationDialog";
import AddEquipmentDialog from "@/components/AddEquipmentDialog";
import AddTalentDialog from "@/components/AddTalentDialog";
import AddCrewDialog from "@/components/AddCrewDialog";
import EditLocationDialog from "@/components/EditLocationDialog";
import EditEquipmentDialog from "@/components/EditEquipmentDialog";
import EditCrewDialog from "@/components/EditCrewDialog";
import EditTalentDialog from "@/components/EditTalentDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/integrations/api/client";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const bookingStatusColor = (s: string) => {
  switch (s) {
    case "confirmed": return "bg-green-600";
    case "pending":   return "bg-amber-600";
    case "completed": return "bg-blue-600";
    case "cancelled": return "bg-red-600";
    default:          return "bg-muted";
  }
};

const ApprovalBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  switch (status) {
    case "approved": return <Badge className="bg-green-600 shrink-0">{t('dashboard.approved')}</Badge>;
    case "rejected": return <Badge className="bg-red-600 shrink-0">{t('dashboard.rejected')}</Badge>;
    default:         return <Badge className="bg-amber-600 shrink-0">{t('dashboard.pendingReview')}</Badge>;
  }
};

const ListingRow = ({ icon: Icon, title, subtitle, status, onEdit, onDelete }: {
  icon: any; title: string; subtitle: string; status: string;
  onEdit?: () => void; onDelete?: () => void;
}) => (
  <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/20">
    <div className="flex items-center gap-3 min-w-0">
      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="font-medium text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      {onEdit && (
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={onEdit}>
          <Pencil className="h-3 w-3" /> Edit
        </Button>
      )}
      {onDelete && (
        <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 border-red-500/30 px-2" onClick={onDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
      <ApprovalBadge status={status} />
    </div>
  </div>
);

const ExtensionRequestModal = ({ booking, onClose }: { booking: any; onClose: () => void }) => {
  const qc = useQueryClient();
  const [amount, setAmount] = useState("1");
  const [unit, setUnit] = useState<"hours" | "days">("hours");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const totalHours = unit === "days" ? Number(amount) * 24 : Number(amount);

  const submit = async () => {
    if (!amount || Number(amount) < 1) { toast.error(unit === "hours" ? "Enter at least 1 hour" : "Enter at least 1 day"); return; }
    setLoading(true);
    try {
      const res: any = await api.post(`/api/bookings/${booking.id}/request-extension`, {
        hours: totalHours, note: note.trim() || null,
      });
      if ((res as any)?.warning) {
        toast.warning("Request sent. Note: another booking exists on that day — owner will decide.");
      } else {
        toast.success("Extension request sent to the owner!");
      }
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
      onClose();
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold text-foreground">{t('dashboard.extensionTitle')}</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('dashboard.extensionBooking', {
            type: booking.service_type,
            start: booking.start_date?.slice(0, 10),
            end: booking.end_date?.slice(0, 10),
          })}
        </p>
        <div>
          <Label>Additional Time Needed</Label>
          <div className="mt-1 flex gap-2">
            <Input
              type="number"
              min={1}
              max={unit === "hours" ? 23 : 30}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="flex-1"
            />
            <div className="flex rounded-md border border-border overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => { setUnit("hours"); setAmount("1"); }}
                className={`px-3 py-2 text-sm transition-colors ${unit === "hours" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
              >
                Hours
              </button>
              <button
                type="button"
                onClick={() => { setUnit("days"); setAmount("1"); }}
                className={`px-3 py-2 text-sm transition-colors ${unit === "days" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
              >
                Days
              </button>
            </div>
          </div>
          {unit === "days" && Number(amount) >= 1 && (
            <p className="mt-1 text-xs text-muted-foreground">= {totalHours} hours total</p>
          )}
        </div>
        <div>
          <Label>{t('dashboard.messageToOwner')}</Label>
          <Input value={note} onChange={e => setNote(e.target.value)} placeholder={t('dashboard.messagePlaceholder')} className="mt-1" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>{t('dashboard.cancel')}</Button>
          <Button className="flex-1 bg-gradient-gold text-primary-foreground font-semibold" onClick={submit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin me-1" />} {t('dashboard.sendRequest')}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ExternalBookingDialog = ({ location, onClose }: { location: any; onClose: () => void }) => {
  const qc = useQueryClient();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [overlapping, setOverlapping] = useState<any[]>([]);
  const [checkingAvail, setCheckingAvail] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!startDate || !endDate) { setOverlapping([]); return; }
    setCheckingAvail(true);
    api.get<any>(`/api/bookings/availability?service_id=${location.id}&start_date=${startDate}&end_date=${endDate}`)
      .then(d => setOverlapping(d.overlapping || []))
      .catch(() => setOverlapping([]))
      .finally(() => setCheckingAvail(false));
  }, [startDate, endDate, location.id]);

  const submit = async () => {
    if (!startDate || !endDate) { toast.error("Select both start and end dates"); return; }
    if (new Date(endDate) < new Date(startDate)) { toast.error("End date must be after start date"); return; }
    setLoading(true);
    try {
      await api.post("/api/bookings/external", { service_id: location.id, service_type: "location", start_date: startDate, end_date: endDate, note });
      toast.success("Dates blocked successfully!");
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
      onClose();
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarOff className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-foreground">Block Dates</h3>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <p className="text-sm text-muted-foreground">Block dates for <span className="font-medium text-foreground">{location.name}</span> so users can't book them.</p>
        <div>
          <Label>Start Date</Label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1" min={new Date().toISOString().slice(0, 10)} />
        </div>
        <div>
          <Label>End Date</Label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1" min={startDate || new Date().toISOString().slice(0, 10)} />
        </div>
        {checkingAvail && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" /> Checking existing bookings…
          </p>
        )}
        {!checkingAvail && overlapping.length > 0 && (
          <div className="flex gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">There {overlapping.length === 1 ? "is" : "are"} {overlapping.length} existing booking{overlapping.length > 1 ? "s" : ""} on these dates.</p>
              <p className="mt-0.5 text-xs opacity-80">You can still block — existing confirmed bookings will remain active.</p>
            </div>
          </div>
        )}
        <div>
          <Label>Note (optional)</Label>
          <Input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g., Private event, maintenance..." className="mt-1" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>{t('dashboard.cancel')}</Button>
          <Button className="flex-1 bg-gradient-gold text-primary-foreground font-semibold" onClick={submit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Block Dates
          </Button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [extensionBooking, setExtensionBooking] = useState<any>(null);
  const [blockLocation, setBlockLocation] = useState<any>(null);
  const [editItem, setEditItem] = useState<{ type: string; item: any } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { t } = useTranslation();

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const { type, id } = deleteConfirm;
      if (type === "location") await api.delete(`/api/locations/${id}`);
      else if (type === "equipment") await api.delete(`/api/equipment/${id}`);
      else if (type === "crew") await api.delete(`/api/crew/${id}`);
      else if (type === "talent") await api.delete(`/api/talent/${id}`);
      toast.success("Deleted successfully.");
      qc.invalidateQueries({ queryKey: ["my-locations"] });
      qc.invalidateQueries({ queryKey: ["my-equipment"] });
      qc.invalidateQueries({ queryKey: ["my-crew"] });
      qc.invalidateQueries({ queryKey: ["my-talent"] });
      setDeleteConfirm(null);
    } catch (err: any) {
      toast.error("Failed to delete: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  const { data: bookingsRaw, isLoading: bookingsLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: !!user,
    queryFn: () => api.get<any[]>("/api/bookings/my-bookings?limit=10"),
  });
  const bookings: any[] = Array.isArray(bookingsRaw) ? bookingsRaw : [];

  const { data: locationsRaw } = useQuery({
    queryKey: ["my-locations", user?.id],
    enabled: !!user,
    queryFn: () => api.get<any[]>("/api/locations/my-locations"),
  });
  const myLocations: any[] = Array.isArray(locationsRaw) ? locationsRaw : [];

  const { data: equipmentRaw } = useQuery({
    queryKey: ["my-equipment", user?.id],
    enabled: !!user,
    queryFn: () => api.get<any[]>("/api/equipment/my-equipment"),
  });
  const myEquipment: any[] = Array.isArray(equipmentRaw) ? equipmentRaw : [];

  const { data: crewRaw } = useQuery({
    queryKey: ["my-crew", user?.id],
    enabled: !!user,
    queryFn: () => api.get<any[]>("/api/crew/my-profiles"),
  });
  const myCrew: any[] = Array.isArray(crewRaw) ? crewRaw : [];

  const { data: myTalent } = useQuery({
    queryKey: ["my-talent", user?.id],
    enabled: !!user,
    queryFn: () => api.get<any>("/api/talent/my-profile").catch(() => null),
  });

  const extensionMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/api/bookings/${id}/extension-status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
      toast.success("Extension response sent!");
    },
    onError: (err: any) => toast.error("Failed: " + err.message),
  });

  if (authLoading) return (
    <Layout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>
  );

  const totalListings = myLocations.length + myEquipment.length + myCrew.length + (myTalent ? 1 : 0);
  const pendingCount = [
    ...myLocations.filter((l: any) => l.status === "pending"),
    ...myEquipment.filter((e: any) => e.approval_status === "pending"),
    ...myCrew.filter((c: any) => c.status === "pending"),
    ...(myTalent?.status === "pending" ? [myTalent] : []),
  ].length;

  return (
    <>
    {extensionBooking && (
      <ExtensionRequestModal booking={extensionBooking} onClose={() => setExtensionBooking(null)} />
    )}
    {blockLocation && (
      <ExternalBookingDialog location={blockLocation} onClose={() => setBlockLocation(null)} />
    )}
    {editItem?.type === "location" && <EditLocationDialog location={editItem.item} onClose={() => setEditItem(null)} />}
    {editItem?.type === "equipment" && <EditEquipmentDialog equipment={editItem.item} onClose={() => setEditItem(null)} />}
    {editItem?.type === "crew" && <EditCrewDialog crew={editItem.item} onClose={() => setEditItem(null)} />}
    {editItem?.type === "talent" && <EditTalentDialog talent={editItem.item} onClose={() => setEditItem(null)} />}
    {deleteConfirm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 space-y-4 shadow-xl">
          <h3 className="font-semibold text-foreground">Delete {deleteConfirm.type}?</h3>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete <span className="font-medium text-foreground">{deleteConfirm.name}</span>? This cannot be undone.</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Delete
            </Button>
          </div>
        </div>
      </div>
    )}
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-4xl text-foreground">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground">{t('dashboard.welcome', { name: user?.first_name || 'User' })}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AddLocationDialog />
            <AddEquipmentDialog />
            <AddTalentDialog />
            <AddCrewDialog />
            {(user?.role === "admin" || user?.role === "super_admin") && (
              <Link to="/admin">
                <Button variant="outline" className="gap-2 border-primary/50 text-primary hover:bg-primary/10">
                  <Shield className="h-4 w-4" /> Admin Panel
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{t('dashboard.myBookings')}</p>
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{bookings.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{t('dashboard.totalListings')}</p>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{totalListings}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{t('dashboard.pendingReview')}</p>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-amber-500">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{t('dashboard.approved')}</p>
                <DollarSign className="h-4 w-4 text-green-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-green-500">{totalListings - pendingCount}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="listings">
          <TabsList>
            <TabsTrigger value="listings">
              {t('dashboard.myListings')}
              {pendingCount > 0 && <Badge className="ms-1.5 h-5 px-1.5 text-xs bg-amber-600">{pendingCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="bookings">{t('dashboard.myBookingsTab')}</TabsTrigger>
          </TabsList>

          {/* ── My Listings ── */}
          <TabsContent value="listings" className="mt-4">
            <Card className="border-border/50">
              <CardContent className="p-6">
                {totalListings === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">{t('dashboard.noListings')}</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <AddLocationDialog />
                      <AddEquipmentDialog />
                      <AddTalentDialog />
                      <AddCrewDialog />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myLocations.map((l: any) => (
                      <div key={l.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/20">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                            <MapPin className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{l.name}</p>
                            <p className="text-xs text-muted-foreground">{t('dashboard.locationCity', { city: l.city || '—' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                          {l.status === "approved" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-amber-500 border-amber-500/30" onClick={() => setBlockLocation(l)}>
                              <CalendarOff className="h-3 w-3" /> Block
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setEditItem({ type: "location", item: l })}>
                            <Pencil className="h-3 w-3" /> Edit
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 border-red-500/30 px-2" onClick={() => setDeleteConfirm({ type: "location", id: l.id, name: l.name })}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <ApprovalBadge status={l.status} />
                        </div>
                      </div>
                    ))}

                    {myEquipment.map((e: any) => (
                      <ListingRow
                        key={e.id}
                        icon={Camera}
                        title={e.name}
                        subtitle={t('dashboard.equipmentItem', { brand: e.brand || e.category || '—' })}
                        status={e.approval_status || "pending"}
                        onEdit={() => setEditItem({ type: "equipment", item: e })}
                        onDelete={() => setDeleteConfirm({ type: "equipment", id: e.id, name: e.name })}
                      />
                    ))}

                    {myCrew.map((c: any) => (
                      <ListingRow
                        key={c.id}
                        icon={Briefcase}
                        title={t(`crew.roles.${c.role}`, { defaultValue: c.role })}
                        subtitle={t('dashboard.crewItem', { years: c.experience_years || 0 })}
                        status={c.status || "pending"}
                        onEdit={() => setEditItem({ type: "crew", item: c })}
                        onDelete={() => setDeleteConfirm({ type: "crew", id: c.id, name: t(`crew.roles.${c.role}`, { defaultValue: c.role }) })}
                      />
                    ))}

                    {myTalent && (
                      <ListingRow
                        icon={User}
                        title={`${myTalent.profile_type?.charAt(0).toUpperCase()}${myTalent.profile_type?.slice(1)} Profile`}
                        onEdit={() => setEditItem({ type: "talent", item: myTalent })}
                        onDelete={() => setDeleteConfirm({ type: "talent", id: myTalent.id, name: `${myTalent.profile_type} profile` })}
                        subtitle={t('dashboard.talentItem', { years: myTalent.experience_years || 0 })}
                        status={myTalent.status || "pending"}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── My Bookings ── */}
          <TabsContent value="bookings" className="mt-4">
            <Card className="border-border/50">
              <CardContent className="p-0">
                {bookingsLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : bookings.length === 0 ? (
                  <p className="p-8 text-center text-muted-foreground">{t('dashboard.noBookings')}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-sm text-muted-foreground">
                          <th className="p-4 text-start font-medium">{t('dashboard.type')}</th>
                          <th className="p-4 text-start font-medium">{t('dashboard.dates')}</th>
                          <th className="p-4 text-start font-medium">{t('dashboard.status')}</th>
                          <th className="p-4 text-end font-medium">{t('dashboard.amount')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((b: any) => {
                          const isClient = b.client_id === user?.id;
                          const isOwner = b.provider_id === user?.id;
                          const hasPendingExtension = b.extension_status === 'pending';
                          return (
                          <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="p-4">
                              <Badge variant="outline">{b.service_type}</Badge>
                              {b.booking_type !== 'day' && (
                                <span className="ms-1.5 text-xs text-muted-foreground">({b.booking_type})</span>
                              )}
                            </td>
                            <td className="p-4 text-muted-foreground text-sm">{b.start_date?.slice(0, 10)} → {b.end_date?.slice(0, 10)}</td>
                            <td className="p-4 space-y-1">
                              <Badge className={bookingStatusColor(b.status)}>{b.status}</Badge>
                              {b.extension_status === 'pending' && (
                                <div className="flex items-center gap-1 text-xs text-amber-400">
                                  <AlertTriangle className="h-3 w-3" />
                                  {isOwner
                                    ? t('dashboard.extensionRequested', { hours: b.extension_hours })
                                    : t('dashboard.extensionPending')}
                                </div>
                              )}
                              {b.extension_status === 'approved' && (
                                <span className="text-xs text-green-400">{t('dashboard.extensionApproved', { hours: b.extension_hours })}</span>
                              )}
                              {b.extension_status === 'rejected' && (
                                <span className="text-xs text-red-400">{t('dashboard.extensionRejected')}</span>
                              )}
                            </td>
                            <td className="p-4 text-end">
                              <p className="font-semibold text-primary">${Number(b.total_price) || 0}</p>
                              {isClient && b.status === 'confirmed' && b.extension_status === 'none' && (
                                <Button size="sm" variant="outline" className="mt-1 h-7 text-xs gap-1 text-amber-500 border-amber-500/30"
                                  onClick={() => setExtensionBooking(b)}>
                                  <Timer className="h-3 w-3" /> {t('dashboard.needMoreTime')}
                                </Button>
                              )}
                              {isOwner && hasPendingExtension && (
                                <div className="mt-1 flex gap-1 justify-end">
                                  <Button size="sm" variant="outline" className="h-7 text-xs text-green-500 border-green-500/30"
                                    disabled={extensionMutation.isPending}
                                    onClick={() => extensionMutation.mutate({ id: b.id, status: 'approved' })}>
                                    {t('dashboard.approveExt', { hours: b.extension_hours })}
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 border-red-500/30"
                                    disabled={extensionMutation.isPending}
                                    onClick={() => extensionMutation.mutate({ id: b.id, status: 'rejected' })}>
                                    {t('dashboard.rejectExt')}
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )})}
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

export default Dashboard;
