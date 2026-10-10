export interface SalarioMotorista {
  motoristaId: number;
  nomeMotorista: string;
  totalFretes: number;
  totalFretesBruto: number;
  totalReceber: number;
  /** Parcelas de adiantamentos descontadas do salário deste mês. */
  totalAdiantamentos: number;
  saldoPagar: number;
  /** Adiantamentos entregues neste mês (descontados em salários futuros ou neste). */
  adiantadoNoMes: number;
  /** saldoPagar + adiantadoNoMes: tudo que vai para o motorista referente a este mês. */
  totalMes: number;
}
