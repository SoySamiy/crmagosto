import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();
const dataFile = path.resolve("analitica-settings.json");

function loadSettings() {
  try {
    if (fs.existsSync(dataFile)) {
      const raw = fs.readFileSync(dataFile, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error leyendo analitica-settings.json", err);
  }
  return { budget: null, assetBase: null };
}

function saveSettings(obj) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(obj, null, 2));
    return true;
  } catch (err) {
    console.error("Error escribiendo analitica-settings.json", err);
    return false;
  }
}

router.get("/settings", (req, res) => {
  const s = loadSettings();
  res.json(s);
});

router.put("/settings", (req, res) => {
  const payload = req.body || {};
  const current = loadSettings();
  const next = { ...current, ...payload };
  const ok = saveSettings(next);
  if (!ok) return res.status(500).json({ message: "No se pudo guardar" });
  res.json(next);
});

export default router;
