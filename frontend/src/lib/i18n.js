import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "./api.js";

export function useTranslatedMap({ base, lang, cacheKey, source = "es" }) {
  const [map, setMap] = useState(base[lang] || null);

  const baseKeys = useMemo(() => Object.keys(base[source] || {}), [base, source]);
  const baseValues = useMemo(() => baseKeys.map((k) => base[source][k]), [baseKeys, base, source]);

  useEffect(() => {
    if (base[lang]) {
      setMap(base[lang]);
      return;
    }
    if (!lang || lang === source) {
      setMap(base[source]);
      return;
    }
    const storageKey = `i18n:${cacheKey}:${lang}`;
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      try {
        setMap(JSON.parse(cached));
        return;
      } catch {
        localStorage.removeItem(storageKey);
      }
    }

    let isActive = true;
    apiRequest("/api/i18n/translate", "POST", {
      source,
      target: lang,
      texts: baseValues,
      keys: baseKeys
    })
      .then((res) => {
        if (!isActive) return;
        const translations = res?.translations || {};
        setMap(translations);
        localStorage.setItem(storageKey, JSON.stringify(translations));
      })
      .catch(() => {
        if (!isActive) return;
        setMap(base[source]);
      });

    return () => {
      isActive = false;
    };
  }, [lang, base, source, cacheKey, baseKeys, baseValues]);

  return map || base[source];
}
