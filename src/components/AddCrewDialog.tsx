import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const roles = [
  { v: "director_of_photography", l: "مدير تصوير (DP)" },
  { v: "first_ac", l: "1st AC" },
  { v: "second_ac", l: "2nd AC" },
  { v: "third_ac", l: "3rd AC" },
  { v: "camera_operator", l: "مشغل كاميرا" },
  { v: "gaffer", l: "Gaffer" },
  { v: "sound_engineer", l: "مهندس صوت" },
  { v: "editor", l: "مونتير" },
  { v: "director", l: "مخرج" },
];

const AddCrewDialog = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    role: "camera_operator", bio: "", experience_years: "",
    daily_rate: "", skills: "",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("crew_profiles").insert({
      user_id: user.id,
      role: form.role,
      bio: form.bio.trim() || null,
      experience_years: form.experience_years ? Number(form.experience_years) : 0,
      daily_rate: form.daily_rate ? Number(form.daily_rate) : null,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setLoading(false);
    if (error) return toast.error("فشل الإضافة: " + error.message);
    toast.success("تم إنشاء ملف فريق العمل بنجاح!");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["my-crew"] });
    qc.invalidateQueries({ queryKey: ["crew"] });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Plus className="h-4 w-4 mr-2" /> ملف فريق عمل</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>إنشاء ملف فريق عمل</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>الدور</Label>
            <Select value={form.role} onValueChange={(v) => set("role", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{roles.map((r) => <SelectItem key={r.v} value={r.v}>{r.l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>نبذة</Label>
            <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={3} />
          </div>
          <div>
            <Label>المهارات (افصل بفاصلة)</Label>
            <Input value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="ARRI, RED, DaVinci Resolve" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>سنوات الخبرة</Label><Input type="number" value={form.experience_years} onChange={(e) => set("experience_years", e.target.value)} /></div>
            <div><Label>السعر اليومي ($)</Label><Input type="number" value={form.daily_rate} onChange={(e) => set("daily_rate", e.target.value)} /></div>
          </div>
          <Button onClick={submit} disabled={loading} className="w-full bg-gradient-gold text-primary-foreground font-semibold">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} حفظ الملف
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCrewDialog;
