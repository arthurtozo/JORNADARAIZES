/**
 * RAÍZES — Navegação
 * Monta a sidebar (marcadores concluído/atual/próximo + barra de progresso)
 * a partir de ENCONTROS (encontros-data.js) e Progresso (progresso.js).
 * Chamar Navegacao.montar("encontro-03") em cada página, passando o slug
 * da própria página para destacar o item ativo.
 */
const Navegacao = (() => {
  function iconeStatus(item, slugAtual) {
    if (item.slug === slugAtual) return "is-active";
    if (Progresso.estaConcluido(item.id)) return "is-done";
    return "";
  }

  function montar(slugAtual) {
    const alvo = document.querySelector("[data-sidebar-nav]");
    if (!alvo) return;

    const itens = ENCONTROS.map((item) => {
      const status = iconeStatus(item, slugAtual);
      return `
        <li class="nav-item ${status}">
          <a href="${item.slug}.html">
            <span class="status-dot" aria-hidden="true"></span>
            <span>${item.id}. ${item.titulo}</span>
          </a>
        </li>`;
    }).join("");

    const itemFinal = `
      <li class="nav-item ${PROJETO_FINAL.slug === slugAtual ? "is-active" : ""}">
        <a href="${PROJETO_FINAL.slug}.html">
          <span class="status-dot" aria-hidden="true"></span>
          <span>Projeto Final</span>
        </a>
      </li>`;

    alvo.innerHTML = itens + itemFinal;

    const barra = document.querySelector("[data-progress-fill]");
    const rotulo = document.querySelector("[data-progress-label]");
    const pct = Progresso.percentual(ENCONTROS.length);
    if (barra) barra.style.width = pct + "%";
    if (rotulo) rotulo.textContent = pct + "% concluído";
  }

  return { montar };
})();
