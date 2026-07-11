export interface ManutencaoModel {
  id?: number;
  descricao?: string;
  custo?: number;
  data: string;
  caminhaoId?: number;
  oficinaId?: number;
  numeroParcelas?: number;
  totalParcelas?: number;
  parcelasPagas?: number;
  placaCaminhao: string;
  nomeOficina: string;
}

export interface ManutencaoParcelaModel {
  id: number;
  manutencaoId: number;
  numero: number;
  valor: number;
  dataVencimento: string;
  pago: boolean;
}
