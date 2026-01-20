import { Router } from "express";
import { translateTexts } from "../utils/translate.js";

const router = Router();

router.post("/translate", async (req, res) => {
  const { source = "es", target, texts = [], keys = [] } = req.body || {};
  if (!target || !Array.isArray(texts) || texts.length === 0) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    const translated = await translateTexts({ source, target, texts });
    if (!translated) {
      return res.status(503).json({ error: "Traducción no disponible" });
    }
    const result = {};
    for (let i = 0; i < translated.length; i += 1) {
      const key = keys[i] || String(i);
      result[key] = translated[i];
    }
    return res.json({ translations: result });
  } catch (err) {
    return res.status(500).json({ error: "Error traduciendo" });
  }
});

export default router;
