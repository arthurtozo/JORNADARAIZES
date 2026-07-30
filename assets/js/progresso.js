/**
 * RAÍZES — Módulo de Progresso
 * Camada única de acesso ao LocalStorage. Nenhum outro arquivo deve
 * ler/escrever "raizes:*" diretamente — sempre passar por aqui,
 * para que a chave e o formato dos dados só precisem mudar num lugar.
 */
const Progresso = (() => {
  const CHAVE = "raizes:progresso";

  function carregar() {
    try {
      const bruto = localStorage.getItem(CHAVE);
      return bruto ? JSON.parse(bruto) : { concluidos: [], atual: 1 };
    } catch (e) {
      console.warn("RAÍZES: não foi possível ler o progresso salvo.", e);
      return { concluidos: [], atual: 1 };
    }
  }

  function salvar(estado) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch (e) {
      console.warn("RAÍZES: não foi possível salvar o progresso.", e);
    }
  }

  function marcarConcluido(idEncontro) {
    const estado = carregar();
    if (!estado.concluidos.includes(idEncontro)) {
      estado.concluidos.push(idEncontro);
    }
    estado.atual = Math.min(idEncontro + 1, 7);
    salvar(estado);
    return estado;
  }

  function estaConcluido(idEncontro) {
    return carregar().concluidos.includes(idEncontro);
  }

  function percentual(totalEncontros) {
    const estado = carregar();
    return Math.round((estado.concluidos.length / totalEncontros) * 100);
  }

  function encontroAtual() {
    return carregar().atual;
  }

  return { carregar, marcarConcluido, estaConcluido, percentual, encontroAtual };
})();
