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

const categories = ["camera", "lens", "lighting", "audio", "grip", "drone", "other"];
const conditions = ["excellent", "good", "fair"];

const AddEquipmentDialog = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", brand: "", model: "",
    category: "camera", condition: "excellent", daily_rate: "",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!user) return;
    if (!form.name.trim()) return toast.error("الرجاء إدخال اسم المعدة");
    setLoading(true);
    const { error } = await supabase.from("equipment").insert({
      user_id: user.id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      brand: form.brand.trim() || null,
      model: form.model.trim() || null,
      category: form.category,
      condition: form.condition,
      daily_rate: form.daily_rate ? Number(form.daily_rate) : null,
      status: "available",
    });
    setLoading(false);
    if (error) return toast.error("فشل الإضافة: " + error.message);
    toast.success("تمت إضافة المعدة بنجاح!");
    setForm({ name: "", description: "", brand: "", model: "", category: "camera", condition: "excellent", daily_rate: "" });
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["my-equipment"] });
    qc.invalidateQueries({ queryKey: ["equipment"] });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Plus className="h-4 w-4 mr-2" /> إضافة معدة</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>إضافة معدة جديدة</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>اسم المعدة *</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="مثال: Sony FX6" />
          </div>
          <div>
            <Label>الوصف</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>العلامة التجارية</Label><Input value={form.brand} onChange={(e) => set("brand", e.target.value)} /></div>
            <div><Label>الموديل</Label><Input value={form.model} onChange={(e) => set("model", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>الفئة</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>الحالة</Label>
              <Select value={form.condition} onValueChange={(v) => set("condition", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{conditions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>السعر اليومي ($)</Label>
            <Input type="number" min="0" value={form.daily_rate} onChange={(e) => set("daily_rate", e.target.value)} />
          </div>
          <Button onClick={submit} disabled={loading} className="w-full bg-gradient-gold text-primary-foreground font-semibold">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} حفظ المعدة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEquipmentDialog;
