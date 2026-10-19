import { useEffect, useState } from "react";

// Viser et billede fra en Blob. Den midlertidige URL bruges KUN til visning
// og ryddes op igen – den gemmes aldrig.
export default function BlobImage({ blob, alt = "", className }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!blob) return undefined;
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  if (!url) return <div className={className} />;
  return <img src={url} alt={alt} className={className} />;
}
