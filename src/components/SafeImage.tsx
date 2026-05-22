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
    // eslint-disable-next-line @next/next/no-img-element
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
