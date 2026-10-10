export interface ParcelaAdiantamento {
  numero: number;
  mes: number;
  ano: number;
  valor: number;
}

export interface AdiantamentoModel {
  id?: number;
  motoristaId: number;
  valor: number;
  data: string;
  observacao?: string | null;
  /** Envio: em quantos salários descontar e a partir de qual. */
  numeroParcelas?: number;
  mesInicio?: number;
  anoInicio?: number;
  /** Retorno da listagem. */
  nomeMotorista?: string;
  parcelas?: ParcelaAdiantamento[];
  totalNotas?: number;
}
