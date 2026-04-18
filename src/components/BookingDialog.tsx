import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";

interface BookingDialogProps {
  serviceId: string;
  serviceType: "location" | "equipment" | "talent" | "crew";
  providerId: string;
  pricePerDay: number;
  triggerLabel?: string;
  triggerClassName?: string;
}

const BookingDialog = ({
  serviceId, serviceType, providerId, pricePerDay,
  triggerLabel = "طلب الحجز", triggerClassName,
}: BookingDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const days = useMemo(() => {
    if (!range?.from) return 0;
    const to = range.to || range.from;
    return Math.max(1, differenceInCalendarDays(to, range.from) + 1);
  }, [range]);

  const total = days * (pricePerDay || 0);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("الرجاء تسجيل الدخول أولاً");
      navigate("/login");
      return;
    }
    if (user.id === providerId) {
      toast.error("لا يمكنك حجز قائمتك الخاصة");
      return;
    }
    if (!range?.from) {
      toast.error("الرجاء اختيار تاريخ البداية");
      return;
    }
    const startDate = range.from;
    const endDate = range.to || range.from;

    setLoading(true);
    const { error } = await supabase.from("bookings").insert({
      client_id: user.id,
      provider_id: providerId,
      service_id: serviceId,
      service_type: serviceType,
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
      total_price: total,
      notes: notes.trim() || null,
      status: "pending",
    });
    setLoading(false);

    if (error) {
      toast.error("فشل إنشاء الحجز: " + error.message);
      return;
    }
    toast.success("تم إرسال طلب الحجز بنجاح!");
    setOpen(false);
    setRange(undefined);
    setNotes("");
    qc.invalidateQueries({ queryKey: ["my-bookings"] });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn("w-full bg-gradient-gold text-primary-foreground font-semibold shadow-gold", triggerClassName)}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>تأكيد الحجز</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>اختر نطاق التواريخ</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1", !range && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {range?.from ? (
                    range.to ? `${format(range.from, "PP")} → ${format(range.to, "PP")}` : format(range.from, "PP")
                  ) : "اختر التواريخ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  numberOfMonths={1}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>ملاحظات (اختياري)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="أي تفاصيل إضافية للمزود..." maxLength={1000} />
          </div>

          <div className="rounded-lg bg-muted/30 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">السعر اليومي</span>
              <span className="text-foreground">${pricePerDay || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">عدد الأيام</span>
              <span className="text-foreground">{days}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <span className="text-foreground">الإجمالي</span>
              <span className="text-primary text-lg">${total}</span>
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading || !range?.from} className="w-full bg-gradient-gold text-primary-foreground font-semibold">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} تأكيد طلب الحجز
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
