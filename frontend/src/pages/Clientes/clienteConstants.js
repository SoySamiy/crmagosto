export const TIPOS_CLIENTE = [
  { valor: "prospecto", label: "Prospecto" },
  { valor: "cliente", label: "Cliente" },
  { valor: "cliente_frecuente", label: "Cliente frecuente" },
  { valor: "ex_cliente", label: "Ex-cliente" },
];

export const ETAPAS_POR_TIPO = {
  prospecto: [
    { valor: "contacto_inicial", label: "Contacto inicial" },
    { valor: "cotizacion", label: "Cotizacion" },
    { valor: "negociacion", label: "Negociacion" },
  ],
  cliente: [
    { valor: "onboarding", label: "Onboarding" },
    { valor: "retencion", label: "Retencion" },
    { valor: "fidelizado", label: "Fidelizado" },
  ],
  cliente_frecuente: [{ valor: "fidelizado", label: "Fidelizado" }],
  ex_cliente: [{ valor: "inactivo", label: "Inactivo" }],
};

export const ORIGENES_CLIENTE = [
  "Meta Ads",
  "Google Ads",
  "Sitio web",
  "Recomendacion",
  "Whatsapp",
  "Llamada en frio",
  "Campaña",
  "Otro",
];

export function getTipoLabel(tipoValor) {
  return TIPOS_CLIENTE.find((t) => t.valor === tipoValor)?.label || tipoValor;
}

export function getEtapasDeTipo(tipoValor) {
  return ETAPAS_POR_TIPO[tipoValor] || [];
}

export function getEtapaLabel(tipoValor, etapaValor) {
  return getEtapasDeTipo(tipoValor).find((e) => e.valor === etapaValor)?.label || etapaValor;
}
