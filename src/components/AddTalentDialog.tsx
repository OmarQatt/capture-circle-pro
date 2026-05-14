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

const AddTalentDialog = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    bio: "", profile_type: "model", gender: "female", age: "",
    skin_tone: "medium", height: "", weight: "",
    experience_years: "", hourly_rate: "", daily_rate: "",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await api.post("/api/talent", {
        profile_type: form.profile_type,
        bio: form.bio.trim() || null,
        gender: form.gender,
        age: form.age ? Number(form.age) : null,
        skin_tone: form.skin_tone,
        height: form.height ? form.height : null,
        weight: form.weight ? form.weight : null,
        experience_years: form.experience_years ? Number(form.experience_years) : 0,
        hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : null,
        daily_rate: form.daily_rate ? Number(form.daily_rate) : null,
      });
      toast.success("Talent profile created successfully!");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["talent_profiles"] });
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Plus className="h-4 w-4 mr-2" /> Talent Profile</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Create Talent / Casting Profile</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>Type</Label>
            <Select value={form.profile_type} onValueChange={(v) => set("profile_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="model">Model</SelectItem>
                <SelectItem value="actor">Actor</SelectItem>
                <SelectItem value="influencer">Influencer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Age</Label><Input type="number" value={form.age} onChange={(e) => set("age", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Skin Tone</Label>
              <Select value={form.skin_tone} onValueChange={(v) => set("skin_tone", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="olive">Olive</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Height (cm)</Label><Input type="number" value={form.height} onChange={(e) => set("height", e.target.value)} /></div>
            <div><Label>Weight (kg)</Label><Input type="number" value={form.weight} onChange={(e) => set("weight", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Years Exp.</Label><Input type="number" value={form.experience_years} onChange={(e) => set("experience_years", e.target.value)} /></div>
            <div><Label>Hourly ($)</Label><Input type="number" value={form.hourly_rate} onChange={(e) => set("hourly_rate", e.target.value)} /></div>
            <div><Label>Daily ($)</Label><Input type="number" value={form.daily_rate} onChange={(e) => set("daily_rate", e.target.value)} /></div>
          </div>
          <Button onClick={submit} disabled={loading} className="w-full bg-gradient-gold text-primary-foreground font-semibold">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTalentDialog;
