import { useEffect } from "react";

const TAWK_SRC = "https://embed.tawk.to/6a1e7cb4acfd811c30c8dcd7/1jq3he9am";

export function TawkTo() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.querySelector(`script[src="${TAWK_SRC}"]`)) return;

    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = TAWK_SRC;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    const s0 = document.getElementsByTagName("script")[0];
    if (s0?.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    }
  }, []);

  return null;
}
