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

const categories = [
  { value: "villa", label: "Villa" },
  { value: "studio", label: "Studio" },
  { value: "warehouse", label: "Warehouse" },
  { value: "beach", label: "Beach" },
  { value: "historical", label: "Historical" },
  { value: "office", label: "Office" },
  { value: "outdoor", label: "Outdoor" },
];

const emptyForm = {
  name: "", description: "", address: "", city: "",
  country: "Jordan", category: "studio",
  price_per_6hours: "", price_per_12hours: "", price_per_day: "",
};

const AddLocationDialog = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<string[]>([]);

  const handleChange = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.name.trim() || !form.city.trim()) {
      toast.error("Please fill in at least the name and city.");
      return;
    }
    if (!form.price_per_6hours && !form.price_per_12hours && !form.price_per_day) {
      toast.error("Please enter at least one price (6h, 12h, or per day).");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/locations", {
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
      toast.success("Location submitted for admin approval!");
      setForm(emptyForm);
      setImages([]);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["my-locations"] });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    } catch (err: any) {
      toast.error("Failed to submit location: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-gold text-primary-foreground font-semibold">
          <Plus className="h-4 w-4 mr-2" /> Add Location
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add New Location</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label htmlFor="loc-name">Location Name *</Label>
            <Input id="loc-name" placeholder="e.g. Desert Villa" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="loc-desc">Description</Label>
            <Textarea id="loc-desc" placeholder="Describe the location..." value={form.description} onChange={(e) => handleChange("description", e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="loc-city">City *</Label>
              <Input id="loc-city" placeholder="e.g. Amman" value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="loc-country">Country</Label>
              <Input id="loc-country" value={form.country} onChange={(e) => handleChange("country", e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="loc-address">Address</Label>
            <Input id="loc-address" placeholder="Full address" value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => handleChange("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Pricing <span className="text-red-500">*</span> <span className="text-xs">(at least one)</span></Label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="loc-pp6h" className="text-xs">6 Hours ($)</Label>
                <Input id="loc-pp6h" type="number" min="0" placeholder="0" value={form.price_per_6hours} onChange={(e) => handleChange("price_per_6hours", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="loc-pp12h" className="text-xs">12 Hours ($)</Label>
                <Input id="loc-pp12h" type="number" min="0" placeholder="0" value={form.price_per_12hours} onChange={(e) => handleChange("price_per_12hours", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="loc-ppd" className="text-xs">Day ($)</Label>
                <Input id="loc-ppd" type="number" min="0" placeholder="0" value={form.price_per_day} onChange={(e) => handleChange("price_per_day", e.target.value)} />
              </div>
            </div>
          </div>
          <ImageUpload urls={images} onChange={setImages} max={10} label="Location Photos" />
          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-gold text-primary-foreground font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Submit for Approval
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddLocationDialog;
