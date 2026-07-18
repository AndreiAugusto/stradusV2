export interface ResumoDashboard {
  mes: number;
  ano: number;
  fretes: fretes;
  manutencoes: manutencoes;
  abastecimentos: abastecimentos;
  custosFixos: custosFixos;
  salarios: salarios;
  saldoLiquido: number;
}

export interface fretes {
  total: number;
  receitaBruta: number;
}
export interface manutencoes {
  total: number;
  custo: number;
}
export interface abastecimentos {
  total: number;
  custo: number;
}
export interface custosFixos {
  total: number;
  custo: number;
}
export interface salarios {
  custo: number;
}

export interface UltimaMovimentacao {
  tipo: 'frete' | 'abastecimento' | 'manutencao';
  id: number;
  data: string;
  valor: number;
  descricao: string;
  identificador: string;
}
