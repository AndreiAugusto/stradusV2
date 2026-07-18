export interface AbastecimentoModel {
  id?: number;
  litros?: number;
  custoTotal: number;
  data: string;
  caminhaoId: number;
  quilometragem?: number;
  placa?: string;
}
