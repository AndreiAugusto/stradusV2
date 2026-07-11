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
}
