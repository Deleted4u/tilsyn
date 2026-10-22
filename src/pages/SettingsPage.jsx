import { useEffect } from "react";
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

export default function SettingsPage() {
  const settings = useSettings();

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
        <h1 className="text-3xl font-semibold tracking-tight">Indstillinger</h1>
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
    </div>
  );
}
