import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import QRScanner from "../../components/QRScanner.jsx";
import { getAccessToken } from "../../api/client.js";

function extractMachineId(text) {
  try {
    const url = new URL(text);
    // Handles both /machine/:id and /machines/:id path patterns
    const m = url.pathname.match(/\/machines?\/([^/?#]+)/);
    if (m) return m[1];
  } catch {
    // Not a full URL — try relative path match
  }
  const m = text.match(/\/machines?\/([^/?#]+)/);
  if (m) return m[1];
  // Fallback: treat the whole string as the machine ID
  return text.trim();
}

export default function ScanQR() {
  const nav = useNavigate();

  const handleResult = useCallback(
    (text) => {
      const id = extractMachineId(text);
      if (getAccessToken()) {
        nav(`/machines/${id}`, { replace: true });
      } else {
        nav("/auth", {
          state: { redirectTo: `/machines/${id}` },
          replace: true,
        });
      }
    },
    [nav],
  );

  return <QRScanner onResult={handleResult} onClose={() => nav(-1)} />;
}
