/* ==========================================================================
   Genten Detail — chat.js
   Widget de chat IA (@n8n/chat) embebido en la landing. El "cerebro" vive en
   el workflow n8n "Genten Chat Web" (Chat Trigger en modo streaming) — ver
   n8n genten/CLAUDE.md.
   ========================================================================== */

import { createChat } from "https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js";

// La URL de producción del Chat Trigger lleva el sufijo /chat (sin él, el
// webhook responde 500 y ni siquiera ejecuta el workflow).
const CHAT_WEBHOOK_URL = "https://n8n.jalda.xyz/webhook/648fb314-26da-4679-b18a-7f5d0e249040/chat";
const AUTO_OPEN_DELAY_MS = 5000;
// En móvil la ventana cubre casi toda la pantalla, así que se espera más para
// que el visitante alcance a ver el hero antes de que aparezca el chat.
const AUTO_OPEN_DELAY_MOBILE_MS = 15000;
const MOBILE_BREAKPOINT = 768;
const AUTO_OPEN_FLAG = "genten_chat_auto_opened";

function autoOpenDelay() {
  return window.innerWidth < MOBILE_BREAKPOINT
    ? AUTO_OPEN_DELAY_MOBILE_MS
    : AUTO_OPEN_DELAY_MS;
}

/* El widget @n8n/chat solo trae textos en inglés. Al fijar defaultLanguage
   distinto de 'en' hay que entregar el bloque i18n correspondiente; si no,
   los textos de UI (incluido el placeholder del input) quedan undefined y el
   área para escribir no se renderiza. Se incluye también 'en' como fallback. */
const CHAT_I18N_ES = {
  title: "¡Hola! 👋",
  subtitle: "Escríbenos y agenda tu hora al instante.",
  footer: "",
  getStarted: "Nueva conversación",
  inputPlaceholder: "Escribe tu mensaje…",
  closeButtonTooltip: "Cerrar",
};

createChat({
  webhookUrl: CHAT_WEBHOOK_URL,
  target: "#n8n-chat",
  mode: "window",
  showWelcomeScreen: false,
  // Debe quedar en false: con true, el widget hace un fetch al webhook al abrir
  // (sin try/catch) que, si falla, aborta el montaje y deja la ventana SIN caja
  // de texto. En false crea la sesión localmente y el input siempre aparece.
  loadPreviousSession: false,
  enableStreaming: true,
  defaultLanguage: "es",
  initialMessages: [
    "¡Hola! 👋",
    "Soy el asistente de Genten Detail. Puedo darte precios, revisar disponibilidad y agendar tu hora aquí mismo.",
  ],
  i18n: {
    es: CHAT_I18N_ES,
    en: CHAT_I18N_ES,
  },
});

/* --------------------------------------------------------------------------
   Auto-apertura a los 5s, una sola vez por sesión de navegador. Si el
   visitante abre o cierra el chat por su cuenta antes de los 5s, no se
   fuerza la apertura después.
   -------------------------------------------------------------------------- */
function markAutoOpenHandled() {
  sessionStorage.setItem(AUTO_OPEN_FLAG, "1");
}

function initAutoOpen() {
  if (sessionStorage.getItem(AUTO_OPEN_FLAG)) return;

  const poll = setInterval(() => {
    const toggle = document.querySelector(".chat-window-toggle");
    if (!toggle) return;
    clearInterval(poll);

    toggle.addEventListener("click", markAutoOpenHandled, { once: true });

    setTimeout(() => {
      if (sessionStorage.getItem(AUTO_OPEN_FLAG)) return;
      toggle.click();
      markAutoOpenHandled();
    }, autoOpenDelay());
  }, 200);
}

document.addEventListener("DOMContentLoaded", initAutoOpen);
