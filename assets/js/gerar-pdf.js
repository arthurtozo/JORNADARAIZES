/**
 * RAÍZES — Gerador de PDF (Caderno do Aluno)
 * Usa jsPDF (via CDN) para montar, no navegador, um caderno de discipulado
 * completo — não um resumo da aula, mas material pra continuar a semana.
 * Identidade visual igual à do site: cards, muito espaço em branco,
 * tipografia elegante, nada de blocos grandes de texto.
 * Depende de: pdf-data.js (objeto CADERNOS) e da lib global "jspdf".
 */
const CadernoPDF = (() => {

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

  // Prompts genéricos do plano devocional — rotacionam por dia, usados em
  // qualquer encontro, pra dar reflexão/pergunta/oração sem repetir 49 textos.
  const REFLEXOES_DIA = [
    "O que esse texto revela sobre o caráter de Deus?",
    "Como esse versículo se conecta com o tema desta semana?",
    "O que eu preciso confessar ou agradecer depois de ler isso?",
    "Se eu levasse este versículo a sério hoje, o que mudaria?",
    "Que promessa ou desafio esse texto traz pra mim?",
    "Reescreva esse versículo com suas próprias palavras.",
    "O que eu quero lembrar desta semana daqui a um mês?",
  ];
  const ORACOES_DIA = [
    "Agradeça por algo que Deus mostrou hoje.",
    "Peça a Deus ajuda pra viver o que você leu.",
    "Ore por alguém que você ama.",
    "Confesse algo a Deus em silêncio.",
    "Peça coragem pra viver sua fé hoje.",
    "Ore pela sua família.",
    "Encerre a semana agradecendo a Deus pela jornada.",
  ];

  const MOODS = [
    { emoji: "😀", label: "Muito próxima" },
    { emoji: "🙂", label: "Boa" },
    { emoji: "😐", label: "Mais ou menos" },
    { emoji: "😞", label: "Distante" },
    { emoji: "😶", label: "Não sei dizer" },
  ];

  const CHECKLIST_SEMANA = [
    "Li minha Bíblia",
    "Orei",
    "Conversei com Deus",
    "Memorizei o versículo",
    "Fiz o desafio da semana",
    "Compartilhei minha fé",
    "Fui ao culto",
    "Participei da célula / GC",
  ];

  // ---------------------------------------------------------------------
  // Primitivas de layout
  // ---------------------------------------------------------------------

  function cabecalho(doc, numeroEncontro, tituloEncontro) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...COR_ROOT_LIGHT);
    doc.text(`RAÍZES · ENCONTRO ${numeroEncontro}`, MARGEM, 14);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COR_INK_SOFT);
    const tCurto = tituloEncontro.length > 46 ? tituloEncontro.slice(0, 44) + "…" : tituloEncontro;
    doc.text(tCurto, LARGURA - MARGEM, 14, { align: "right" });
    doc.setDrawColor(...COR_GOLD);
    doc.setLineWidth(0.4);
    doc.line(MARGEM, 17, LARGURA - MARGEM, 17);
  }

  function rodape(doc) {
    const paginaAtual = doc.internal.getNumberOfPages();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COR_INK_SOFT);
    doc.text("Caderno RAÍZES", MARGEM, ALTURA - 12);
    doc.text(String(paginaAtual), LARGURA - MARGEM, ALTURA - 12, { align: "right" });
    doc.setDrawColor(...COR_LINE);
    doc.setLineWidth(0.3);
    doc.line(MARGEM, ALTURA - 16, LARGURA - MARGEM, ALTURA - 16);
  }

  function novaPagina(doc, numeroEncontro, tituloEncontro) {
    doc.addPage();
    cabecalho(doc, numeroEncontro, tituloEncontro);
    rodape(doc);
    return 30;
  }

  function garantirEspaco(doc, y, alturaNecessaria, numeroEncontro, tituloEncontro) {
    if (y + alturaNecessaria > ALTURA - 22) {
      return novaPagina(doc, numeroEncontro, tituloEncontro);
    }
    return y;
  }

  function tituloSecao(doc, texto, y, opts = {}) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...(opts.cor || COR_ROOT));
    doc.text(texto, MARGEM, y);
    doc.setDrawColor(...COR_GOLD);
    doc.setLineWidth(0.7);
    doc.line(MARGEM, y + 2.5, MARGEM + 18, y + 2.5);
    return y + 12;
  }

  function paragrafo(doc, texto, y, numeroEncontro, tituloEncontro, opts = {}) {
    const fontSize = opts.fontSize || 10.5;
    const cor = opts.cor || COR_INK;
    doc.setFont("helvetica", opts.italic ? "italic" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...cor);
    const linhas = doc.splitTextToSize(texto, opts.largura || LARGURA_UTIL);
    const alturaLinha = fontSize * 0.52;
    for (const linha of linhas) {
      y = garantirEspaco(doc, y, alturaLinha, numeroEncontro, tituloEncontro);
      doc.text(linha, opts.x || MARGEM, y, opts.align ? { align: opts.align } : undefined);
      y += alturaLinha;
    }
    return y + (opts.espacoDepois ?? 5);
  }

  // Card com título, ícone opcional e corpo — o bloco visual central do caderno
  function card(doc, { titulo, corpo, y, numeroEncontro, tituloEncontro, icone, corTitulo, corFundo, corBorda }) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const linhasCorpo = doc.splitTextToSize(corpo, LARGURA_UTIL - 16);
    const alturaTexto = linhasCorpo.length * 5;
    const alturaTitulo = titulo ? 8 : 0;
    const alturaCard = alturaTitulo + alturaTexto + 12;
    y = garantirEspaco(doc, y, alturaCard, numeroEncontro, tituloEncontro);

    doc.setFillColor(...(corFundo || COR_SURFACE));
    doc.roundedRect(MARGEM, y, LARGURA_UTIL, alturaCard, 3, 3, "F");
    if (corBorda) {
      doc.setDrawColor(...corBorda);
      doc.setLineWidth(0.6);
      doc.line(MARGEM + 6, y + 4, MARGEM + 6, y + alturaCard - 4);
    }

    let cy = y + 9;
    if (titulo) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...(corTitulo || COR_ROOT_LIGHT));
      doc.text((icone ? icone + "  " : "") + titulo.toUpperCase(), MARGEM + 10, cy);
      cy += 7;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COR_INK);
    doc.text(linhasCorpo, MARGEM + 10, cy);

    return y + alturaCard + 6;
  }

  function listaMarcada(doc, itens, y, numeroEncontro, tituloEncontro) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    for (const item of itens) {
      const linhas = doc.splitTextToSize(item, LARGURA_UTIL - 8);
      y = garantirEspaco(doc, y, linhas.length * 5 + 3, numeroEncontro, tituloEncontro);
      doc.setTextColor(...COR_GOLD);
      doc.text("•", MARGEM, y);
      doc.setTextColor(...COR_INK);
      doc.text(linhas, MARGEM + 6, y);
      y += linhas.length * 5 + 3;
    }
    return y + 3;
  }

  function perguntaComLinhas(doc, texto, y, numeroEncontro, tituloEncontro, nLinhas = 2) {
    y = garantirEspaco(doc, y, 10 + nLinhas * 8, numeroEncontro, tituloEncontro);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...COR_ROOT);
    const linhasTexto = doc.splitTextToSize(texto, LARGURA_UTIL);
    doc.text(linhasTexto, MARGEM, y);
    y += linhasTexto.length * 5 + 3;
    doc.setDrawColor(...COR_LINE);
    doc.setLineWidth(0.3);
    for (let i = 0; i < nLinhas; i++) {
      y = garantirEspaco(doc, y, 8, numeroEncontro, tituloEncontro);
      doc.line(MARGEM, y, LARGURA - MARGEM, y);
      y += 8;
    }
    return y + 3;
  }

  function linhasEmBranco(doc, quantidade, y, numeroEncontro, tituloEncontro) {
    doc.setDrawColor(...COR_LINE);
    doc.setLineWidth(0.3);
    for (let i = 0; i < quantidade; i++) {
      y = garantirEspaco(doc, y, 8, numeroEncontro, tituloEncontro);
      doc.line(MARGEM, y, LARGURA - MARGEM, y);
      y += 8;
    }
    return y + 3;
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

  // ---------------------------------------------------------------------
  // Páginas
  // ---------------------------------------------------------------------

  function paginaCapa(doc, numeroEncontro, dados) {
    doc.setFillColor(...COR_ROOT);
    doc.rect(0, 0, LARGURA, ALTURA, "F");

    // Motivo decorativo — videira simplificada (tronco + ramos + raízes)
    const cx = LARGURA / 2;
    doc.setDrawColor(...COR_ROOT_LIGHT);
    doc.setLineWidth(0.8);
    doc.line(cx, 232, cx, 258);
    doc.setDrawColor(...COR_GOLD);
    doc.setLineWidth(0.6);
    [[-14, 236, -22, 228], [14, 240, 22, 230], [-10, 250, -18, 254], [10, 252, 18, 256]].forEach(([dx1, y1, dx2, y2]) => {
      doc.line(cx, 244, cx + dx1, y1);
      doc.line(cx + dx1, y1, cx + dx2, y2);
    });
    doc.setFillColor(...COR_GOLD);
    [[-22, 228], [22, 230], [-18, 254], [18, 256]].forEach(([dx, y]) => doc.circle(cx + dx, y, 1.3, "F"));

    doc.setDrawColor(...COR_GOLD);
    doc.setLineWidth(0.5);
    doc.line(MARGEM, 55, LARGURA - MARGEM, 55);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...COR_GOLD_SOFT);
    doc.text("RAÍZES · CADERNO DE DISCIPULADO", cx, 42, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.setTextColor(...COR_WHITE);
    doc.text(`Encontro ${numeroEncontro}`, cx, 82, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(15);
    const tituloLinhas = doc.splitTextToSize(dados.titulo, LARGURA_UTIL - 30);
    doc.text(tituloLinhas, cx, 100, { align: "center" });

    const yVerse = 150;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(12);
    doc.setTextColor(...COR_GOLD_SOFT);
    const verseLinhas = doc.splitTextToSize(`"${dados.versiculoChave.texto}"`, LARGURA_UTIL - 34);
    doc.text(verseLinhas, cx, yVerse, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...COR_WHITE);
    doc.text(dados.versiculoChave.ref, cx, yVerse + verseLinhas.length * 6.5 + 6, { align: "center" });

    // Campos "Nome" e "Data"
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
    doc.text("JORNADA RAÍZES · UMA JORNADA DE DISCIPULADO", cx, ALTURA - 14, { align: "center" });
  }

  function paginaCoracaoHoje(doc, numeroEncontro, dados) {
    let y = novaPagina(doc, numeroEncontro, dados.titulo);
    y = tituloSecao(doc, "Antes de começar", y);
    y = paragrafo(doc, "Como está meu coração hoje?", y, numeroEncontro, dados.titulo, { fontSize: 13, cor: COR_ROOT, espacoDepois: 10 });

    const larguraCartao = (LARGURA_UTIL - 16) / 5;
    let x = MARGEM;
    doc.setFont("helvetica", "normal");
    for (const m of MOODS) {
      doc.setFillColor(...COR_SURFACE);
      doc.roundedRect(x, y, larguraCartao, 26, 3, 3, "F");
      doc.setFontSize(15);
      doc.text(m.emoji, x + larguraCartao / 2, y + 12, { align: "center" });
      doc.setFontSize(6.8);
      doc.setTextColor(...COR_INK_SOFT);
      const linhas = doc.splitTextToSize(m.label, larguraCartao - 4);
      doc.text(linhas, x + larguraCartao / 2, y + 19, { align: "center" });
      x += larguraCartao + 4;
    }
    y += 26 + 14;

    y = paragrafo(doc, "Pelo que quero orar hoje?", y, numeroEncontro, dados.titulo, { fontSize: 11, cor: COR_ROOT, espacoDepois: 6 });
    y = linhasEmBranco(doc, 3, y, numeroEncontro, dados.titulo);
    return y;
  }

  function paginaVamosAprender(doc, numeroEncontro, dados) {
    let y = novaPagina(doc, numeroEncontro, dados.titulo);
    y = tituloSecao(doc, "O que vamos aprender", y);
    y = paragrafo(doc, dados.fraseImpacto, y, numeroEncontro, dados.titulo, { fontSize: 14, cor: COR_GOLD, italic: true, espacoDepois: 8 });
    y = card(doc, { titulo: "Objetivo do encontro", corpo: dados.objetivo, y, numeroEncontro, tituloEncontro: dados.titulo });
    y = card(doc, { titulo: "Pergunta principal", corpo: dados.perguntasGrupo[0], y, numeroEncontro, tituloEncontro: dados.titulo, corFundo: COR_GOLD_SOFT, corTitulo: COR_GOLD });
    y = caixaVersiculo(doc, dados.versiculoChave.texto, dados.versiculoChave.ref, y, numeroEncontro, dados.titulo);
    return y;
  }

  function paginaEstudo(doc, numeroEncontro, dados) {
    let y = novaPagina(doc, numeroEncontro, dados.titulo);
    y = tituloSecao(doc, "O estudo", y);
    for (const bloco of dados.estudo) {
      y = card(doc, { titulo: bloco.titulo, corpo: bloco.texto, y, numeroEncontro, tituloEncontro: dados.titulo });
    }
    return y;
  }

  function paginaContextoBiblico(doc, numeroEncontro, dados) {
    let y = novaPagina(doc, numeroEncontro, dados.titulo);
    y = tituloSecao(doc, "Contexto bíblico", y);

    // mini "linha do tempo": Escrito → Você lendo → Hoje
    const yTL = y + 4;
    doc.setDrawColor(...COR_LINE);
    doc.setLineWidth(0.5);
    doc.line(MARGEM + 10, yTL, LARGURA - MARGEM - 10, yTL);
    const pontos = [
      { x: MARGEM + 10, label: "Escrito" },
      { x: LARGURA / 2, label: "Este encontro" },
      { x: LARGURA - MARGEM - 10, label: "Sua vida, hoje" },
    ];
    for (const p of pontos) {
      doc.setFillColor(...COR_GOLD);
      doc.circle(p.x, yTL, 1.6, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...COR_INK_SOFT);
      doc.text(p.label, p.x, yTL + 6, { align: "center" });
    }
    y = yTL + 16;

    const largura3 = (LARGURA_UTIL - 8) / 3;
    const linhasQuem = doc.splitTextToSize(dados.quemEscreveu, largura3 - 6);
    const linhasPara = doc.splitTextToSize(dados.paraQuem, largura3 - 6);
    const linhasPorque = doc.splitTextToSize(dados.porque, largura3 - 6);
    const alturaMax = Math.max(linhasQuem.length, linhasPara.length, linhasPorque.length) * 4.6 + 18;
    y = garantirEspaco(doc, y, alturaMax, numeroEncontro, dados.titulo);

    const blocos3 = [
      { label: "Quem escreveu", linhas: linhasQuem },
      { label: "Para quem", linhas: linhasPara },
      { label: "Por que escreveu", linhas: linhasPorque },
    ];
    let x = MARGEM;
    for (const b of blocos3) {
      doc.setFillColor(...COR_SURFACE);
      doc.roundedRect(x, y, largura3, alturaMax, 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...COR_ROOT_LIGHT);
      doc.text(b.label.toUpperCase(), x + 5, y + 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...COR_INK);
      doc.text(b.linhas, x + 5, y + 14);
      x += largura3 + 4;
    }
    y += alturaMax + 8;

    y = card(doc, { titulo: "Curiosidade", corpo: dados.curiosidade, y, numeroEncontro, tituloEncontro: dados.titulo, icone: "💡", corFundo: COR_WHITE, corBorda: COR_GOLD });
    return y;
  }

  function paginaAplicacao(doc, numeroEncontro, dados) {
    let y = novaPagina(doc, numeroEncontro, dados.titulo);
    y = tituloSecao(doc, "O que isso muda amanhã?", y);
    y = card(doc, { corpo: dados.aplicacaoAmanha, y, numeroEncontro, tituloEncontro: dados.titulo, corFundo: COR_GOLD_SOFT, icone: "🌱" });
    y += 2;
    y = listaMarcada(doc, dados.aplicacoes, y, numeroEncontro, dados.titulo);
    return y;
  }

  function paginaPareEPense(doc, numeroEncontro, dados) {
    let y = novaPagina(doc, numeroEncontro, dados.titulo);
    y = tituloSecao(doc, "Pare e pense", y);
    y = paragrafo(doc, "Não existe resposta certa aqui — é só você e Deus conversando.", y, numeroEncontro, dados.titulo, { italic: true, cor: COR_INK_SOFT, espacoDepois: 8 });
    for (const pergunta of dados.pareEPense) {
      y = perguntaComLinhas(doc, pergunta, y, numeroEncontro, dados.titulo, 2);
    }
    return y;
  }

  function paginaConversaFamilia(doc, numeroEncontro, dados) {
    let y = novaPagina(doc, numeroEncontro, dados.titulo);
    y = tituloSecao(doc, "Conversa em família", y);
    y = paragrafo(doc, "Escolha um momento essa semana pra perguntar isso aos seus pais ou responsáveis:", y, numeroEncontro, dados.titulo, { espacoDepois: 8 });
    for (const pergunta of dados.conversaFamilia) {
      y = card(doc, { corpo: pergunta, y, numeroEncontro, tituloEncontro: dados.titulo, icone: "👪" });
    }
    return y;
  }

  function paginaDesafio(doc, numeroEncontro, dados) {
    let y = novaPagina(doc, numeroEncontro, dados.titulo);
    y = tituloSecao(doc, "Desafio da semana", y);
    y = card(doc, { corpo: dados.desafioSemana, y, numeroEncontro, tituloEncontro: dados.titulo, corFundo: COR_WHITE, corBorda: COR_GOLD, icone: "🎯" });
    return y;
  }

  function paginasPlanoDevocional(doc, numeroEncontro, dados) {
    let y = novaPagina(doc, numeroEncontro, dados.titulo);
    y = tituloSecao(doc, "Plano devocional — 7 dias", y);
    y = paragrafo(doc, "Cerca de 5 minutos por dia. Leia devagar, pense antes de virar a página.", y, numeroEncontro, dados.titulo, { italic: true, cor: COR_INK_SOFT, espacoDepois: 6 });

    for (const dia of dados.planoLeitura) {
      const reflexao = REFLEXOES_DIA[(dia.dia - 1) % REFLEXOES_DIA.length];
      const oracao = ORACOES_DIA[(dia.dia - 1) % ORACOES_DIA.length];
      const corpo = `Leitura: ${dia.texto}\nReflita: ${reflexao}\nOre: ${oracao}`;
      const linhasCorpo = doc.splitTextToSize(corpo, LARGURA_UTIL - 34);
      const alturaCard = linhasCorpo.length * 4.6 + 16;
      y = garantirEspaco(doc, y, alturaCard, numeroEncontro, dados.titulo);

      doc.setFillColor(...COR_SURFACE);
      doc.roundedRect(MARGEM, y, LARGURA_UTIL, alturaCard, 3, 3, "F");
      doc.setFillColor(...COR_ROOT);
      doc.circle(MARGEM + 12, y + alturaCard / 2, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...COR_WHITE);
      doc.text(String(dia.dia), MARGEM + 12, y + alturaCard / 2 + 1.2, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...COR_INK);
      doc.text(linhasCorpo, MARGEM + 26, y + 8);

      y += alturaCard + 5;
    }
    return y;
  }

  function paginaDiario(doc, numeroEncontro, dados) {
    let y = novaPagina(doc, numeroEncontro, dados.titulo);
    y = tituloSecao(doc, "Meu diário de caminhada", y);
    const secoes = [
      "O que Deus falou comigo",
      "O que eu aprendi",
      "O que eu quero mudar",
      "Como posso viver isso",
    ];
    for (const s of secoes) {
      y = paragrafo(doc, s, y, numeroEncontro, dados.titulo, { fontSize: 10.5, cor: COR_ROOT_LIGHT, espacoDepois: 4 });
      y = linhasEmBranco(doc, 2, y, numeroEncontro, dados.titulo);
    }
    return y;
  }

  function paginaChecklist(doc, numeroEncontro, dados) {
    let y = novaPagina(doc, numeroEncontro, dados.titulo);
    y = tituloSecao(doc, "Checklist da semana", y);
    y = paragrafo(doc, "Não é sobre controle. É sobre incentivar constância.", y, numeroEncontro, dados.titulo, { italic: true, cor: COR_INK_SOFT, espacoDepois: 6 });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    for (const item of CHECKLIST_SEMANA) {
      y = garantirEspaco(doc, y, 9, numeroEncontro, dados.titulo);
      doc.setDrawColor(...COR_INK_SOFT);
      doc.setLineWidth(0.4);
      doc.rect(MARGEM, y - 4, 4, 4);
      doc.setTextColor(...COR_INK);
      doc.text(item, MARGEM + 8, y);
      y += 9;
    }
    return y;
  }

  function paginaMinhaOracao(doc, numeroEncontro, dados) {
    let y = novaPagina(doc, numeroEncontro, dados.titulo);
    y = tituloSecao(doc, "Minha oração", y);
    y = paragrafo(doc, "\"Converse com Deus como você conversaria com um Pai que ama ouvir você.\"", y, numeroEncontro, dados.titulo, { fontSize: 12, italic: true, cor: COR_GOLD, espacoDepois: 4 });
    y = paragrafo(doc, dados.oracaoGuia, y, numeroEncontro, dados.titulo, { espacoDepois: 8 });
    y = linhasEmBranco(doc, 8, y, numeroEncontro, dados.titulo);
    return y;
  }

  function paginaProximaEtapa(doc, numeroEncontro, dados) {
    doc.addPage();
    doc.setFillColor(...COR_ROOT);
    doc.rect(0, 0, LARGURA, ALTURA, "F");
    const cx = LARGURA / 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...COR_GOLD_SOFT);
    doc.text("OLHANDO PARA A PRÓXIMA ETAPA", cx, 90, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(15);
    doc.setTextColor(...COR_WHITE);
    const linhas = doc.splitTextToSize(dados.proximaEtapa, LARGURA_UTIL - 30);
    doc.text(linhas, cx, 115, { align: "center" });

    doc.setDrawColor(...COR_GOLD);
    doc.setLineWidth(0.5);
    doc.line(cx - 20, 115 + linhas.length * 8 + 10, cx + 20, 115 + linhas.length * 8 + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COR_GOLD_SOFT);
    doc.text("JORNADA RAÍZES", cx, ALTURA - 20, { align: "center" });
  }

  // ---------------------------------------------------------------------
  // Geração completa
  // ---------------------------------------------------------------------

  function gerar(numeroEncontro) {
    const dados = CADERNOS[numeroEncontro];
    if (!dados || typeof window.jspdf === "undefined") {
      console.error("RAÍZES: dados do caderno ou biblioteca jsPDF indisponíveis.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    paginaCapa(doc, numeroEncontro, dados);
    paginaCoracaoHoje(doc, numeroEncontro, dados);
    paginaVamosAprender(doc, numeroEncontro, dados);
    paginaEstudo(doc, numeroEncontro, dados);
    paginaContextoBiblico(doc, numeroEncontro, dados);
    paginaAplicacao(doc, numeroEncontro, dados);
    paginaPareEPense(doc, numeroEncontro, dados);
    paginaConversaFamilia(doc, numeroEncontro, dados);
    paginaDesafio(doc, numeroEncontro, dados);
    paginasPlanoDevocional(doc, numeroEncontro, dados);
    paginaDiario(doc, numeroEncontro, dados);
    paginaChecklist(doc, numeroEncontro, dados);
    paginaMinhaOracao(doc, numeroEncontro, dados);
    paginaProximaEtapa(doc, numeroEncontro, dados);

    doc.save(`Caderno-RAIZES-Encontro-${numeroEncontro}.pdf`);
  }

  return { gerar };
})();
