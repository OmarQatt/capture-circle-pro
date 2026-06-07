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

const categories = [
  { value: "villa", label: "Villa" },
  { value: "studio", label: "Studio" },
  { value: "warehouse", label: "Warehouse" },
  { value: "beach", label: "Beach" },
  { value: "historical", label: "Historical" },
  { value: "office", label: "Office" },
  { value: "outdoor", label: "Outdoor" },
];

interface Props {
  location: any;
  onClose: () => void;
}

const EditLocationDialog = ({ location, onClose }: Props) => {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: location.name || "",
    description: location.description || "",
    address: location.address || "",
    city: location.city || "",
    country: location.country || "Jordan",
    category: location.category || "studio",
    price_per_6hours: location.price_per_6hours ? String(location.price_per_6hours) : "",
    price_per_12hours: location.price_per_12hours ? String(location.price_per_12hours) : "",
    price_per_day: location.price_per_day ? String(location.price_per_day) : "",
  });
  const [images, setImages] = useState<string[]>(location.images || []);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name.trim() || !form.city.trim()) { toast.error("Name and city are required"); return; }
    setLoading(true);
    try {
      await api.patch(`/api/locations/${location.id}`, {
        name: form.name.trim(),
        description: form.description.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim(),
        country: form.country.trim() || "Jordan",
        category: form.category,
        price_per_6hours: form.price_per_6hours ? Number(form.price_per_6hours) : null,
        price_per_12hours: form.price_per_12hours ? Number(form.price_per_12hours) : null,
        price_per_day: form.price_per_day ? Number(form.price_per_day) : null,
        images,
      });
      toast.success("Location updated — pending admin re-approval.");
      qc.invalidateQueries({ queryKey: ["my-locations"] });
      qc.invalidateQueries({ queryKey: ["locations"] });
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
        <DialogHeader><DialogTitle>Edit Location</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div><Label>Location Name *</Label><Input value={form.name} onChange={e => set("name", e.target.value)} /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>City *</Label><Input value={form.city} onChange={e => set("city", e.target.value)} /></div>
            <div><Label>Country</Label><Input value={form.country} onChange={e => set("country", e.target.value)} /></div>
          </div>
          <div><Label>Address</Label><Input value={form.address} onChange={e => set("address", e.target.value)} /></div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={v => set("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Pricing</Label>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">6 Hours ($)</Label><Input type="number" min="0" value={form.price_per_6hours} onChange={e => set("price_per_6hours", e.target.value)} /></div>
              <div><Label className="text-xs">12 Hours ($)</Label><Input type="number" min="0" value={form.price_per_12hours} onChange={e => set("price_per_12hours", e.target.value)} /></div>
              <div><Label className="text-xs">Day ($)</Label><Input type="number" min="0" value={form.price_per_day} onChange={e => set("price_per_day", e.target.value)} /></div>
            </div>
          </div>
          <ImageUpload urls={images} onChange={setImages} max={10} label="Location Photos" />
          <p className="text-xs text-amber-500">Saving will reset this listing to pending admin re-approval.</p>
          <Button onClick={submit} disabled={loading} className="w-full bg-gradient-gold text-primary-foreground font-semibold">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditLocationDialog;
