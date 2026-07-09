import { useState } from "react";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80";

export default function ImageWithFallback({ src, alt, className, ...props }) {
  const [image, setImage] = useState(src || DEFAULT_IMAGE);

  return (
    <img
      src={image}
      alt={alt}
      className={className}
      onError={() => setImage(DEFAULT_IMAGE)}
      {...props}
    />
  );
}
