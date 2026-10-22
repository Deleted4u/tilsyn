import { useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import BlobImage from "@/components/BlobImage";
import { compressImage } from "@/lib/image";
import { newId } from "@/lib/utils";
import { stampText } from "@/lib/format";
import { useQuickComments } from "@/lib/hooks";
import { useSettings } from "@/lib/settings";

// images: [{ id, blob, comment, timestamp, persisted? }]
// Stempler (tid og navn) styres af Indstillinger.
export default function ImageUploader({ images, setImages, reportName = "" }) {
  const pickRef = useRef(null);
  const cameraRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { items: quickComments } = useQuickComments();
  const settings = useSettings();

  const addFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setBusy(true);
    setError("");
    const added = [];
    const problems = [];
    for (const f of files) {
      try {
        const blob = await compressImage(f);
        // Tidsstemplet sættes, når billedet tilføjes.
        added.push({ id: newId(), blob, comment: "", timestamp: new Date().toISOString() });
      } catch (e) {
        problems.push(`${f.name || "Billede"}: ${e.message}`);
      }
    }
    if (added.length) setImages((prev) => [...prev, ...added]);
    if (problems.length) setError(problems.join(" "));
    setBusy(false);
  };

  const onPick = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const setComment = (id, comment) =>
    setImages((prev) => prev.map((i) => (i.id === id ? { ...i, comment } : i)));

  const remove = (id) => setImages((prev) => prev.filter((i) => i.id !== id));

  const addQuick = (id, text) =>
    setImages((prev) =>
      prev.map((i) => (i.id === id ? { ...i, comment: i.comment ? `${i.comment.trim()} ${text}` : text } : i))
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => pickRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
          Vælg billeder
        </Button>
        <Button type="button" variant="outline" onClick={() => cameraRef.current?.click()} disabled={busy}>
          <Camera className="mr-2 h-4 w-4" /> Tag billede
        </Button>
        <input ref={pickRef} type="file" accept="image/*" multiple className="hidden" onChange={onPick} />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onPick}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {images.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          Ingen billeder endnu
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {images.map((img) => {
            const stamp = stampText({ name: reportName, timestamp: img.timestamp }, settings);
            return (
              <div key={img.id} className="space-y-3 rounded-2xl border border-border bg-card p-3">
                <div className="relative overflow-hidden rounded-xl bg-muted">
                  <BlobImage blob={img.blob} className="aspect-[4/3] w-full object-cover" />
                  {stamp && (
                    <span className="absolute bottom-2 left-2 max-w-[80%] truncate rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                      {stamp}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(img.id)}
                    aria-label="Fjern billede"
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Textarea
                  value={img.comment}
                  onChange={(e) => setComment(img.id, e.target.value)}
                  placeholder="Kommentar til billedet…"
                  className="min-h-[70px]"
                />
                {quickComments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {quickComments.map((q) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => addQuick(img.id, q.text)}
                        className="rounded-full border border-border bg-secondary px-3 py-1 text-xs hover:bg-accent"
                      >
                        {q.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
