import { useCallback, useEffect, useState } from "react";
import { listQuickComments } from "./db";

export function useQuickComments() {
  const [items, setItems] = useState([]);
  const reload = useCallback(async () => {
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
