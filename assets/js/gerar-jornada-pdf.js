/**
 * RAÍZES — Gerador do PDF final "Minha Jornada RAÍZES"
 * Reúne os 7 encontros (versículos, aprendizados, desafios), o diário
 * pessoal (pedidos/respostas de oração, decisões, carta ao futuro) e
 * fecha com uma carta de incentivo e espaço para assinaturas.
 * Depende de: encontros-data.js (ENCONTROS), pdf-data.js (CADERNOS),
 * progresso.js (Progresso), diario.js (Diario) e da lib global "jspdf".
 */
const JornadaPDF = (() => {

  const COR_ROOT = [27, 67, 50];
  const COR_ROOT_LIGHT = [45, 106, 79];
  const COR_GOLD = [184, 137, 43];
  const COR_INK = [18, 32, 26];
  const COR_INK_SOFT = [90, 105, 97];
  const COR_SURFACE = [244, 248, 245];
  const COR_GOLD_SOFT = [243, 231, 204];
  const COR_LINE = [220, 230, 223];
  const COR_WHITE = [255, 255, 255];

  const MARGEM = 20;
  const LARGURA = 210;
  const ALTURA = 297;
  const LARGURA_UTIL = LARGURA - MARGEM * 2;

  function cabecalho(doc) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...COR_ROOT_LIGHT);
    doc.text("MINHA JORNADA RAÍZES", MARGEM, 14);
    doc.setDrawColor(...COR_GOLD);
    doc.setLineWidth(0.4);
    doc.line(MARGEM, 17, LARGURA - MARGEM, 17);
  }

  function rodape(doc) {
    const paginaAtual = doc.internal.getNumberOfPages();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COR_INK_SOFT);
    doc.text("Minha Jornada RAÍZES", MARGEM, ALTURA - 12);
    doc.text(String(paginaAtual), LARGURA - MARGEM, ALTURA - 12, { align: "right" });
    doc.setDrawColor(...COR_LINE);
    doc.setLineWidth(0.3);
    doc.line(MARGEM, ALTURA - 16, LARGURA - MARGEM, ALTURA - 16);
  }

  function novaPagina(doc) {
    doc.addPage();
    cabecalho(doc);
    rodape(doc);
    return 30;
  }

  function garantirEspaco(doc, y, alturaNecessaria) {
    if (y + alturaNecessaria > ALTURA - 22) return novaPagina(doc);
    return y;
  }

  function tituloSecao(doc, texto, y, cor) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...(cor || COR_ROOT));
    doc.text(texto, MARGEM, y);
    doc.setDrawColor(...COR_GOLD);
    doc.setLineWidth(0.7);
    doc.line(MARGEM, y + 2.5, MARGEM + 18, y + 2.5);
    return y + 12;
  }

  function paragrafo(doc, texto, y, opts = {}) {
    const fontSize = opts.fontSize || 10.5;
    doc.setFont("helvetica", opts.italic ? "italic" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...(opts.cor || COR_INK));
    const linhas = doc.splitTextToSize(texto, opts.largura || LARGURA_UTIL);
    const alturaLinha = fontSize * 0.52;
    for (const linha of linhas) {
      y = garantirEspaco(doc, y, alturaLinha);
      doc.text(linha, MARGEM, y);
      y += alturaLinha;
    }
    return y + (opts.espacoDepois ?? 5);
  }

  function linhasEmBranco(doc, quantidade, y) {
    doc.setDrawColor(...COR_LINE);
    doc.setLineWidth(0.3);
    for (let i = 0; i < quantidade; i++) {
      y = garantirEspaco(doc, y, 8);
      doc.line(MARGEM, y, LARGURA - MARGEM, y);
      y += 8;
    }
    return y + 3;
  }

  // ---------------------------------------------------------------------

  function paginaCapa(doc) {
    doc.setFillColor(...COR_ROOT);
    doc.rect(0, 0, LARGURA, ALTURA, "F");
    const cx = LARGURA / 2;

    // Videira mais "cheia" — símbolo de uma jornada completa
    doc.setDrawColor(...COR_ROOT_LIGHT);
    doc.setLineWidth(1);
    doc.line(cx, 190, cx, 250);
    doc.setDrawColor(...COR_GOLD);
    doc.setLineWidth(0.6);
    const ramos = [
      [-16, 198, -26, 188], [16, 202, 26, 190],
      [-14, 214, -24, 206], [14, 216, 24, 208],
      [-12, 230, -20, 236], [12, 232, 20, 238],
      [-10, 244, -18, 250], [10, 246, 18, 252],
    ];
    for (let i = 0; i < ramos.length; i += 2) {
      const [dx1, y1] = ramos[i];
      const [dx2, y2] = ramos[i + 1];
      doc.line(cx, 190 + i * 3, cx + dx1, y1);
      doc.line(cx, 190 + i * 3, cx + dx2, y2);
    }
    doc.setFillColor(...COR_GOLD);
    ramos.forEach(([dx, y]) => doc.circle(cx + dx, y, 1.4, "F"));

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...COR_GOLD_SOFT);
    doc.text("JORNADA RAÍZES · DIÁRIO COMPLETO", cx, 45, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.setTextColor(...COR_WHITE);
    doc.text("Minha Jornada", cx, 75, { align: "center" });
    doc.text("RAÍZES", cx, 92, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(13);
    doc.setTextColor(...COR_GOLD_SOFT);
    doc.text('"Toda árvore um dia foi uma semente.', cx, 115, { align: "center" });
    doc.text('Toda fé madura começou com uma decisão."', cx, 124, { align: "center" });

    doc.setDrawColor(...COR_GOLD_SOFT);
    doc.setLineWidth(0.4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COR_GOLD_SOFT);
    doc.text("Nome:", MARGEM, 272);
    doc.line(MARGEM + 18, 272.5, LARGURA / 2 - 6, 272.5);
    doc.text("Data:", LARGURA / 2 + 6, 272);
    doc.line(LARGURA / 2 + 20, 272.5, LARGURA - MARGEM, 272.5);

    doc.setFontSize(8.5);
    doc.text("SETE ENCONTROS · UMA FÉ QUE AGORA É SUA", cx, ALTURA - 14, { align: "center" });
  }

  function paginaResumoEncontros(doc, diario) {
    let y = novaPagina(doc);
    y = tituloSecao(doc, "Os sete encontros", y);
    y = paragrafo(doc, "O que você viveu, versículo por versículo, encontro por encontro.", y, { italic: true, cor: COR_INK_SOFT, espacoDepois: 8 });

    for (const item of ENCONTROS) {
      const cad = (typeof CADERNOS !== "undefined" && CADERNOS[item.id]) || {};
      const registrado = diario.encontros[item.id] || {};
      const concluido = typeof Progresso !== "undefined" && Progresso.estaConcluido(item.id);
      const verso = registrado.versiculo?.trim() ? registrado.versiculo : (cad.versiculoChave ? cad.versiculoChave.ref : "");
      const aprendizado = registrado.deusFalou?.trim() ? registrado.deusFalou : (cad.fraseFinal || "");

      const corpo = `${verso ? "Versículo: " + verso + "\n" : ""}${aprendizado}`;
      const linhasCorpo = doc.splitTextToSize(corpo, LARGURA_UTIL - 16);
      const alturaCard = linhasCorpo.length * 4.8 + 20;
      y = garantirEspaco(doc, y, alturaCard);

      doc.setFillColor(...COR_SURFACE);
      doc.roundedRect(MARGEM, y, LARGURA_UTIL, alturaCard, 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...COR_ROOT);
      doc.text(`${item.id}. ${item.titulo}`, MARGEM + 8, y + 9);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...(concluido ? COR_ROOT_LIGHT : COR_INK_SOFT));
      doc.text(concluido ? "✓ concluído" : "— não marcado como concluído", LARGURA - MARGEM - 8, y + 9, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...COR_INK);
      doc.text(linhasCorpo, MARGEM + 8, y + 16);

      y += alturaCard + 5;
    }
    return y;
  }

  function paginaOracoes(doc, diario) {
    let y = novaPagina(doc);
    y = tituloSecao(doc, "Pedidos e respostas de oração", y);

    y = paragrafo(doc, "Pedidos de oração", y, { fontSize: 11, cor: COR_ROOT_LIGHT, espacoDepois: 4 });
    if (diario.pedidos.length) {
      for (const p of diario.pedidos) {
        y = paragrafo(doc, "• " + p, y, { espacoDepois: 2 });
      }
    } else {
      y = paragrafo(doc, "Nenhum pedido registrado no diário.", y, { italic: true, cor: COR_INK_SOFT });
    }
    y += 4;

    y = paragrafo(doc, "Respostas de oração", y, { fontSize: 11, cor: COR_ROOT_LIGHT, espacoDepois: 4 });
    if (diario.respostas.length) {
      for (const r of diario.respostas) {
        y = paragrafo(doc, "• " + r, y, { espacoDepois: 2 });
      }
    } else {
      y = paragrafo(doc, "Nenhuma resposta registrada no diário.", y, { italic: true, cor: COR_INK_SOFT });
    }
    return y;
  }

  function paginaDecisoes(doc, diario) {
    let y = novaPagina(doc);
    y = tituloSecao(doc, "Decisões que tomei", y);
    if (diario.decisoes.length) {
      for (const d of diario.decisoes) {
        y = paragrafo(doc, "• " + d, y, { espacoDepois: 3 });
      }
    } else {
      y = paragrafo(doc, "Nenhuma decisão registrada no diário — mas cada encontro te chamou a uma. Volte e escreva a sua.", y, { italic: true, cor: COR_INK_SOFT });
    }
    y += 6;
    y = paragrafo(doc, "Espaço livre", y, { fontSize: 11, cor: COR_ROOT_LIGHT, espacoDepois: 4 });
    y = linhasEmBranco(doc, 5, y);
    return y;
  }

  function paginaCartaFinal(doc, diario) {
    let y = novaPagina(doc);
    y = tituloSecao(doc, "Carta ao meu eu do futuro", y);
    if (diario.carta?.trim()) {
      y = paragrafo(doc, diario.carta, y, { espacoDepois: 8 });
    } else {
      y = paragrafo(doc, "Você ainda não escreveu essa carta no diário. Volte lá quando quiser — ela vai ficar guardada aqui.", y, { italic: true, cor: COR_INK_SOFT, espacoDepois: 8 });
    }

    y = garantirEspaco(doc, y, 60);
    y = tituloSecao(doc, "Uma carta pra você", y);
    const cartaEquipe = "Você começou essa jornada dependendo, em boa parte, da fé de outras pessoas — dos seus pais, da sua igreja, de quem caminhou com você. Ao longo desses sete encontros, essa fé foi se tornando sua: decidida, cultivada, testada, honesta, protegida, verdadeira e agora pronta para ser compartilhada. Continue voltando a Jesus, todos os dias, mesmo nos dias sem vontade nenhuma. Ele estará com você sempre — até o fim dos tempos.";
    y = paragrafo(doc, cartaEquipe, y, { italic: true, cor: COR_ROOT, fontSize: 11.5, espacoDepois: 4 });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COR_INK_SOFT);
    doc.text("— Jornada RAÍZES", MARGEM, y);
    return y;
  }

  function paginaAssinaturas(doc) {
    doc.addPage();
    doc.setFillColor(...COR_ROOT);
    doc.rect(0, 0, LARGURA, ALTURA, "F");
    const cx = LARGURA / 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...COR_GOLD_SOFT);
    doc.text("JORNADA CONCLUÍDA", cx, 60, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...COR_WHITE);
    const frase = doc.splitTextToSize("Você chegou aqui dependendo da fé dos outros. Sai daqui chamado a viver uma fé que agora é só sua.", LARGURA_UTIL - 30);
    doc.text(frase, cx, 90, { align: "center" });

    const yAss = 200;
    doc.setDrawColor(...COR_GOLD_SOFT);
    doc.setLineWidth(0.4);
    doc.line(MARGEM, yAss, LARGURA / 2 - 8, yAss);
    doc.line(LARGURA / 2 + 8, yAss, LARGURA - MARGEM, yAss);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COR_GOLD_SOFT);
    doc.text("Assinatura do adolescente", MARGEM, yAss + 6);
    doc.text("Assinatura do líder", LARGURA / 2 + 8, yAss + 6);

    doc.text("Data de conclusão da jornada:", MARGEM, yAss + 26);
    doc.line(MARGEM + 62, yAss + 26.5, LARGURA - MARGEM, yAss + 26.5);

    doc.setFontSize(8.5);
    doc.text("JORNADA RAÍZES · UMA JORNADA DE DISCIPULADO", cx, ALTURA - 16, { align: "center" });
  }

  // ---------------------------------------------------------------------

  function gerar() {
    if (typeof window.jspdf === "undefined") {
      console.error("RAÍZES: biblioteca jsPDF indisponível.");
      return;
    }
    const diario = Diario.carregar();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    paginaCapa(doc);
    paginaResumoEncontros(doc, diario);
    paginaOracoes(doc, diario);
    paginaDecisoes(doc, diario);
    paginaCartaFinal(doc, diario);
    paginaAssinaturas(doc);

    doc.save("Minha-Jornada-RAIZES.pdf");
  }

  return { gerar };
})();
