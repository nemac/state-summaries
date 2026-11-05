import { useEffect } from "react";

const SITE_NAME = "State Climate Summaries Data Explorer";

// Sets the browser tab title, specific part first, so screen reader users and
// people with many tabs open can tell views apart.
export function usePageTitle(viewName) {
  useEffect(() => {
    document.title = viewName ? `${viewName} · ${SITE_NAME}` : SITE_NAME;
  }, [viewName]);
}
