import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuickComments } from "@/lib/hooks";
import { addQuickComment, friendlyError, removeQuickComment } from "@/lib/db";

// Administration af hurtige kommentarer (gemmes lokalt på enheden).
export default function QuickComments() {
  const { items, reload } = useQuickComments();
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const add = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await addQuickComment(text);
      setText("");
      await reload();
    } catch (err) {
      setError(friendlyError(err));
    }
  };

  const remove = async (id) => {
    setError("");
    try {
      await removeQuickComment(id);
      await reload();
    } catch (err) {
      setError(friendlyError(err));
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="F.eks. Ingen bemærkninger" />
        <Button type="submit" disabled={!text.trim()}>
          <Plus className="mr-2 h-4 w-4" /> Tilføj
        </Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ingen hurtige kommentarer endnu.</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {items.map((q) => (
            <li key={q.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span>{q.text}</span>
              <Button variant="ghost" size="icon" onClick={() => remove(q.id)} aria-label="Slet kommentar">
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
