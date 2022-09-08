import { PropsWithChildren, useEffect, useState } from "react";

export function BrowserOnly({ children }: PropsWithChildren<{}>) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <>{children}</>;
}
