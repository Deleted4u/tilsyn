import { useCallback, useEffect, useState } from "react";
import { listQuickComments } from "./db";
import { ensureDefaultQuickComments } from "./defaults";

export function useQuickComments() {
  const [items, setItems] = useState([]);
  const reload = useCallback(async () => {
    try {
      await ensureDefaultQuickComments();
    } catch {
      /* ikke kritisk */
    }
    try {
      setItems(await listQuickComments());
    } catch {
      setItems([]);
    }
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);
  return { items, reload };
}
