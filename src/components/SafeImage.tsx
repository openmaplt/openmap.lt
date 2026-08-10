"use client";

import type React from "react";
import { useState } from "react";

interface SafeImageProps extends React.ComponentPropsWithoutRef<"img"> {
  fallback?: React.ReactNode;
}

export default function SafeImage({
  src,
  alt,
  className,
  style,
  fallback,
  onError,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (fallback as React.JSX.Element) || null;
  }

  return (
    // biome-ignore lint/performance/noImgElement: generic wrapper for arbitrary/external sources with an onError fallback, not eligible for next/image optimization
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={(e) => {
        setHasError(true);
        if (onError) onError(e);
      }}
      {...props}
    />
  );
}
