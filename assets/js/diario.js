/**
 * RAÍZES — Diário de Caminhada
 * Camada única de acesso ao LocalStorage do diário pessoal. Guarda, por
 * encontro, o que Deus falou e o versículo marcante — mais listas gerais
 * de pedidos de oração, respostas de oração, decisões tomadas e a carta
 * para o "eu do futuro". Usado por diario.html e por jornada-pdf.js.
 */
const Diario = (() => {
  const CHAVE = "raizes:diario";

  function vazio() {
    return {
      encontros: {},   // { 1: { deusFalou: "", versiculo: "" }, ... }
      pedidos: [],
      respostas: [],
      decisoes: [],
      carta: "",
    };
  }

  function carregar() {
    try {
      const bruto = localStorage.getItem(CHAVE);
      return bruto ? { ...vazio(), ...JSON.parse(bruto) } : vazio();
    } catch (e) {
      console.warn("RAÍZES: não foi possível ler o diário salvo.", e);
      return vazio();
    }
  }

  function salvar(estado) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch (e) {
      console.warn("RAÍZES: não foi possível salvar o diário.", e);
    }
  }

  function salvarEncontro(id, campos) {
    const estado = carregar();
    estado.encontros[id] = { ...(estado.encontros[id] || {}), ...campos };
    salvar(estado);
    return estado;
  }

  function adicionarItem(lista, texto) {
    if (!texto || !texto.trim()) return carregar();
    const estado = carregar();
    estado[lista].push(texto.trim());
    salvar(estado);
    return estado;
  }

  function removerItem(lista, indice) {
    const estado = carregar();
    estado[lista].splice(indice, 1);
    salvar(estado);
    return estado;
  }

  function salvarCarta(texto) {
    const estado = carregar();
    estado.carta = texto;
    salvar(estado);
    return estado;
  }

  return { carregar, salvarEncontro, adicionarItem, removerItem, salvarCarta };
})();
