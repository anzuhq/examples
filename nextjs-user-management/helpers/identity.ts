import { useEffect, useState } from "react";

/**
 * Fetch current identity from API
 * @param token
 * @returns
 */
export function useLoadIdentity(token: string | null) {
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    (async () => {
      const resp = await fetch(`/api/current_identity`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!resp.ok) {
        return;
      }
      const { email } = await resp.json();
      setEmail(email);
    })();
  }, [token]);

  return { email };
}
