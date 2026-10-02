import React from 'react';
import { Camera } from 'lucide-react';

interface FallbackGoatImageProps {
  className?: string;
  breedName?: string;
  goatCode?: string;
}

export const FallbackGoatImage: React.FC<FallbackGoatImageProps> = ({
  className = 'h-full w-full',
  breedName,
  goatCode,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 select-none ${className}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200/80 text-slate-500 mb-2">
        <Camera className="h-6 w-6" />
      </div>
      <span className="text-xs font-bold text-slate-600">Photo Pending</span>
      {breedName && <span className="text-[11px] text-slate-500 mt-0.5">{breedName}</span>}
      {goatCode && <span className="font-mono text-[10px] text-slate-400 mt-0.5">#{goatCode}</span>}
    </div>
  );
};

export const DEFAULT_GOAT_IMAGE_FALLBACK =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="%23f1f5f9"><rect width="400" height="300" fill="%23f1f5f9"/><g transform="translate(176, 126)" fill="%2394a3b8"><path d="M12 2a2 2 0 0 0-2 2v2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4V4a2 2 0 0 0-2-2h-8zm0 2h8v2h-8V4zm-2 6a6 6 0 1 1 12 0 6 6 0 0 1-12 0zm6 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></g><text x="50%" y="210" font-family="sans-serif" font-size="12" font-weight="600" fill="%2364748b" text-anchor="middle">Photo Pending</text></svg>';
