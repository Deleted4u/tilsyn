import { useState } from "react";
import { Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUploader from "@/components/ImageUploader";
import InfoText from "@/components/InfoText";
import { EL_INFO_LABEL, EL_ITEMS } from "@/lib/reportTypes";

function OkSwitch({ id, checked, onChange }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="text-sm text-muted-foreground">OK</span>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// Kontrolpunkterne øverst i TilsynEL: skydeknap (OK), tekst og billeder for hvert punkt.
// INFO er særlig: et (i) der viser teksten, og en OK-knap man kvitterer med.
export default function ElChecks({ el, setEl, imagesFor, setImagesFor, reportName }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const setItem = (key, patch) =>
    setEl((p) => ({ ...p, items: { ...p.items, [key]: { ...p.items[key], ...patch } } }));

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h2 className="mb-6 text-xl font-semibold tracking-tight">Kontrolpunkter</h2>
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <span className="font-medium">{EL_INFO_LABEL}</span>
              <button
                type="button"
                onClick={() => setInfoOpen((o) => !o)}
                aria-label="Vis info om tilsyn"
                aria-expanded={infoOpen}
                className={
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors " +
                  (infoOpen
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-accent")
                }
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
            <OkSwitch id="el-info" checked={el.infoOk} onChange={(v) => setEl((p) => ({ ...p, infoOk: v }))} />
          </div>
          {infoOpen && (
            <div className="rounded-xl border border-border bg-muted/50 p-4">
              <InfoText />
            </div>
          )}
        </div>

        {EL_ITEMS.map((it) => (
          <div key={it.key} className="space-y-3 border-t border-border pt-6">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor={`el-${it.key}`} className="min-w-0 flex-1 text-base">
                {it.label}
              </Label>
              <OkSwitch
                id={`el-${it.key}`}
                checked={el.items[it.key].ok}
                onChange={(v) => setItem(it.key, { ok: v })}
              />
            </div>
            <Textarea
              value={el.items[it.key].text}
              onChange={(e) => setItem(it.key, { text: e.target.value })}
              placeholder="Tekst…"
              className="min-h-[70px]"
            />
            <ImageUploader compact images={imagesFor(it.key)} setImages={setImagesFor(it.key)} reportName={reportName} />
          </div>
        ))}
      </div>
    </div>
  );
}
