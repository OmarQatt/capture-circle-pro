import { useState } from "react";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { resolveImageUrl } from "@/integrations/api/client";

interface Props {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

const ImageLightbox = ({ images, initialIndex = 0, onClose }: Props) => {
  const resolved = images.map(resolveImageUrl);
  const [current, setCurrent] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomed(false);
    setCurrent(i => (i - 1 + resolved.length) % resolved.length);
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomed(false);
    setCurrent(i => (i + 1) % resolved.length);
  };

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomed(z => !z);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-1.5 hover:bg-white/20 transition-colors z-10"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </button>
      <button
        className="absolute top-4 right-14 text-white bg-black/50 rounded-full p-1.5 hover:bg-white/20 transition-colors z-10"
        onClick={toggleZoom}
      >
        {zoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
      </button>

      {resolved.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-white/20 transition-colors z-10"
            onClick={prev}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-white/20 transition-colors z-10"
            onClick={next}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <img
        src={resolved[current]}
        alt=""
        className={`max-h-[90vh] max-w-[90vw] object-contain transition-transform duration-200 select-none ${
          zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
        }`}
        onClick={toggleZoom}
      />

      {resolved.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm select-none">
          {current + 1} / {resolved.length}
        </div>
      )}
    </div>
  );
};

export default ImageLightbox;
