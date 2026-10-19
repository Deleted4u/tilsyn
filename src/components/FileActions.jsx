import { useState } from "react";
import { Download, FileText, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canShareFile, downloadBlob, shareBlob } from "@/lib/share";
import { friendlyError } from "@/lib/db";

// To trin: 1) lav filen, 2) del eller download.
// Delemenuen på iPhone kræver et direkte tryk, så vi laver filen først
// og lader brugeren trykke "Del" bagefter.
export default function FileActions({ label, icon: Icon = FileText, build, variant = "default" }) {
  const [state, setState] = useState({ status: "idle" });
  const [note, setNote] = useState("");

  const make = async () => {
    setState({ status: "busy" });
    setNote("");
    try {
      const file = await build();
      setState({ status: "ready", file });
    } catch (e) {
      setState({ status: "error", message: friendlyError(e) });
    }
  };

  if (state.status === "ready") {
    const { blob, filename } = state.file;
    const file = new File([blob], filename, { type: blob.type });
    const shareOk = canShareFile(file);
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Klar: <span className="font-medium text-foreground">{filename}</span> ({(blob.size / 1024 / 1024).toFixed(1)} MB)
        </p>
        <div className="flex flex-wrap gap-2">
          {shareOk && (
            <Button
              onClick={async () => {
                const r = await shareBlob(file);
                if (r === "failed") setNote("Deling mislykkedes. Brug Download i stedet.");
              }}
            >
              <Share2 className="mr-2 h-4 w-4" /> Del
            </Button>
          )}
          <Button variant="outline" onClick={() => downloadBlob(blob, filename)}>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
          <Button variant="ghost" onClick={make}>
            Lav igen
          </Button>
        </div>
        {note && <p className="text-sm text-destructive">{note}</p>}
        <p className="text-xs text-muted-foreground">
          Vælg OneDrive i delemenuen, eller gem filen og læg den i den delte OneDrive-mappe.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button variant={variant} onClick={make} disabled={state.status === "busy"}>
        {state.status === "busy" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icon className="mr-2 h-4 w-4" />
        )}
        {state.status === "busy" ? "Arbejder…" : label}
      </Button>
      {state.status === "error" && <p className="text-sm text-destructive">{state.message}</p>}
    </div>
  );
}
