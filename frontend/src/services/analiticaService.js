import api from "./api";

export function getAnaliticaSettings() {
  return api.get("/analitica/settings");
}

export function saveAnaliticaSettings(data) {
  return api.put("/analitica/settings", data);
}
