import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TYPES, TYPE_KEYS } from "@/lib/reportTypes";
import QuickComments from "@/components/QuickComments";
import { updateSettings, useSettings } from "@/lib/settings";

function SettingRow({ id, title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

const TAPS_NEEDED = 7; // tryk i træk på overskriften låser Hacker mode op
const TAP_GAP_MS = 1500; // max pause mellem tryk
const LONG_PRESS_MS = 900; // langt tryk låser den skjult igen

export default function SettingsPage() {
  const settings = useSettings();
  const [toast, setToast] = useState("");
  const taps = useRef({ count: 0, last: 0 });
  const press = useRef({ timer: null, long: false });
  const toastTimer = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2500);
  };

  const onTitleDown = () => {
    press.current.long = false;
    clearTimeout(press.current.timer);
    press.current.timer = setTimeout(() => {
      press.current.long = true;
      if (settings.hackerUnlocked) {
        updateSettings({ hacker: false, hackerUnlocked: false });
        showToast("Hacker mode er skjult igen");
      }
    }, LONG_PRESS_MS);
  };

  const onTitleUp = () => {
    clearTimeout(press.current.timer);
    if (press.current.long) return; // et langt tryk tæller ikke som et tryk
    if (settings.hackerUnlocked) return;
    const now = Date.now();
    const t = taps.current;
    t.count = now - t.last > TAP_GAP_MS ? 1 : t.count + 1;
    t.last = now;
    if (t.count >= TAPS_NEEDED) {
      t.count = 0;
      updateSettings({ hackerUnlocked: true });
      showToast("Hacker mode låst op 😎");
    }
  };

  const cancelPress = () => clearTimeout(press.current.timer);

  useEffect(
    () => () => {
      clearTimeout(press.current.timer);
      clearTimeout(toastTimer.current);
    },
    []
  );

  useEffect(() => {
    document.title = "Indstillinger";
  }, []);

  return (
    <div className="space-y-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Tilbage
      </Link>

      <div>
        <h1
          className="select-none text-3xl font-semibold tracking-tight [-webkit-touch-callout:none] [touch-action:manipulation]"
          onPointerDown={onTitleDown}
          onPointerUp={onTitleUp}
          onPointerLeave={cancelPress}
          onPointerCancel={cancelPress}
          onContextMenu={(e) => e.preventDefault()}
        >
          Indstillinger
        </h1>
        <p className="mt-1 text-muted-foreground">Udseende, billedstempler, profil og hurtige kommentarer.</p>
      </div>

      <section className="rounded-2xl border border-border bg-card px-6">
        <div className="divide-y divide-border">
          <SettingRow
            id="dark"
            title="Dark mode"
            description="Mørkt udseende i appen."
            checked={settings.darkMode}
            onChange={(v) => updateSettings({ darkMode: v })}
          />
          {settings.hackerUnlocked && (
            <SettingRow
              id="hacker"
              title="Hacker mode 😎"
              description="Sort skærm, grøn tekst og terminal-skrift. Til dem der vil føle sig som i en film."
              checked={settings.hacker}
              onChange={(v) => updateSettings({ hacker: v })}
            />
          )}
          <SettingRow
            id="timestamp"
            title="Tidsstempel på billeder"
            description="Viser dato og tid på billederne (i appen og i PDF'en)."
            checked={settings.timestamp}
            onChange={(v) => updateSettings({ timestamp: v })}
          />
          <SettingRow
            id="namestamp"
            title="Navnestempel på billeder"
            description="Viser rapportens Navn på billederne (i appen og i PDF'en)."
            checked={settings.nameStamp}
            onChange={(v) => updateSettings({ nameStamp: v })}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Standardrapport</h2>
          <p className="text-sm text-muted-foreground">Den rapporttype, der åbner, når du trykker “Ny rapport”.</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {TYPE_KEYS.map((k) => {
            const { Icon, title } = TYPES[k];
            const active = settings.defaultType === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => updateSettings({ defaultType: k })}
                aria-pressed={active}
                className={
                  "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-sm transition-colors " +
                  (active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-accent")
                }
              >
                <Icon className="h-5 w-5" />
                <span className="text-center leading-tight">{title}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Profil</h2>
          <p className="text-sm text-muted-foreground">
            Bruges i Cloud Konfig-filen. Gemmes kun på denne enhed og kommer ikke med i backup.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-firm">Firma</Label>
          <Input id="p-firm" value={settings.profileFirm} onChange={(e) => updateSettings({ profileFirm: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-customer">Kunde</Label>
          <Input
            id="p-customer"
            value={settings.profileCustomer}
            onChange={(e) => updateSettings({ profileCustomer: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4">
          <div className="space-y-2">
            <Label htmlFor="p-initials">Dine initialer</Label>
            <Input
              id="p-initials"
              value={settings.profileInitials}
              onChange={(e) => updateSettings({ profileInitials: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-name">Dit navn</Label>
            <Input id="p-name" value={settings.profileName} onChange={(e) => updateSettings({ profileName: e.target.value })} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold tracking-tight">Hurtige kommentarer</h2>
        <p className="text-sm text-muted-foreground">
          Korte standardtekster, som du kan trykke ind i et billedes kommentar.
        </p>
        <QuickComments />
      </section>
      {toast && (
        <div
          role="status"
          className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-sm rounded-xl border border-border bg-card px-4 py-3 text-center text-sm shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
