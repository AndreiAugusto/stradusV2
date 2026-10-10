export interface ExtratoItem {
  tipo: 'frete' | 'abastecimento' | 'manutencao' | 'custo-fixo' | 'salario-motorista' | 'adiantamento' | 'desconto-adiantamento';
  data: string;
  placa: string | null;
  motorista: string | null;
  empresa: string | null;
  historico: string;
  despesas: number | null;
  receitas: number | null;
  /**
   * Salário: quanto de adiantamento foi abatido dele. Desconto de adiantamento:
   * valor da parcela (só informativo — já está abatido no salário, não soma nos totais).
   */
  descontoAdiantamento: number | null;
}

export interface ExtratoFiltro {
  dataInicio?: string;
  dataFim?: string;
  tipos?: string[];
  caminhaoId?: number;
  motoristaId?: number;
}
