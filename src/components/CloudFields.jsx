import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_CHARGER_IDS } from "@/lib/cloudMap";

// Felterne til Cloud Konfig (Excel-filen). Navn, SL-Nr og Adresse ligger i det øverste kort.
export default function CloudFields({ cloud, setCloud }) {
  const set = (patch) => setCloud((p) => ({ ...p, ...patch }));
  const setId = (i, v) => setCloud((p) => ({ ...p, chargerIds: p.chargerIds.map((x, k) => (k === i ? v : x)) }));
  const addId = () => setCloud((p) => ({ ...p, chargerIds: [...p.chargerIds, ""] }));
  const removeId = (i) =>
    setCloud((p) => {
      const next = p.chargerIds.filter((_, k) => k !== i);
      return { ...p, chargerIds: next.length ? next : [""] };
    });

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="space-y-6">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
          <div className="min-w-0 space-y-2">
            <Label htmlFor="c-amp">Max tilgængelig Amp</Label>
            <Input
              id="c-amp"
              inputMode="numeric"
              value={cloud.maxAmp}
              onChange={(e) => set({ maxAmp: e.target.value })}
              placeholder="F.eks. 63"
            />
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor="c-use">Max forbrug (sikringsstørrelse)</Label>
            <Input
              id="c-use"
              inputMode="numeric"
              value={cloud.maxUse}
              onChange={(e) => set({ maxUse: e.target.value })}
              placeholder="F.eks. 50"
            />
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
          <div className="min-w-0 space-y-2">
            <Label htmlFor="c-conn">Tilslutningspunkt</Label>
            <Input id="c-conn" value={cloud.connection} onChange={(e) => set({ connection: e.target.value })} />
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor="c-place">Placering</Label>
            <Input id="c-place" value={cloud.placement} onChange={(e) => set({ placement: e.target.value })} />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Ladeboks iD</Label>
          {cloud.chargerIds.map((id, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={id}
                onChange={(e) => setId(i, e.target.value)}
                aria-label={`Ladeboks iD ${i + 1}`}
                placeholder={`iD ${i + 1}`}
              />
              {cloud.chargerIds.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeId(i)} aria-label="Fjern iD">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {cloud.chargerIds.length < MAX_CHARGER_IDS && (
            <Button type="button" variant="outline" onClick={addId}>
              <Plus className="mr-2 h-4 w-4" /> Tilføj iD
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
