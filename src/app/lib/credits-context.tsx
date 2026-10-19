import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { listCredits, ApiCreditsPricing } from "./api";

interface CreditsContextValue {
  balance: number | null;
  pricing: ApiCreditsPricing | null;
  isLoading: boolean;
  /** Re-fetches the balance — call after anything that spends or grants credits. */
  refresh: () => Promise<void>;
}

const CreditsContext = createContext<CreditsContextValue | null>(null);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [pricing, setPricing] = useState<ApiCreditsPricing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      // limit: 1 — only the balance/pricing matter here, not the transaction list.
      const page = await listCredits({ limit: 1 });
      setBalance(page.balance);
      setPricing(page.pricing);
    } catch {
      // Leave the last known balance in place rather than blanking it on a transient error.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <CreditsContext.Provider value={{ balance, pricing, isLoading, refresh }}>{children}</CreditsContext.Provider>
  );
}

export function useCredits() {
  const ctx = useContext(CreditsContext);
  if (!ctx) throw new Error("useCredits must be used within a CreditsProvider");
  return ctx;
}
