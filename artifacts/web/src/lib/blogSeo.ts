import { useEffect } from "react";

function upsertMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let node = document.head.querySelector<HTMLMetaElement>(selector);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(attribute, key);
    document.head.appendChild(node);
  }
  node.content = content;
}

export function useBlogSeo(title: string, description: string, path: string) {
  useEffect(() => {
    const fullTitle = `${title} | Medofile`;
    const url = `${window.location.origin}${path}`;
    document.title = fullTitle;
    upsertMeta('meta[name="description"]', "name", "description", description);
    upsertMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    upsertMeta('meta[property="og:url"]', "property", "og:url", url);
    upsertMeta('meta[property="og:type"]', "property", "og:type", "article");
    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary");
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }, [title, description, path]);
}