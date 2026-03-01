import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Explicitly register the service worker for PWA
import { registerSW } from "virtual:pwa-register";
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(<App />);
