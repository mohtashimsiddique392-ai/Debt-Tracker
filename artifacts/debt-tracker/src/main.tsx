import { createRoot } from "react-dom/client";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import App from "./App";
import { ApiKeyGate, STORAGE_KEY } from "@/components/api-key-gate";
import "./index.css";

setBaseUrl(import.meta.env.VITE_API_URL ?? null);
setAuthTokenGetter(() => sessionStorage.getItem(STORAGE_KEY));

createRoot(document.getElementById("root")!).render(
  <ApiKeyGate>
    <App />
  </ApiKeyGate>,
);