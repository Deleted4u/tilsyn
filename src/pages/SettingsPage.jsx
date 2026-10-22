import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
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
        <p className="mt-1 text-muted-foreground">Udseende, billedstempler og hurtige kommentarer.</p>
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
