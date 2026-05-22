import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/integrations/api/client";
import ImageUpload from "@/components/ImageUpload";

const categories = ["camera", "lens", "lighting", "audio", "grip", "drone", "other"];
const conditions = ["excellent", "good", "fair"];

interface Props {
  equipment: any;
  onClose: () => void;
}

const EditEquipmentDialog = ({ equipment, onClose }: Props) => {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: equipment.name || "",
    description: equipment.description || "",
    brand: equipment.brand || "",
    model: equipment.model || "",
    category: equipment.category || "camera",
    condition: equipment.condition || "excellent",
    daily_rate: equipment.daily_rate ? String(equipment.daily_rate) : "",
  });
  const [images, setImages] = useState<string[]>(equipment.images || []);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) { toast.error("Equipment name is required"); return; }
    setLoading(true);
    try {
      await api.patch(`/api/equipment/${equipment.id}`, {
        name: form.name.trim(),
        description: form.description.trim() || null,
        brand: form.brand.trim() || null,
        model: form.model.trim() || null,
        category: form.category,
        condition: form.condition,
        daily_rate: form.daily_rate ? Number(form.daily_rate) : null,
        images,
      });
      toast.success("Equipment updated — pending admin re-approval.");
      qc.invalidateQueries({ queryKey: ["my-equipment"] });
      qc.invalidateQueries({ queryKey: ["equipment"] });
      onClose();
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Equipment</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div><Label>Equipment Name *</Label><Input value={form.name} onChange={e => set("name", e.target.value)} /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Brand</Label><Input value={form.brand} onChange={e => set("brand", e.target.value)} /></div>
            <div><Label>Model</Label><Input value={form.model} onChange={e => set("model", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Condition</Label>
              <Select value={form.condition} onValueChange={v => set("condition", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{conditions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Daily Rate ($)</Label><Input type="number" min="0" value={form.daily_rate} onChange={e => set("daily_rate", e.target.value)} /></div>
          <ImageUpload urls={images} onChange={setImages} max={8} label="Equipment Photos" />
          <p className="text-xs text-amber-500">Saving will reset this listing to pending admin re-approval.</p>
          <Button onClick={submit} disabled={loading} className="w-full bg-gradient-gold text-primary-foreground font-semibold">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEquipmentDialog;
