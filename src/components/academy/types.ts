export interface Course {
  id: string;
  title: string;
  description: string;
  track: "vendas" | "lideranca" | "operacional" | "onboarding";
  duration: string;
  lessons: number;
  progress: number;
  level: "Iniciante" | "Intermediário" | "Avançado";
  thumbnail?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  currentLesson?: string;
}

export interface Track {
  id: string;
  name: string;
  description: string;
  courseCount: number;
}

export const mockCourses: Course[] = [
  {
    id: "1",
    title: "Trade Marketing Avançado",
    description: "Estratégias de execução em PDV e mensuração de ROI para ações de trade marketing",
    track: "vendas",
    duration: "4h 30min",
    lessons: 12,
    progress: 75,
    level: "Avançado",
    isFeatured: true,
    currentLesson: "Aula 9: Métricas de Performance",
  },
  {
    id: "2",
    title: "Liderança Situacional",
    description: "Adapte seu estilo de gestão conforme o contexto e maturidade da equipe",
    track: "lideranca",
    duration: "3h 15min",
    lessons: 8,
    progress: 0,
    level: "Intermediário",
    isNew: true,
  },
  {
    id: "3",
    title: "Negociação com Fornecedores",
    description: "Técnicas avançadas para fechar acordos vantajosos de verba cooperada",
    track: "vendas",
    duration: "2h 45min",
    lessons: 7,
    progress: 45,
    level: "Avançado",
    currentLesson: "Aula 4: Gatilhos de Negociação",
  },
  {
    id: "4",
    title: "Gestão de Equipes Remotas",
    description: "Como manter produtividade e engajamento em times distribuídos",
    track: "lideranca",
    duration: "2h 00min",
    lessons: 6,
    progress: 100,
    level: "Intermediário",
  },
  {
    id: "5",
    title: "Operação de Loja: Excelência",
    description: "Padronização de processos e gestão de rotina para gerentes de loja",
    track: "operacional",
    duration: "5h 00min",
    lessons: 15,
    progress: 20,
    level: "Iniciante",
    currentLesson: "Aula 3: Checklist de Abertura",
  },
  {
    id: "6",
    title: "Onboarding da Rede",
    description: "Tudo que você precisa saber para começar na sua rede",
    track: "onboarding",
    duration: "1h 30min",
    lessons: 5,
    progress: 0,
    level: "Iniciante",
    isNew: true,
  },
  {
    id: "7",
    title: "Visual Merchandising",
    description: "Transforme seu PDV em uma experiência de compra memorável",
    track: "vendas",
    duration: "3h 00min",
    lessons: 9,
    progress: 0,
    level: "Intermediário",
  },
  {
    id: "8",
    title: "Feedback Eficaz",
    description: "Comunicação assertiva para desenvolvimento de equipes",
    track: "lideranca",
    duration: "1h 45min",
    lessons: 5,
    progress: 0,
    level: "Iniciante",
  },
  {
    id: "9",
    title: "Gestão de Estoque",
    description: "Controle de inventário e redução de perdas no varejo",
    track: "operacional",
    duration: "4h 00min",
    lessons: 12,
    progress: 0,
    level: "Avançado",
  },
  {
    id: "10",
    title: "Cultura Organizacional",
    description: "Conheça nossos valores, missão e como fazemos a diferença",
    track: "onboarding",
    duration: "45min",
    lessons: 3,
    progress: 100,
    level: "Iniciante",
  },
  {
    id: "11",
    title: "Campanhas Promocionais",
    description: "Planejamento e execução de campanhas de alto impacto",
    track: "vendas",
    duration: "2h 30min",
    lessons: 8,
    progress: 0,
    level: "Intermediário",
  },
  {
    id: "12",
    title: "Atendimento ao Cliente",
    description: "Técnicas para encantar e fidelizar clientes no varejo",
    track: "operacional",
    duration: "2h 15min",
    lessons: 7,
    progress: 60,
    level: "Iniciante",
    currentLesson: "Aula 5: Lidando com Reclamações",
  },
];

export const tracks: Track[] = [
  { id: "vendas", name: "Vendas", description: "Técnicas de vendas e trade marketing", courseCount: 5 },
  { id: "lideranca", name: "Liderança", description: "Gestão de equipes e desenvolvimento", courseCount: 3 },
  { id: "operacional", name: "Operacional", description: "Processos e rotinas de loja", courseCount: 3 },
  { id: "onboarding", name: "Onboarding", description: "Integração de novos colaboradores", courseCount: 2 },
];
