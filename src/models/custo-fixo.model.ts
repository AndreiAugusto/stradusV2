export interface CustoFixoModel {
  id?: number;
  descricao: string;
  categoria?: string;
  valor: number;
  caminhaoId?: number | null;
  diaVencimento: number;
  dataInicio: string;
  dataFim?: string | null;
  placaCaminhao?: string;
  totalAjustes?: number;
}

export interface CustoFixoAjusteModel {
  id: number;
  custoFixoId: number;
  ano: number;
  mes: number;
  valor: number;
}
