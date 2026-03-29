import { useEffect, useRef } from "react";

export default function AudioPlayer({ src, label, volume = 1.0, autoPlay = true }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (src && audioRef.current && autoPlay) {
      audioRef.current.volume = volume;
      audioRef.current.play().catch(() => {});
    }
  }, [src, volume, autoPlay]);

  if (!src) return null;

  return (
    <div className="animate-fade-in-up">
      <p className="text-xs text-white/40 mb-2">{label}</p>
      <audio ref={audioRef} src={src} controls className="w-full h-10 opacity-80" />
    </div>
  );
}
