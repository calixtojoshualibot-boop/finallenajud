import { useState } from 'react';

interface Props { image: string; size?: number; }

export function NBALogo({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center font-black text-red-500 uppercase tracking-tighter" style={{ fontSize: size * 0.4 }}>
      CAPS
    </div>
  );
}

export function FacebookIcon({ size = 20, className = "" }: { size?: number, className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center overflow-hidden ${className}`} style={{ width: size, height: size }}>
      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg" alt="FB" className="w-full h-full object-contain" />
    </div>
  );
}

export function InstagramIcon({ size = 20, className = "" }: { size?: number, className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center overflow-hidden ${className}`} style={{ width: size, height: size }}>
      <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="IG" className="w-full h-full object-contain" />
    </div>
  );
}

const IMG_MAP: Record<string, string> = {
  bulls: '/caps/bulls.jpg',
  lakers: '/caps/lakers.jpg',
  celtics: '/caps/celtics.jpg',
  warriors: '/caps/warriors.jpg',
  knicks: '/caps/knicks.jpg',
  heat: '/caps/heat.jpg',
  spurs: '/caps/spurs.jpg',
  raptors: '/caps/raptors.jpg',
  suns: '/caps/suns.jpg',
  bucks: '/caps/bucks.jpg',
  magic: '/caps/magic.svg',
  rockets: '/caps/rockets.svg',
};

function FallbackSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#000"/>
      <ellipse cx="100" cy="120" rx="70" ry="20" fill="#111"/>
      <ellipse cx="100" cy="90" rx="55" ry="45" fill="#222"/>
      <circle cx="100" cy="55" r="6" fill="#111"/>
      <text x="100" y="170" textAnchor="middle" fill="#444" fontSize="14" fontWeight="bold">🧢</text>
    </svg>
  );
}

export function getImageSrc(image: string): string | null {
  // If it's a base64 data URL or http URL, use directly
  if (image.startsWith('data:') || image.startsWith('http')) return image;
  // Otherwise look up built-in image
  return IMG_MAP[image] || null;
}

export default function TeamLogo({ image, size = 48 }: Props) {
  const [error, setError] = useState(false);
  const src = getImageSrc(image);

  if (!src || error) {
    return (
      <div
        className="rounded-lg overflow-hidden flex-shrink-0 bg-stone-800"
        style={{ width: size, height: size }}
      >
        <FallbackSVG size={size} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${image} cap`}
      width={size}
      height={size}
      className="rounded-lg object-cover flex-shrink-0"
      style={{ width: size, height: size }}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
