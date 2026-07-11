export interface ExtratoItem {
  tipo: 'frete' | 'abastecimento' | 'manutencao' | 'custo-fixo';
  data: string;
  placa: string | null;
  motorista: string | null;
  empresa: string | null;
  historico: string;
  despesas: number | null;
  receitas: number | null;
}

export interface ExtratoFiltro {
  dataInicio?: string;
  dataFim?: string;
  tipos?: string[];
  caminhaoId?: number;
  motoristaId?: number;
}
