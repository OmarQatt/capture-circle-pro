import { useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/integrations/api/client";

interface ImageUploadProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  label?: string;
}

const ImageUpload = ({ urls, onChange, max = 10, label = "Photos" }: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (urls.length + files.length > max) {
      toast.error(`You can upload a maximum of ${max} photos.`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append("images", f));

      const result = await api.upload<{ urls: string[] }>("/api/upload", formData);
      onChange([...urls, ...result.urls]);
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (idx: number) => onChange(urls.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium leading-none">{label}</p>

      {/* Previews */}
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {urls.map((url, i) => (
            <div key={i} className="relative h-20 w-20 overflow-hidden rounded-md border border-border">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {urls.length < max && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/50 py-6 text-sm text-muted-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
          ) : (
            <><ImagePlus className="h-4 w-4" /> Click to upload photos</>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
};

export default ImageUpload;
