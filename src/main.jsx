import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import App from "./App.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import { scheduleProactiveRefresh } from "./api/client.js";
import "./index.css";

scheduleProactiveRefresh();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* METU MOTION — zorunlu reduced-motion desteği.
        index.css'teki @media (prefers-reduced-motion) kuralı yalnızca CSS
        animasyon/transition'larını susturur; Framer Motion inline style ile
        JS'ten animasyon yaptığı için o kuralın kapsamı DIŞINDA kalıyordu.
        reducedMotion="user" ile Framer işletim sistemi ayarına uyar:
        transform/layout hareketi kalkar, opacity crossfade korunur —
        DESIGN.md'nin "hareket = daha az ve nazik, sıfır değil" kuralı. */}
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BrowserRouter>
    </MotionConfig>
  </React.StrictMode>
);
