import { Link, Outlet } from "react-router-dom";
import { ClipboardList, DatabaseBackup } from "lucide-react";
import SettingsIcon from "@/components/SettingsIcon";

const linkClass =
  "inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 font-semibold tracking-tight">
            <ClipboardList className="h-5 w-5" /> Tilsyn Plus
          </Link>
          <nav className="flex items-center gap-5">
            <Link to="/reports/admin" className={linkClass}>
              <DatabaseBackup className="h-4 w-4" /> Backup
            </Link>
            <Link to="/settings" className={linkClass}>
              <SettingsIcon className="h-4 w-4" /> Indstillinger
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
