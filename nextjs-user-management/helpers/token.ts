import { useRouter } from "next/router";
import { useEffect, useState } from "react";

/**
 * Store token in local storage
 *
 * When token is set in query params, persist it
 *
 * @returns
 */
export function useStoreToken() {
  const [token, setToken] = useLocalStorage<string | null>(
    "anzu-example-token",
    null
  );

  const router = useRouter();

  useEffect(() => {
    const { token } = router.query;
    if (typeof token === "string") {
      setToken(token);
      router.replace("/");
    }
  }, [router.query, setToken, router]);

  return { token, setToken };
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}
