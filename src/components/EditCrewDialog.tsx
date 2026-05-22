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

interface Props {
  crew: any;
  onClose: () => void;
}

const EditCrewDialog = ({ crew, onClose }: Props) => {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    role: crew.role || "camera_operator",
    bio: crew.bio || "",
    experience_years: crew.experience_years ? String(crew.experience_years) : "",
    daily_rate: crew.daily_rate ? String(crew.daily_rate) : "",
    skills: Array.isArray(crew.skills) ? crew.skills.join(", ") : (crew.skills || ""),
  });
  const [portfolio, setPortfolio] = useState<string[]>(crew.portfolio_urls || []);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    setLoading(true);
    try {
      await api.patch(`/api/crew/${crew.id}`, {
        role: form.role,
        bio: form.bio.trim() || null,
        experience_years: form.experience_years ? Number(form.experience_years) : 0,
        daily_rate: form.daily_rate ? Number(form.daily_rate) : null,
        skills: form.skills.split(",").map((s: string) => s.trim()).filter(Boolean),
        portfolio_urls: portfolio,
      });
      toast.success("Crew profile updated — pending admin re-approval.");
      qc.invalidateQueries({ queryKey: ["my-crew"] });
      qc.invalidateQueries({ queryKey: ["crew_profiles"] });
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
        <DialogHeader><DialogTitle>Edit Crew Profile</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>Role</Label>
            <Select value={form.role} onValueChange={v => set("role", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{roles.map(r => <SelectItem key={r.v} value={r.v}>{r.l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Bio</Label><Textarea value={form.bio} onChange={e => set("bio", e.target.value)} rows={3} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Years Experience</Label><Input type="number" value={form.experience_years} onChange={e => set("experience_years", e.target.value)} /></div>
            <div><Label>Daily Rate ($)</Label><Input type="number" value={form.daily_rate} onChange={e => set("daily_rate", e.target.value)} /></div>
          </div>
          <div><Label>Skills (comma separated)</Label><Input value={form.skills} onChange={e => set("skills", e.target.value)} placeholder="e.g. Color Grading, Steadicam" /></div>
          <ImageUpload urls={portfolio} onChange={setPortfolio} max={10} label="Portfolio Photos" />
          <p className="text-xs text-amber-500">Saving will reset this profile to pending admin re-approval.</p>
          <Button onClick={submit} disabled={loading} className="w-full bg-gradient-gold text-primary-foreground font-semibold">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditCrewDialog;
