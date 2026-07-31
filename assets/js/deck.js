/**
 * RAÍZES — Motor de Slides (Deck)
 * Navegação estilo Keynote: uma ideia por tela.
 * Avança com seta direita / espaço / clique / swipe.
 * Volta com seta esquerda / clique no botão de voltar.
 * Não avança quando o clique é em um botão, link ou controle (data-no-advance).
 */
const Deck = (() => {
  let slides = [];
  let idx = 0;

  function atualizarDots() {
    document.querySelectorAll("[data-dot]").forEach((d, n) => {
      d.classList.toggle("is-current", n === idx);
    });
  }

  function mostrar(i) {
    idx = Math.max(0, Math.min(i, slides.length - 1));
    slides.forEach((s, n) => s.classList.toggle("is-active", n === idx));
    atualizarDots();
    window.dispatchEvent(new CustomEvent("deck:slide", { detail: { index: idx, total: slides.length, id: slides[idx].dataset.slideId || null } }));
  }

  function proximo() { if (idx < slides.length - 1) mostrar(idx + 1); }
  function anterior() { if (idx > 0) mostrar(idx - 1); }

  function montarDots() {
    const alvo = document.querySelector("[data-dots]");
    if (!alvo) return;
    alvo.innerHTML = slides.map(() => '<span class="dot" data-dot></span>').join("");
  }

  function telaCheia() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  function iniciar() {
    const container = document.querySelector("[data-deck]");
    if (!container) return;
    slides = Array.from(container.querySelectorAll(".slide"));
    montarDots();
    mostrar(0);

    document.addEventListener("keydown", (e) => {
      if (["ArrowRight", "ArrowDown", " ", "PageDown"].includes(e.key)) { e.preventDefault(); proximo(); }
      if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); anterior(); }
      if (e.key === "Home") { e.preventDefault(); mostrar(0); }
      if (e.key === "f" || e.key === "F") { telaCheia(); }
    });

    container.addEventListener("click", (e) => {
      if (e.target.closest("button, a, input, textarea, [data-no-advance]")) return;
      proximo();
    });

    document.querySelector("[data-next]")?.addEventListener("click", (e) => { e.stopPropagation(); proximo(); });
    document.querySelector("[data-prev]")?.addEventListener("click", (e) => { e.stopPropagation(); anterior(); });
    document.querySelector("[data-fullscreen]")?.addEventListener("click", (e) => { e.stopPropagation(); telaCheia(); });

    let touchX = null;
    container.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    container.addEventListener("touchend", (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (dx < -40) proximo();
      if (dx > 40) anterior();
      touchX = null;
    });
  }

  return { iniciar, proximo, anterior, mostrar, get indice() { return idx; }, get total() { return slides.length; } };
})();

document.addEventListener("DOMContentLoaded", Deck.iniciar);
