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

const categories = [
  { value: "villa", label: "Villa" },
  { value: "studio", label: "Studio" },
  { value: "warehouse", label: "Warehouse" },
  { value: "beach", label: "Beach" },
  { value: "historical", label: "Historical" },
  { value: "office", label: "Office" },
  { value: "outdoor", label: "Outdoor" },
];

const AddLocationDialog = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    country: "Saudi Arabia",
    category: "studio",
    price_per_hour: "",
    price_per_day: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.name.trim() || !form.city.trim()) {
      toast.error("Please fill in at least the name and city.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("locations").insert({
      user_id: user.id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      address: form.address.trim() || null,
      city: form.city.trim(),
      country: form.country.trim() || "Saudi Arabia",
      category: form.category,
      price_per_hour: form.price_per_hour ? Number(form.price_per_hour) : null,
      price_per_day: form.price_per_day ? Number(form.price_per_day) : null,
      status: "pending",
    });
    setLoading(false);

    if (error) {
      toast.error("Failed to submit location: " + error.message);
      return;
    }

    toast.success("Location submitted for admin approval!");
    setForm({ name: "", description: "", address: "", city: "", country: "Saudi Arabia", category: "studio", price_per_hour: "", price_per_day: "" });
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ["my-locations"] });
    queryClient.invalidateQueries({ queryKey: ["locations"] });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-gold text-primary-foreground font-semibold">
          <Plus className="h-4 w-4 mr-2" /> Add Listing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
        </DialogHeader>
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
              <Input id="loc-city" placeholder="e.g. Riyadh" value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="loc-pph">Price / Hour ($)</Label>
              <Input id="loc-pph" type="number" min="0" placeholder="0" value={form.price_per_hour} onChange={(e) => handleChange("price_per_hour", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="loc-ppd">Price / Day ($)</Label>
              <Input id="loc-ppd" type="number" min="0" placeholder="0" value={form.price_per_day} onChange={(e) => handleChange("price_per_day", e.target.value)} />
            </div>
          </div>
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
