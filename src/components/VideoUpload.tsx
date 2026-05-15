import { useRef, useState } from "react";
import { Video, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/integrations/api/client";

interface VideoUploadProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

const VideoUpload = ({ urls, onChange, max = 5 }: VideoUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (urls.length + files.length > max) {
      toast.error(`You can upload a maximum of ${max} videos.`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append("videos", f));

      const result = await api.upload<{ urls: string[] }>("/api/upload/video", formData);
      onChange([...urls, ...result.urls]);
    } catch (err: any) {
      toast.error("Video upload failed: " + err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (idx: number) => onChange(urls.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium leading-none">Portfolio Videos</p>
      <p className="text-xs text-muted-foreground">mp4, mov, webm — max 200 MB each</p>

      {urls.length > 0 && (
        <div className="space-y-2">
          {urls.map((url, i) => (
            <div key={i} className="relative overflow-hidden rounded-lg border border-border bg-card">
              <video
                src={url}
                controls
                className="w-full max-h-48 object-contain bg-black"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {urls.length < max && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/50 py-6 text-sm text-muted-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Uploading video…</>
          ) : (
            <><Video className="h-4 w-4" /> Click to upload videos</>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/avi,video/x-matroska"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
};

export default VideoUpload;
