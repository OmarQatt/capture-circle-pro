import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { resolveImageUrl } from "@/integrations/api/client";

const FALLBACK = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=75";

interface Props {
  images: string[];
  alt?: string;
  className?: string;
  onImageClick?: (index: number) => void;
}

const ImageCarousel = ({ images, alt = "", className = "", onImageClick }: Props) => {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) return null;

  const resolved = images.map(resolveImageUrl);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = FALLBACK;
  };

  if (resolved.length === 1) return (
    <img
      src={resolved[0]}
      alt={alt}
      onError={handleError}
      className={`${className} ${onImageClick ? "cursor-zoom-in" : ""}`}
      onClick={() => onImageClick?.(0)}
    />
  );

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent(i => (i - 1 + resolved.length) % resolved.length);
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent(i => (i + 1) % resolved.length);
  };

  return (
    /* absolute inset-0 fills the parent container reliably without relying on h-full chains */
    <div className="absolute inset-0 group">
      <img
        src={resolved[current]}
        alt={alt}
        onError={handleError}
        className={`${className} ${onImageClick ? "cursor-zoom-in" : ""}`}
        onClick={() => onImageClick?.(current)}
      />
      <button
        onClick={prev}
        className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
        {resolved.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }}
            className={`h-1.5 rounded-full transition-all ${i === current ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
