import { Link } from "react-router-dom";
import { Info } from "lucide-react";

export default function LocalDataNotice({ showLink = true }) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-muted/60 p-4 text-sm">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <p className="text-muted-foreground">
        <span className="font-medium text-foreground">Data gemmes kun på denne enhed.</span> Rapporterne synkroniseres
        ikke automatisk mellem telefon og computer eller mellem brugere. Del en PDF eller en backupfil (fx via OneDrive),
        hvis andre skal se eller importere en rapport.
        {showLink && (
          <>
            {" "}
            <Link to="/reports/admin" className="font-medium text-foreground underline underline-offset-2">
              Backup og import
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
