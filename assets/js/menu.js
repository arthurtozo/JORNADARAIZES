/**
 * RAÍZES — Menu rápido de encontros
 * Monta um painel suspenso, a partir de ENCONTROS (encontros-data.js) e
 * Progresso (progresso.js), pra pular entre encontros sem sair do modo
 * apresentação. Cada página de encontro define <body data-encontro-atual="encontro-03">.
 */
document.addEventListener("DOMContentLoaded", () => {
  const botao = document.querySelector("[data-menu-toggle]");
  const painel = document.querySelector("[data-menu-panel]");
  if (!botao || !painel || typeof ENCONTROS === "undefined") return;

  const atual = document.body.dataset.encontroAtual;

  const linkInicio = `<a href="index.html">🏠 Início da jornada</a>`;
  const itens = ENCONTROS.map((item) => {
    const concluido = typeof Progresso !== "undefined" && Progresso.estaConcluido(item.id);
    const classes = [item.slug === atual ? "is-current" : "", concluido ? "is-done" : ""].filter(Boolean).join(" ");
    return `<a href="${item.slug}.html" class="${classes}">
      <span class="menu-dot"></span>${item.id}. ${item.titulo}
    </a>`;
  }).join("");

  painel.innerHTML = linkInicio + itens;

  botao.addEventListener("click", (e) => {
    e.stopPropagation();
    painel.classList.toggle("is-open");
  });

  document.addEventListener("click", (e) => {
    if (!painel.contains(e.target) && e.target !== botao) {
      painel.classList.remove("is-open");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") painel.classList.remove("is-open");
  });
});
