import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/integrations/api/client";
import ImageUpload from "@/components/ImageUpload";

const categories = ["camera", "lens", "lighting", "audio", "grip", "drone", "other"];
const conditions = ["excellent", "good", "fair"];

const emptyForm = {
  name: "", description: "", brand: "", model: "",
  category: "camera", condition: "excellent", daily_rate: "",
};

const AddEquipmentDialog = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<string[]>([]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!user) return;
    if (!form.name.trim()) return toast.error("Please enter equipment name");
    setLoading(true);
    try {
      await api.post("/api/equipment", {
        name: form.name.trim(),
        description: form.description.trim() || null,
        brand: form.brand.trim() || null,
        model: form.model.trim() || null,
        category: form.category,
        condition: form.condition,
        daily_rate: form.daily_rate ? Number(form.daily_rate) : null,
        images,
      });
      toast.success("Equipment added successfully!");
      setForm(emptyForm);
      setImages([]);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["my-equipment"] });
      qc.invalidateQueries({ queryKey: ["equipment"] });
    } catch (err: any) {
      toast.error("Failed to add: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Plus className="h-4 w-4 mr-2" /> Add Equipment</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add New Equipment</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>Equipment Name *</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Sony FX6" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Brand</Label><Input value={form.brand} onChange={(e) => set("brand", e.target.value)} /></div>
            <div><Label>Model</Label><Input value={form.model} onChange={(e) => set("model", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Condition</Label>
              <Select value={form.condition} onValueChange={(v) => set("condition", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{conditions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Daily Rate ($)</Label>
            <Input type="number" min="0" value={form.daily_rate} onChange={(e) => set("daily_rate", e.target.value)} />
          </div>
          <ImageUpload urls={images} onChange={setImages} max={8} label="Equipment Photos" />
          <Button onClick={submit} disabled={loading} className="w-full bg-gradient-gold text-primary-foreground font-semibold">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save Equipment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEquipmentDialog;
