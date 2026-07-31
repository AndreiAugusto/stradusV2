export interface FreteModel {
  id?: number;
  descricao?: string;
  valor: number;
  data: string;
  caminhaoId: number;
  motoristaId: number;
  porcentagemMotorista: number;
  origemId?: number;
  destinoId?: number;
  cargaId?: number;
  fazendaId?: number;
  /** Nomes retornados pelo GET (mesmo id de origemId/destinoId/cargaId, nome diferente por causa do "f.*" no backend) */
  origem?: number;
  destino?: number;
  carga?: number;
  nomeMotorista?: string;
  placa?: string;
  modeloCaminhao?: string;
  nomeOrigem?: string;
  nomeDestino?: string;
  nomeCarga?: string;
  nomeFazenda?: string;
}
