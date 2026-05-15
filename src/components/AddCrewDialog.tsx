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

const roles = [
  { v: "director_of_photography", l: "Director of Photography (DP)" },
  { v: "first_ac", l: "1st AC" },
  { v: "second_ac", l: "2nd AC" },
  { v: "third_ac", l: "3rd AC" },
  { v: "camera_operator", l: "Camera Operator" },
  { v: "gaffer", l: "Gaffer" },
  { v: "sound_engineer", l: "Sound Engineer" },
  { v: "editor", l: "Editor" },
  { v: "director", l: "Director" },
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
  const [portfolio, setPortfolio] = useState<string[]>([]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await api.post("/api/crew", {
        role: form.role,
        bio: form.bio.trim() || null,
        experience_years: form.experience_years ? Number(form.experience_years) : 0,
        daily_rate: form.daily_rate ? Number(form.daily_rate) : null,
        skills: form.skills,
        portfolio_urls: portfolio,
      });
      toast.success("Crew role added successfully!");
      setPortfolio([]);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["crew_profiles"] });
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Plus className="h-4 w-4 mr-2" /> Add Crew Role</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Crew Role</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v) => set("role", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{roles.map((r) => <SelectItem key={r.v} value={r.v}>{r.l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={3} />
          </div>
          <div>
            <Label>Skills (comma separated)</Label>
            <Input value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="ARRI, RED, DaVinci Resolve" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Years of Experience</Label><Input type="number" value={form.experience_years} onChange={(e) => set("experience_years", e.target.value)} /></div>
            <div><Label>Daily Rate ($)</Label><Input type="number" value={form.daily_rate} onChange={(e) => set("daily_rate", e.target.value)} /></div>
          </div>
          <ImageUpload urls={portfolio} onChange={setPortfolio} max={1} label="Profile Photo" />
          <Button onClick={submit} disabled={loading} className="w-full bg-gradient-gold text-primary-foreground font-semibold">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCrewDialog;
