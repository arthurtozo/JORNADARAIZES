/**
 * RAÍZES — Gerador de PDF (Caderno do Aluno)
 * Usa jsPDF (carregado via CDN na página) para montar, no navegador,
 * um caderno devocional em A4 para cada encontro — não é um print da
 * tela, é um documento com sua própria diagramação.
 * Depende de: pdf-data.js (objeto CADERNOS) e da lib global "jspdf".
 */
const CadernoPDF = (() => {

  const COR_ROOT = [27, 67, 50];
  const COR_GOLD = [184, 137, 43];
  const COR_INK = [18, 32, 26];
  const COR_INK_SOFT = [90, 105, 97];
  const COR_SURFACE = [244, 248, 245];
  const COR_GOLD_SOFT = [243, 231, 204];
  const COR_LINE = [220, 230, 223];

  const MARGEM = 20;
  const LARGURA = 210;
  const ALTURA = 297;
  const LARGURA_UTIL = LARGURA - MARGEM * 2;

  function novaPagina(doc, numeroEncontro, tituloEncontro) {
    doc.addPage();
    rodape(doc, numeroEncontro, tituloEncontro);
    return MARGEM + 6;
  }

  function rodape(doc, numeroEncontro, tituloEncontro) {
    const paginaAtual = doc.internal.getNumberOfPages();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COR_INK_SOFT);
    doc.text(`Caderno RAÍZES — Encontro ${numeroEncontro}`, MARGEM, ALTURA - 12);
    doc.text(String(paginaAtual), LARGURA - MARGEM, ALTURA - 12, { align: "right" });
    doc.setDrawColor(...COR_LINE);
    doc.setLineWidth(0.3);
    doc.line(MARGEM, ALTURA - 16, LARGURA - MARGEM, ALTURA - 16);
  }

  function garantirEspaco(doc, y, alturaNecessaria, numeroEncontro, tituloEncontro) {
    if (y + alturaNecessaria > ALTURA - 24) {
      return novaPagina(doc, numeroEncontro, tituloEncontro);
    }
    return y;
  }

  function escreverTitulo(doc, texto, y) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...COR_ROOT);
    doc.text(texto.toUpperCase(), MARGEM, y);
    doc.setDrawColor(...COR_GOLD);
    doc.setLineWidth(0.6);
    doc.line(MARGEM, y + 2, MARGEM + 16, y + 2);
    return y + 10;
  }

  function escreverParagrafo(doc, texto, y, numeroEncontro, tituloEncontro, opts = {}) {
    const fontSize = opts.fontSize || 10.5;
    const cor = opts.cor || COR_INK;
    const italic = opts.italic || false;
    doc.setFont("helvetica", italic ? "italic" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...cor);
    const linhas = doc.splitTextToSize(texto, opts.largura || LARGURA_UTIL);
    const alturaLinha = fontSize * 0.5;
    for (const linha of linhas) {
      y = garantirEspaco(doc, y, alturaLinha, numeroEncontro, tituloEncontro);
      doc.text(linha, opts.x || MARGEM, y);
      y += alturaLinha;
    }
    return y + (opts.espacoDepois ?? 4);
  }

  function escreverSubtitulo(doc, texto, y, numeroEncontro, tituloEncontro) {
    y = garantirEspaco(doc, y, 10, numeroEncontro, tituloEncontro);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...COR_ROOT);
    doc.text(texto, MARGEM, y);
    return y + 6;
  }

  function escreverLista(doc, itens, y, numeroEncontro, tituloEncontro, opts = {}) {
    const fontSize = opts.fontSize || 10.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...COR_INK);
    for (const item of itens) {
      const linhas = doc.splitTextToSize(item, LARGURA_UTIL - 6);
      y = garantirEspaco(doc, y, linhas.length * 5 + 2, numeroEncontro, tituloEncontro);
      doc.setTextColor(...COR_GOLD);
      doc.text("•", MARGEM, y);
      doc.setTextColor(...COR_INK);
      doc.text(linhas, MARGEM + 5, y);
      y += linhas.length * 5 + 2;
    }
    return y + 3;
  }

  function escreverPergunta(doc, texto, y, numeroEncontro, tituloEncontro, linhasParaEscrever = 2) {
    y = garantirEspaco(doc, y, 26, numeroEncontro, tituloEncontro);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...COR_ROOT);
    const linhasTexto = doc.splitTextToSize(texto, LARGURA_UTIL);
    doc.text(linhasTexto, MARGEM, y);
    y += linhasTexto.length * 5 + 3;
    doc.setDrawColor(...COR_LINE);
    doc.setLineWidth(0.3);
    for (let i = 0; i < linhasParaEscrever; i++) {
      y = garantirEspaco(doc, y, 8, numeroEncontro, tituloEncontro);
      doc.line(MARGEM, y, LARGURA - MARGEM, y);
      y += 8;
    }
    return y + 2;
  }

  function caixaVersiculo(doc, texto, ref, y, numeroEncontro, tituloEncontro) {
    const linhas = doc.splitTextToSize(`"${texto}"`, LARGURA_UTIL - 16);
    const alturaCaixa = linhas.length * 6 + 20;
    y = garantirEspaco(doc, y, alturaCaixa, numeroEncontro, tituloEncontro);
    doc.setFillColor(...COR_SURFACE);
    doc.roundedRect(MARGEM, y, LARGURA_UTIL, alturaCaixa, 3, 3, "F");
    doc.setDrawColor(...COR_GOLD);
    doc.setLineWidth(1.2);
    doc.line(MARGEM + 6, y + 5, MARGEM + 6, y + alturaCaixa - 5);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(12);
    doc.setTextColor(...COR_ROOT);
    doc.text(linhas, MARGEM + 14, y + 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COR_INK_SOFT);
    doc.text(ref, MARGEM + 14, y + alturaCaixa - 7);
    return y + alturaCaixa + 8;
  }

  function checklistPDF(doc, itens, y, numeroEncontro, tituloEncontro) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    for (const item of itens) {
      const linhas = doc.splitTextToSize(item, LARGURA_UTIL - 12);
      y = garantirEspaco(doc, y, linhas.length * 5 + 4, numeroEncontro, tituloEncontro);
      doc.setDrawColor(...COR_INK_SOFT);
      doc.setLineWidth(0.4);
      doc.rect(MARGEM, y - 4, 4, 4);
      doc.setTextColor(...COR_INK);
      doc.text(linhas, MARGEM + 8, y);
      y += linhas.length * 5 + 4;
    }
    return y + 3;
  }

  function tabelaLeitura(doc, plano, y, numeroEncontro, tituloEncontro) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    for (const dia of plano) {
      y = garantirEspaco(doc, y, 9, numeroEncontro, tituloEncontro);
      doc.setDrawColor(...COR_INK_SOFT);
      doc.setLineWidth(0.4);
      doc.rect(MARGEM, y - 4, 4, 4);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COR_ROOT);
      doc.text(`Dia ${dia.dia}`, MARGEM + 8, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COR_INK);
      const linhas = doc.splitTextToSize(dia.texto, LARGURA_UTIL - 30);
      doc.text(linhas, MARGEM + 26, y);
      y += Math.max(linhas.length * 5, 7) + 2;
    }
    return y + 3;
  }

  function capa(doc, numeroEncontro, dados) {
    doc.setFillColor(...COR_ROOT);
    doc.rect(0, 0, LARGURA, ALTURA, "F");

    doc.setDrawColor(...COR_GOLD);
    doc.setLineWidth(0.6);
    doc.line(MARGEM, 60, LARGURA - MARGEM, 60);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...COR_GOLD_SOFT);
    doc.text("CADERNO RAÍZES", LARGURA / 2, 45, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(34);
    doc.setTextColor(255, 255, 255);
    doc.text(`Encontro ${numeroEncontro}`, LARGURA / 2, 90, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(17);
    const tituloLinhas = doc.splitTextToSize(dados.titulo, LARGURA_UTIL - 20);
    doc.text(tituloLinhas, LARGURA / 2, 110, { align: "center" });

    const yVerse = 170;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(13);
    doc.setTextColor(...COR_GOLD_SOFT);
    const verseLinhas = doc.splitTextToSize(`"${dados.versiculoChave.texto}"`, LARGURA_UTIL - 30);
    doc.text(verseLinhas, LARGURA / 2, yVerse, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(dados.versiculoChave.ref, LARGURA / 2, yVerse + verseLinhas.length * 7 + 6, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COR_GOLD_SOFT);
    doc.text("JORNADA RAÍZES · UMA JORNADA DE DISCIPULADO", LARGURA / 2, ALTURA - 22, { align: "center" });
  }

  function gerar(numeroEncontro) {
    const dados = CADERNOS[numeroEncontro];
    if (!dados || typeof window.jspdf === "undefined") {
      console.error("RAÍZES: dados do caderno ou biblioteca jsPDF indisponíveis.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    // ---- Capa ----
    capa(doc, numeroEncontro, dados);

    // ---- Página: objetivo + resumo + versículo ----
    let y = novaPagina(doc, numeroEncontro, dados.titulo);
    y = escreverTitulo(doc, "Objetivo", y);
    y = escreverParagrafo(doc, dados.objetivo, y, numeroEncontro, dados.titulo, { espacoDepois: 8 });
    y = escreverTitulo(doc, "Resumo", y);
    y = escreverParagrafo(doc, dados.resumo, y, numeroEncontro, dados.titulo, { espacoDepois: 8 });
    y = caixaVersiculo(doc, dados.versiculoChave.texto, dados.versiculoChave.ref, y, numeroEncontro, dados.titulo);

    // ---- Página: estudo aprofundado ----
    y = novaPagina(doc, numeroEncontro, dados.titulo);
    y = escreverTitulo(doc, "Estudo aprofundado", y);
    for (const bloco of dados.estudo) {
      y = escreverSubtitulo(doc, bloco.titulo, y, numeroEncontro, dados.titulo);
      y = escreverParagrafo(doc, bloco.texto, y, numeroEncontro, dados.titulo, { espacoDepois: 6 });
    }
    y = escreverSubtitulo(doc, "Curiosidade", y, numeroEncontro, dados.titulo);
    y = escreverParagrafo(doc, dados.curiosidade, y, numeroEncontro, dados.titulo, { italic: true, cor: COR_INK_SOFT });

    // ---- Página: aplicações + perguntas individuais ----
    y = novaPagina(doc, numeroEncontro, dados.titulo);
    y = escreverTitulo(doc, "Aplicações", y);
    y = escreverLista(doc, dados.aplicacoes, y, numeroEncontro, dados.titulo);
    y = escreverTitulo(doc, "Perguntas individuais", y + 4);
    for (const pergunta of dados.perguntasIndividuais) {
      y = escreverPergunta(doc, pergunta, y, numeroEncontro, dados.titulo, 3);
    }

    // ---- Página: perguntas em grupo + oração + desafio ----
    y = novaPagina(doc, numeroEncontro, dados.titulo);
    y = escreverTitulo(doc, "Perguntas em grupo", y);
    for (const pergunta of dados.perguntasGrupo) {
      y = escreverPergunta(doc, pergunta, y, numeroEncontro, dados.titulo, 2);
    }
    y = escreverTitulo(doc, "Oração", y + 2);
    y = escreverParagrafo(doc, dados.oracaoGuia, y, numeroEncontro, dados.titulo, { espacoDepois: 6 });
    y = escreverSubtitulo(doc, "Minha oração pessoal", y, numeroEncontro, dados.titulo);
    for (let i = 0; i < 3; i++) {
      y = garantirEspaco(doc, y, 8, numeroEncontro, dados.titulo);
      doc.setDrawColor(...COR_LINE);
      doc.line(MARGEM, y, LARGURA - MARGEM, y);
      y += 8;
    }
    y = escreverTitulo(doc, "Desafio da semana", y + 2);
    y = escreverParagrafo(doc, dados.desafioSemana, y, numeroEncontro, dados.titulo);

    // ---- Página: plano de leitura + versículo + checklist ----
    y = novaPagina(doc, numeroEncontro, dados.titulo);
    y = escreverTitulo(doc, "Plano de leitura bíblica — 7 dias", y);
    y = tabelaLeitura(doc, dados.planoLeitura, y, numeroEncontro, dados.titulo);
    y = escreverTitulo(doc, "Versículo para memorizar", y + 2);
    y = caixaVersiculo(doc, dados.versiculoMemorizar?.texto || dados.versiculoChave.texto, dados.versiculoMemorizar?.ref || dados.versiculoChave.ref, y, numeroEncontro, dados.titulo);
    y = escreverTitulo(doc, "Checklist espiritual", y);
    y = checklistPDF(doc, dados.checklist, y, numeroEncontro, dados.titulo);

    // ---- Página: pedidos e respostas de oração + frase final ----
    y = novaPagina(doc, numeroEncontro, dados.titulo);
    y = escreverTitulo(doc, "Pedidos de oração", y);
    for (let i = 0; i < 4; i++) {
      y = garantirEspaco(doc, y, 8, numeroEncontro, dados.titulo);
      doc.setDrawColor(...COR_LINE);
      doc.line(MARGEM, y, LARGURA - MARGEM, y);
      y += 8;
    }
    y = escreverTitulo(doc, "Respostas de oração", y + 2);
    for (let i = 0; i < 4; i++) {
      y = garantirEspaco(doc, y, 8, numeroEncontro, dados.titulo);
      doc.setDrawColor(...COR_LINE);
      doc.line(MARGEM, y, LARGURA - MARGEM, y);
      y += 8;
    }
    y = garantirEspaco(doc, y, 30, numeroEncontro, dados.titulo);
    y += 6;
    doc.setFillColor(...COR_GOLD_SOFT);
    const fraseLinhas = doc.splitTextToSize(dados.fraseFinal, LARGURA_UTIL - 16);
    const alturaFrase = fraseLinhas.length * 6 + 12;
    doc.roundedRect(MARGEM, y, LARGURA_UTIL, alturaFrase, 3, 3, "F");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(...COR_ROOT);
    doc.text(fraseLinhas, LARGURA / 2, y + 9, { align: "center" });

    doc.save(`Caderno-RAIZES-Encontro-${numeroEncontro}.pdf`);
  }

  return { gerar };
})();
