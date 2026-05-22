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
import VideoUpload from "@/components/VideoUpload";

interface Props {
  talent: any;
  onClose: () => void;
}

const EditTalentDialog = ({ talent, onClose }: Props) => {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    bio: talent.bio || "",
    age: talent.age ? String(talent.age) : "",
    skin_tone: talent.skin_tone || "medium",
    height: talent.height ? String(talent.height) : "",
    weight: talent.weight ? String(talent.weight) : "",
    experience_years: talent.experience_years ? String(talent.experience_years) : "",
    hourly_rate: talent.hourly_rate ? String(talent.hourly_rate) : "",
    daily_rate: talent.daily_rate ? String(talent.daily_rate) : "",
  });
  const [portfolio, setPortfolio] = useState<string[]>(talent.portfolio_urls || []);
  const [videos, setVideos] = useState<string[]>(talent.portfolio_videos || []);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    setLoading(true);
    try {
      await api.patch(`/api/talent/${talent.id}`, {
        bio: form.bio.trim() || null,
        age: form.age ? Number(form.age) : null,
        skin_tone: form.skin_tone,
        height: form.height || null,
        weight: form.weight || null,
        experience_years: form.experience_years ? Number(form.experience_years) : 0,
        hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : null,
        daily_rate: form.daily_rate ? Number(form.daily_rate) : null,
        portfolio_urls: portfolio,
        portfolio_videos: videos,
      });
      toast.success("Profile updated — pending admin re-approval.");
      qc.invalidateQueries({ queryKey: ["my-talent"] });
      qc.invalidateQueries({ queryKey: ["talent_profiles"] });
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
        <DialogHeader><DialogTitle>Edit Talent Profile</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div><Label>Bio</Label><Textarea value={form.bio} onChange={e => set("bio", e.target.value)} rows={3} /></div>
          <div><Label>Age</Label><Input type="number" value={form.age} onChange={e => set("age", e.target.value)} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Skin Tone</Label>
              <Select value={form.skin_tone} onValueChange={v => set("skin_tone", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="olive">Olive</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Height (cm)</Label><Input type="number" value={form.height} onChange={e => set("height", e.target.value)} /></div>
            <div><Label>Weight (kg)</Label><Input type="number" value={form.weight} onChange={e => set("weight", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Years Exp.</Label><Input type="number" value={form.experience_years} onChange={e => set("experience_years", e.target.value)} /></div>
            <div><Label>Hourly ($)</Label><Input type="number" value={form.hourly_rate} onChange={e => set("hourly_rate", e.target.value)} /></div>
            <div><Label>Daily ($)</Label><Input type="number" value={form.daily_rate} onChange={e => set("daily_rate", e.target.value)} /></div>
          </div>
          <ImageUpload urls={portfolio} onChange={setPortfolio} max={10} label="Portfolio Photos" />
          <VideoUpload urls={videos} onChange={setVideos} max={5} />
          <p className="text-xs text-amber-500">Saving will reset this profile to pending admin re-approval.</p>
          <Button onClick={submit} disabled={loading} className="w-full bg-gradient-gold text-primary-foreground font-semibold">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTalentDialog;
