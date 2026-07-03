/* ==========================================================================
   Genten Detail — main.js
   ========================================================================== */

/* --------------------------------------------------------------------------
   CONFIG WHATSAPP
   Único lugar para cambiar el número y el mensaje. Formato: 569XXXXXXXX
   -------------------------------------------------------------------------- */
const WHATSAPP = {
  phone: "56955111948",                          // número real de Genten
  text:  "Hola Genten 👋 Quiero agendar mi moto", // mensaje por defecto
};

/** Construye un link wa.me a partir de un mensaje. */
function waLink(message) {
  const msg = encodeURIComponent(message || WHATSAPP.text);
  const phone = WHATSAPP.phone.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${msg}`;
}

/* Conecta todos los elementos con [data-wa]. Si trae un mensaje propio
   (data-wa-msg) lo usa; si no, el mensaje por defecto. */
function wireWhatsApp() {
  document.querySelectorAll("[data-wa]").forEach((el) => {
    const custom = el.getAttribute("data-wa-msg");
    el.setAttribute("href", waLink(custom));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });
}

/* --------------------------------------------------------------------------
   Slider Antes / Después
   -------------------------------------------------------------------------- */
function initBeforeAfter() {
  const slider = document.querySelector("[data-ba]");
  if (!slider) return;

  const track = slider.querySelector(".ba-track");
  const pairs = track.children.length;
  const dotsWrap = slider.parentElement.querySelector(".ba-dots");
  let index = 0;

  // dots
  for (let i = 0; i < pairs; i++) {
    const dot = document.createElement("button");
    dot.className = "ba-dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", `Ir al par ${i + 1}`);
    dot.addEventListener("click", () => go(i));
    dotsWrap.appendChild(dot);
  }

  function go(i) {
    index = (i + pairs) % pairs;
    track.style.transform = `translateX(-${index * 100}%)`;
    dotsWrap.querySelectorAll(".ba-dot").forEach((d, di) =>
      d.classList.toggle("is-active", di === index)
    );
  }

  slider.querySelector(".ba-prev").addEventListener("click", () => go(index - 1));
  slider.querySelector(".ba-next").addEventListener("click", () => go(index + 1));
}

/* --------------------------------------------------------------------------
   Init
   -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  wireWhatsApp();
  initBeforeAfter();
});
