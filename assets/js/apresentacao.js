/**
 * RAÍZES — Modo Apresentação
 * Alterna a classe "presentation-mode" no <body> (aumenta fonte, esconde
 * sidebar e campos de escrita individual — pensado para projetor/TV) e
 * oferece atalho para tela cheia. Preferência salva em sessionStorage
 * (não precisa persistir entre visitas, só durante o encontro).
 */
const ModoApresentacao = (() => {
  const CHAVE = "raizes:apresentacao";

  function aplicar(ligado) {
    document.body.classList.toggle("presentation-mode", ligado);
    const botao = document.querySelector("[data-toggle-apresentacao]");
    if (botao) {
      botao.setAttribute("aria-pressed", String(ligado));
      botao.textContent = ligado ? "Sair do modo apresentação" : "Modo apresentação";
    }
  }

  function alternar() {
    const ligado = document.body.classList.contains("presentation-mode");
    sessionStorage.setItem(CHAVE, ligado ? "0" : "1");
    aplicar(!ligado);
  }

  function telaCheia() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  function iniciar() {
    aplicar(sessionStorage.getItem(CHAVE) === "1");
    document.querySelector("[data-toggle-apresentacao]")
      ?.addEventListener("click", alternar);
    document.querySelector("[data-toggle-fullscreen]")
      ?.addEventListener("click", telaCheia);
  }

  return { iniciar };
})();

document.addEventListener("DOMContentLoaded", ModoApresentacao.iniciar);
