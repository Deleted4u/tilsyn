import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import { friendlyError } from "@/lib/db";

// Samme formular og udseende som i Base44-versionen.
// Forskel: billeder uploades ikke længere – de sendes som filer (Blob) til onSubmit,
// som gemmer dem lokalt på enheden.
export default function ReportForm({
  onSubmit,
  submitLabel = "Gem rapport",
  heading = "Ny tilsynsrapport",
  initial = null,
}) {
  const [title, setTitle] = useState(() => initial?.title || "");
  const [date, setDate] = useState(() => initial?.date || new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(() => initial?.time || new Date().toTimeString().slice(0, 5));
  const [slNr, setSlNr] = useState(() => initial?.sl_nr || "");
  const [address, setAddress] = useState(() => initial?.address || "");
  const [comment, setComment] = useState(() => initial?.comment || "");
  const [timestampEnabled, setTimestampEnabled] = useState(() => !!initial?.timestamp_enabled);
  const [images, setImages] = useState(() => initial?.images || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date || !address.trim()) return;
    setSaving(true);
    setError("");
    try {
      await onSubmit(
        {
          title: title.trim(),
          date,
          time,
          sl_nr: slNr.trim(),
          address: address.trim(),
          comment: comment.trim(),
          timestamp_enabled: timestampEnabled,
        },
        images.map((img) => ({
          id: img.id,
          blob: img.blob,
          comment: img.comment || "",
          timestamp: img.timestamp || "",
          persisted: !!img.persisted,
        }))
      );
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Tilbage
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
        <p className="mt-1 text-muted-foreground">Udfyld oplysninger, tilføj billeder og gem rapporten.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="F.eks. Tilsyn af tagkonstruktion"
              required
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Dato</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Tidspunkt</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sl_nr">SL-Nr</Label>
            <Input
              id="sl_nr"
              value={slNr}
              onChange={(e) => setSlNr(e.target.value)}
              placeholder="F.eks. SL-12345"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="F.eks. Hovedgaden 12, 8000 Aarhus"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Kommentar</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Samlet bemærkninger til tilsynet…"
              className="min-h-[100px]"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Billeder</h2>
            <p className="text-sm text-muted-foreground">Tilføj billeder og skriv en kommentar til hvert billede.</p>
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <Switch checked={timestampEnabled} onCheckedChange={setTimestampEnabled} />
            <span className="text-sm font-medium">Tidsstempel alle billeder</span>
          </label>
        </div>
        <ImageUploader images={images} setImages={setImages} timestampEnabled={timestampEnabled} />
      </div>

      {error && <p className="rounded-xl border border-destructive/40 p-4 text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-3 border-t border-border pt-6">
        <Button asChild variant="outline" type="button">
          <Link to="/">Annuller</Link>
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? "Gemmer…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
