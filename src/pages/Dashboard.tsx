import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, TrendingUp, Loader2, MapPin, Camera, Briefcase, User, Clock, AlertTriangle, Timer } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AddLocationDialog from "@/components/AddLocationDialog";
import AddEquipmentDialog from "@/components/AddEquipmentDialog";
import AddTalentDialog from "@/components/AddTalentDialog";
import AddCrewDialog from "@/components/AddCrewDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/integrations/api/client";
import { useNavigate } from "react-router-dom";
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

const ListingRow = ({ icon: Icon, title, subtitle, status }: {
  icon: any; title: string; subtitle: string; status: string;
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
    <ApprovalBadge status={status} />
  </div>
);

const ExtensionRequestModal = ({ booking, onClose }: { booking: any; onClose: () => void }) => {
  const qc = useQueryClient();
  const [hours, setHours] = useState("1");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const submit = async () => {
    if (!hours || Number(hours) < 1) { toast.error("Enter at least 1 hour"); return; }
    setLoading(true);
    try {
      const res: any = await api.post(`/api/bookings/${booking.id}/request-extension`, {
        hours: Number(hours), note: note.trim() || null,
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
          <Label>{t('dashboard.additionalHours')}</Label>
          <Input type="number" min={1} max={12} value={hours} onChange={e => setHours(e.target.value)} className="mt-1" />
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

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [extensionBooking, setExtensionBooking] = useState<any>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: !!user,
    queryFn: () => api.get<any[]>("/api/bookings/my-bookings?limit=10"),
  });

  const { data: myLocations = [] } = useQuery({
    queryKey: ["my-locations", user?.id],
    enabled: !!user,
    queryFn: () => api.get<any[]>("/api/locations/my-locations"),
  });

  const { data: myEquipment = [] } = useQuery({
    queryKey: ["my-equipment", user?.id],
    enabled: !!user,
    queryFn: () => api.get<any[]>("/api/equipment/my-equipment"),
  });

  const { data: myCrew = [] } = useQuery({
    queryKey: ["my-crew", user?.id],
    enabled: !!user,
    queryFn: () => api.get<any[]>("/api/crew/my-profiles"),
  });

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
                      <ListingRow
                        key={l.id}
                        icon={MapPin}
                        title={l.name}
                        subtitle={t('dashboard.locationCity', { city: l.city || '—' })}
                        status={l.status}
                      />
                    ))}

                    {myEquipment.map((e: any) => (
                      <ListingRow
                        key={e.id}
                        icon={Camera}
                        title={e.name}
                        subtitle={t('dashboard.equipmentItem', { brand: e.brand || e.category || '—' })}
                        status={e.approval_status || "pending"}
                      />
                    ))}

                    {myCrew.map((c: any) => (
                      <ListingRow
                        key={c.id}
                        icon={Briefcase}
                        title={t(`crew.roles.${c.role}`, { defaultValue: c.role })}
                        subtitle={t('dashboard.crewItem', { years: c.experience_years || 0 })}
                        status={c.status || "pending"}
                      />
                    ))}

                    {myTalent && (
                      <ListingRow
                        icon={User}
                        title={`${myTalent.profile_type?.charAt(0).toUpperCase()}${myTalent.profile_type?.slice(1)} Profile`}
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
