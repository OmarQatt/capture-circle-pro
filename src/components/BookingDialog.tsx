import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Loader2, AlertTriangle } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";
import api from "@/integrations/api/client";

interface BookingDialogProps {
  serviceId: string;
  serviceType: "location" | "equipment" | "talent" | "crew";
  providerId: string;
  pricePerDay: number;
  pricePer6Hours?: number;
  pricePer12Hours?: number;
  triggerLabel?: string;
  triggerClassName?: string;
}

type DurationType = "6h" | "12h" | "day";

const BookingDialog = ({
  serviceId, serviceType, providerId, pricePerDay,
  pricePer6Hours, pricePer12Hours,
  triggerLabel = "Request Booking", triggerClassName,
}: BookingDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [durationType, setDurationType] = useState<DurationType>("day");
  const [overlapping, setOverlapping] = useState<any[]>([]);
  const [checkingAvail, setCheckingAvail] = useState(false);

  const pricingOptions = useMemo(() => {
    const opts: { key: DurationType; label: string; price: number }[] = [];
    if (pricePer6Hours) opts.push({ key: "6h", label: "6 Hours", price: pricePer6Hours });
    if (pricePer12Hours) opts.push({ key: "12h", label: "12 Hours", price: pricePer12Hours });
    if (pricePerDay) opts.push({ key: "day", label: "Full Day", price: pricePerDay });
    return opts;
  }, [pricePer6Hours, pricePer12Hours, pricePerDay]);

  const selectedOption = pricingOptions.find(o => o.key === durationType) ?? pricingOptions[pricingOptions.length - 1];

  const days = useMemo(() => {
    if (!range?.from) return 0;
    const to = range.to || range.from;
    return Math.max(1, differenceInCalendarDays(to, range.from) + 1);
  }, [range]);

  const total = days * (selectedOption?.price ?? 0);

  // Check for overlapping bookings whenever dates change
  useEffect(() => {
    if (!range?.from || serviceType !== "location") { setOverlapping([]); return; }
    const start = format(range.from, "yyyy-MM-dd");
    const end = format(range.to || range.from, "yyyy-MM-dd");

    setCheckingAvail(true);
    api.get<any>(`/api/bookings/availability?service_id=${serviceId}&start_date=${start}&end_date=${end}`)
      .then(d => setOverlapping(d.overlapping || []))
      .catch(() => setOverlapping([]))
      .finally(() => setCheckingAvail(false));
  }, [range, serviceId, serviceType]);

  const handleSubmit = async () => {
    if (!user) { toast.error("Please log in first"); navigate("/login"); return; }
    if (user.id === providerId) { toast.error("You cannot book your own listing"); return; }
    if (!range?.from) { toast.error("Please select a start date"); return; }

    setLoading(true);
    try {
      await api.post("/api/bookings", {
        provider_id: providerId,
        service_id: serviceId,
        service_type: serviceType,
        start_date: format(range.from, "yyyy-MM-dd"),
        end_date: format(range.to || range.from, "yyyy-MM-dd"),
        total_price: total,
        notes: notes.trim() || null,
        booking_type: durationType,
      });
      toast.success("Booking request sent!");
      setOpen(false);
      setRange(undefined);
      setNotes("");
      setOverlapping([]);
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setRange(undefined); setOverlapping([]); } }}>
      <DialogTrigger asChild>
        <Button className={cn("w-full bg-gradient-gold text-primary-foreground font-semibold shadow-gold", triggerClassName)}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Confirm Booking</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">

          {/* Duration selector */}
          {pricingOptions.length > 1 && (
            <div>
              <Label>Duration</Label>
              <div className="mt-1.5 grid gap-2" style={{ gridTemplateColumns: `repeat(${pricingOptions.length}, 1fr)` }}>
                {pricingOptions.map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => { setDurationType(opt.key); setRange(undefined); }}
                    className={cn(
                      "flex flex-col items-center rounded-lg border p-3 transition-all",
                      durationType === opt.key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className="text-lg font-bold">${opt.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date picker */}
          <div>
            <Label>Select Date{durationType === "day" ? " Range" : ""}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1", !range && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {range?.from
                    ? durationType === "day" && range.to
                      ? `${format(range.from, "PP")} → ${format(range.to, "PP")}`
                      : format(range.from, "PP")
                    : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode={durationType === "day" ? "range" : "single"}
                  selected={durationType === "day" ? range : range?.from}
                  onSelect={(val: any) => {
                    if (durationType === "day") setRange(val);
                    else setRange(val ? { from: val, to: val } : undefined);
                  }}
                  numberOfMonths={1}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Overlap warning */}
          {checkingAvail && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" /> Checking availability…
            </p>
          )}
          {!checkingAvail && overlapping.length > 0 && (
            <div className="flex gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-400">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">This location already has {overlapping.length} booking{overlapping.length > 1 ? "s" : ""} on the selected date{days > 1 ? "s" : ""}.</p>
                <p className="mt-0.5 text-xs opacity-80">The current occupant may request extra time. Factor in the 2-hour cleaning gap between sessions.</p>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Any extra details for the owner..." maxLength={1000} />
          </div>

          {/* Price summary */}
          <div className="rounded-lg bg-muted/30 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{selectedOption?.label ?? "Day"} Rate</span>
              <span className="text-foreground">${selectedOption?.price ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{durationType === "day" ? "Days" : "Sessions"}</span>
              <span className="text-foreground">{days}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-primary text-lg">${total}</span>
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading || !range?.from} className="w-full bg-gradient-gold text-primary-foreground font-semibold">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Confirm Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
