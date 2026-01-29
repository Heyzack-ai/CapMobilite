"use client";

import { useEffect, useState } from "react";

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function enableMocking() {
      if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
        const { worker } = await import("./browser");
        await worker.start({
          onUnhandledRequest: "bypass",
          quiet: true,
        });
      }
      setIsReady(true);
    }

    enableMocking();
  }, []);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
