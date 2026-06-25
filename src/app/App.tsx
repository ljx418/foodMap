import { useCallback, useEffect, useState } from "react";
import { ToastStack, type ToastMessage } from "../components/Toast";
import { ShareView } from "../features/share/ShareView";
import { MapWorkspace } from "../features/workspace/MapWorkspace";
import { useHashRoute } from "./router";

export function App() {
  const route = useHashRoute();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    setToasts([]);
  }, [route]);

  const notify = useCallback((text: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((items) => [...items, { id, text }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 2800);
  }, []);

  return (
    <>
      {route.name === "share" ? <ShareView snapshotId={route.snapshotId} notify={notify} /> : <MapWorkspace notify={notify} />}
      <ToastStack messages={toasts} />
    </>
  );
}
