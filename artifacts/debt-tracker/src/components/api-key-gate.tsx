import * as React from "react";

export const STORAGE_KEY = "debt-tracker-key";

export function ApiKeyGate({ children }: { children: React.ReactNode }) {
  const [key, setKey] = React.useState<string | null>(() =>
    sessionStorage.getItem(STORAGE_KEY),
  );
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    function onUnauthorized() {
      sessionStorage.removeItem(STORAGE_KEY);
      setKey(null);
      setError(true);
    }
    window.addEventListener("api-unauthorized", onUnauthorized);
    return () => window.removeEventListener("api-unauthorized", onUnauthorized);
  }, []);

  if (key) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form
        className="w-full max-w-sm space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const input = (e.currentTarget.elements.namedItem("passcode") as HTMLInputElement).value.trim();
          if (!input) return;
          sessionStorage.setItem(STORAGE_KEY, input);
          setError(false);
          setKey(input);
        }}
      >
        <h1 className="text-lg font-semibold">Enter passcode</h1>
        <input
          name="passcode"
          type="password"
          autoFocus
          className="w-full rounded-md border px-3 py-2"
          placeholder="Passcode"
        />
        {error && <p className="text-sm text-destructive">Wrong passcode, try again.</p>}
        <button type="submit" className="w-full rounded-md bg-primary px-3 py-2 text-primary-foreground">
          Unlock
        </button>
      </form>
    </div>
  );
}