import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Loader2, AlertTriangle, CreditCard, CheckCircle2, ChevronLeft, Lock } from "lucide-react";
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
type Step = "booking" | "payment" | "success";

const formatCardNumber = (v: string) =>
  v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (v: string) => {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
};

const BookingDialog = ({
  serviceId, serviceType, providerId, pricePerDay,
  pricePer6Hours, pricePer12Hours,
  triggerLabel = "Request Booking", triggerClassName,
}: BookingDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("booking");
  const [range, setRange] = useState<DateRange | undefined>();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [durationType, setDurationType] = useState<DurationType>("day");
  const [overlapping, setOverlapping] = useState<any[]>([]);
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [blockedRanges, setBlockedRanges] = useState<Array<{ start_date: string; end_date: string }>>([]);

  // Payment fields
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

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

  // Fetch all blocked date ranges for this service when the dialog opens
  useEffect(() => {
    if (!open) return;
    api.get<any>(`/api/bookings/blocked-dates?service_id=${serviceId}`)
      .then(d => setBlockedRanges(d.ranges || []))
      .catch(() => setBlockedRanges([]));
  }, [open, serviceId]);

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

  const resetDialog = () => {
    setStep("booking");
    setRange(undefined);
    setNotes("");
    setOverlapping([]);
    setCardName("");
    setCardNumber("");
    setExpiry("");
    setCvv("");
  };

  const handleProceedToPayment = () => {
    if (!user) { toast.error("Please log in first"); navigate("/login"); return; }
    if (user.id === providerId) { toast.error("You cannot book your own listing"); return; }
    if (!range?.from) { toast.error("Please select a start date"); return; }
    setStep("payment");
  };

  const handlePay = async () => {
    if (!cardName.trim() || cardNumber.replace(/\s/g, "").length < 16 || expiry.length < 5 || cvv.length < 3) {
      toast.error("Please fill in all payment details");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/bookings", {
        provider_id: providerId,
        service_id: serviceId,
        service_type: serviceType,
        start_date: format(range!.from!, "yyyy-MM-dd"),
        end_date: format(range!.to || range!.from!, "yyyy-MM-dd"),
        total_price: total,
        notes: notes.trim() || null,
        booking_type: durationType,
      });
      setStep("success");
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) resetDialog(); }}>
      <DialogTrigger asChild>
        <Button className={cn("w-full bg-gradient-gold text-primary-foreground font-semibold shadow-gold", triggerClassName)}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">

        {/* ── Success screen ── */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="rounded-full bg-green-500/15 p-5">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-foreground">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground">Your booking request has been sent to the owner.<br />You'll be notified once it's confirmed.</p>
            </div>
            <div className="w-full rounded-lg bg-muted/30 p-4 text-sm space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount paid</span>
                <span className="font-semibold text-primary">${total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dates</span>
                <span>{format(range!.from!, "MMM d")} {range?.to && range.to.getTime() !== range.from!.getTime() ? `→ ${format(range.to, "MMM d, yyyy")}` : format(range!.from!, "yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Card</span>
                <span>•••• {cardNumber.replace(/\s/g, "").slice(-4)}</span>
              </div>
            </div>
            <Button className="w-full bg-gradient-gold text-primary-foreground font-semibold" onClick={() => { setOpen(false); resetDialog(); }}>
              Done
            </Button>
          </div>
        )}

        {/* ── Payment form ── */}
        {step === "payment" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <button onClick={() => setStep("booking")} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <DialogTitle>Payment</DialogTitle>
              </div>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {/* Order summary */}
              <div className="rounded-lg bg-muted/30 p-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{selectedOption?.label ?? "Day"} × {days}</span>
                  <span>${total}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1.5 font-semibold">
                  <span>Total due</span>
                  <span className="text-primary text-base">${total}</span>
                </div>
              </div>

              {/* Card visual */}
              <div className="relative rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-5 text-white shadow-lg overflow-hidden">
                <div className="absolute -top-6 -right-6 h-28 w-28 rounded-full bg-white/10" />
                <div className="absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-white/10" />
                <CreditCard className="h-8 w-8 mb-3 opacity-80" />
                <p className="text-lg font-mono tracking-widest">
                  {cardNumber || "•••• •••• •••• ••••"}
                </p>
                <div className="flex justify-between mt-3 text-sm opacity-80">
                  <span>{cardName || "CARDHOLDER NAME"}</span>
                  <span>{expiry || "MM/YY"}</span>
                </div>
              </div>

              {/* Card fields */}
              <div className="space-y-3">
                <div>
                  <Label>Cardholder Name</Label>
                  <Input
                    className="mt-1"
                    placeholder="John Smith"
                    value={cardName}
                    onChange={e => setCardName(e.target.value.toUpperCase())}
                  />
                </div>
                <div>
                  <Label>Card Number</Label>
                  <Input
                    className="mt-1 font-mono tracking-widest"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    inputMode="numeric"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Expiry</Label>
                    <Input
                      className="mt-1"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={e => setExpiry(formatExpiry(e.target.value))}
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <Label>CVV</Label>
                    <Input
                      className="mt-1"
                      placeholder="123"
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      inputMode="numeric"
                      type="password"
                    />
                  </div>
                </div>
              </div>

              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" /> Your payment info is encrypted and secure.
              </p>

              <Button
                onClick={handlePay}
                disabled={loading}
                className="w-full bg-gradient-gold text-primary-foreground font-semibold"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Pay ${total}
              </Button>
            </div>
          </>
        )}

        {/* ── Booking form ── */}
        {step === "booking" && (
          <>
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
                      disabled={(d) => {
                        if (d < new Date(new Date().setHours(0, 0, 0, 0))) return true;
                        return blockedRanges.some(r => {
                          const start = new Date(r.start_date);
                          const end = new Date(r.end_date);
                          start.setHours(0, 0, 0, 0);
                          end.setHours(23, 59, 59, 999);
                          return d >= start && d <= end;
                        });
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                      classNames={{ day_today: "border border-primary/60 rounded-md text-foreground" }}
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

              <Button onClick={handleProceedToPayment} disabled={!range?.from} className="w-full bg-gradient-gold text-primary-foreground font-semibold">
                Proceed to Payment
              </Button>
            </div>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
