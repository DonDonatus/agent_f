'use client';

import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  fallback?: React.ReactNode;
  className?: string;
}

export function SafeImage({
  src,
  alt,
  fallback = <Building2 className="w-5 h-5" />,
  className,
}: SafeImageProps) {
  const [error, setError] = useState(false);

  const isValidSrc = src && (src.startsWith('/') || src.startsWith('http'));

  if (error || !isValidSrc) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
