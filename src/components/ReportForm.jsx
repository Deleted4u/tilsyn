import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import TypeSwitcher from "@/components/TypeSwitcher";
import HentData from "@/components/HentData";
import CloudFields from "@/components/CloudFields";
import ElChecks from "@/components/ElChecks";
import { friendlyError } from "@/lib/db";
import { TYPES, mergeCloud, mergeEl, typeOf } from "@/lib/reportTypes";

const ALL_TITLES = Object.values(TYPES).map((t) => t.title);

// Billeder sendes som filer (Blob) til onSubmit, som gemmer dem lokalt på enheden.
// Tidsstempel og navnestempel styres af Indstillinger (ikke pr. rapport).
//
// mode "new":  ikonerne øverst skifter rapporttype; oplysningerne bliver stående.
// mode "edit": rapportens type ligger fast; et andet ikon åbner en NY rapport af den type
//              (hvor man kan trykke "Hent data" for at hente Navn, SL-Nr og Adresse).
export default function ReportForm({ onSubmit, mode = "new", initial = null, initialType = "tilsyn", fromId = null }) {
  const navigate = useNavigate();
  const editing = mode === "edit";

  const [type, setType] = useState(() => (initial ? typeOf(initial) : initialType));
  const [title, setTitle] = useState(() => initial?.title || TYPES[initial ? typeOf(initial) : initialType].title);
  const [name, setName] = useState(() => initial?.name || "");
  const [slNr, setSlNr] = useState(() => initial?.sl_nr || "");
  const [address, setAddress] = useState(() => initial?.address || "");
  const [comment, setComment] = useState(() => initial?.comment || "");
  const [date, setDate] = useState(() => initial?.date || new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(() => initial?.time || new Date().toTimeString().slice(0, 5));
  const [images, setImages] = useState(() => initial?.images || []);
  const [cloud, setCloud] = useState(() => mergeCloud(initial?.cloud));
  const [el, setEl] = useState(() => mergeEl(initial?.el));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const label = TYPES[type].title;

  const onTypeClick = (t) => {
    if (t === type) return;
    if (editing) {
      if (!window.confirm("Ændringer, der ikke er gemt, går tabt. Åbn en ny rapport af den valgte type?")) return;
      navigate(`/reports/new?type=${t}&from=${initial.id}`);
      return;
    }
    setType(t);
    // Standardtitlen følger med typen, men en selvvalgt titel bliver stående.
    setTitle((cur) => (!cur.trim() || ALL_TITLES.includes(cur.trim()) ? TYPES[t].title : cur));
  };

  // Billeder pr. kontrolpunkt (TilsynEL). Billeder uden "section" er de almindelige billeder.
  const imagesFor = (section) => images.filter((i) => (i.section || "") === section);
  const setImagesFor = (section) => (updater) =>
    setImages((prev) => {
      const mine = prev.filter((i) => (i.section || "") === section);
      const others = prev.filter((i) => (i.section || "") !== section);
      const next = typeof updater === "function" ? updater(mine) : updater;
      return [...others, ...next.map((i) => ({ ...i, section }))];
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date || !address.trim()) return;
    setSaving(true);
    setError("");
    try {
      const base = {
        type,
        title: title.trim(),
        name: name.trim(),
        date,
        time,
        sl_nr: slNr.trim(),
        address: address.trim(),
        comment: type === "cloud" ? "" : comment.trim(),
      };
      const fields = { ...base };
      if (type === "cloud") {
        fields.cloud = {
          connection: cloud.connection.trim(),
          placement: cloud.placement.trim(),
          maxAmp: String(cloud.maxAmp).trim(),
          maxUse: String(cloud.maxUse).trim(),
          chargerIds: cloud.chargerIds.map((s) => s.trim()).filter(Boolean),
        };
      }
      if (type === "el") fields.el = el;

      const toSave = type === "cloud" ? [] : images;
      await onSubmit(
        fields,
        toSave.map((img) => ({
          id: img.id,
          blob: img.blob,
          comment: img.comment || "",
          timestamp: img.timestamp || "",
          section: type === "el" ? img.section || "" : "",
          persisted: !!img.persisted,
        }))
      );
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  };

  const generalImages = type === "el" ? imagesFor("") : images;
  const setGeneralImages = type === "el" ? setImagesFor("") : setImages;

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Tilbage
        </Link>
        <TypeSwitcher value={type} onSelect={onTypeClick} />
      </div>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{editing ? `Rediger ${label}` : `Ny ${label}`}</h1>
        <p className="mt-1 text-muted-foreground">
          {type === "cloud"
            ? "Udfyld oplysningerne og gem. Excel-filen laves på rapportens side."
            : "Udfyld oplysninger, tilføj billeder og gem rapporten."}
        </p>
      </div>

      {!editing && (
        <HentData
          fromId={fromId}
          onPick={(d) => {
            setName(d.name);
            setSlNr(d.sl_nr);
            setAddress(d.address);
          }}
        />
      )}

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">{type === "cloud" ? "Rapport type" : "Tilsyns type"}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={label}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Navn</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Navn på lokation"
            />
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
              placeholder="Kaosvej 404, 8888 Drømmeby"
              required
            />
          </div>

          {type !== "cloud" && (
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
          )}

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
            <div className="min-w-0 space-y-2">
              <Label htmlFor="date">Dato</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="block w-full min-w-0 max-w-full appearance-none text-center"
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="time">Tidspunkt</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="block w-full min-w-0 max-w-full appearance-none text-center"
              />
            </div>
          </div>
        </div>
      </div>

      {type === "cloud" && <CloudFields cloud={cloud} setCloud={setCloud} />}

      {type === "el" && (
        <ElChecks
          el={el}
          setEl={setEl}
          imagesFor={imagesFor}
          setImagesFor={setImagesFor}
          reportName={name.trim()}
        />
      )}

      {type !== "cloud" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Billeder</h2>
            <p className="text-sm text-muted-foreground">Tilføj billeder og skriv en kommentar til hvert billede.</p>
          </div>
          <ImageUploader images={generalImages} setImages={setGeneralImages} reportName={name.trim()} />
        </div>
      )}

      {error && <p className="rounded-xl border border-destructive/40 p-4 text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-3 border-t border-border pt-6">
        <Button asChild variant="outline" type="button">
          <Link to="/">Annuller</Link>
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? "Gemmer…" : editing ? "Gem ændringer" : "Gem rapport"}
        </Button>
      </div>
    </form>
  );
}
