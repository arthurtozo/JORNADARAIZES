/**
 * RAÍZES — Fonte única de dados dos encontros.
 * Usado pela sidebar, pela timeline da landing page e pelo cálculo de progresso.
 * Mantém tudo isso num único lugar evita duplicar a lista em cada página.
 */
const ENCONTROS = [
  {
    id: 1,
    slug: "encontro-01",
    titulo: "Quem é Jesus para mim?",
    resumo: "Fé herdada não salva — cada pessoa precisa decidir seguir Jesus.",
    base: "João 15 · Mateus 16",
  },
  {
    id: 2,
    slug: "encontro-02",
    titulo: "Como criar raízes em Cristo?",
    resumo: "Oração, Bíblia, comunhão e constância — relacionamento não depende de emoção.",
    base: "João 15",
  },
  {
    id: 3,
    slug: "encontro-03",
    titulo: "Qual testemunho eu quero ser?",
    resumo: "Você já está escrevendo sua história. Como quer ser lembrado daqui a dez anos?",
    base: "1 Timóteo 4:12",
  },
  {
    id: 4,
    slug: "encontro-04",
    titulo: "Como vencer a batalha da carne?",
    resumo: "Ninguém acorda longe de Deus — nos afastamos aos poucos. E voltamos aos poucos também.",
    base: "Gálatas 5 · Romanos 7",
  },
  {
    id: 5,
    slug: "encontro-05",
    titulo: "Quem está moldando meu coração?",
    resumo: "Redes sociais, algoritmos e amizades — como proteger a mente.",
    base: "Provérbios 4:23 · Romanos 12:2",
  },
  {
    id: 6,
    slug: "encontro-06",
    titulo: "Vivendo a fé quando ninguém está olhando",
    resumo: "Integridade, vida secreta e um Deus que vê o coração.",
    base: "1 Samuel 16:7 · Mateus 6",
  },
  {
    id: 7,
    slug: "encontro-07",
    titulo: "Chamados para fazer discípulos",
    resumo: "Adolescentes também têm chamado: evangelismo, amor e serviço.",
    base: "Mateus 28:18-20",
  },
];

const PROJETO_FINAL = {
  slug: "projeto-final",
  titulo: "Minha Jornada com Cristo",
  resumo: "Apresentação final — de 5 a 10 minutos sobre o que Deus fez nessa caminhada.",
};
