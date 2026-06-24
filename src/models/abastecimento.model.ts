import { CaminhaoModel } from './caminhao.model';

export interface AbastecimentoModel {
  id?: number;
  litros: number;
  custoTotal: number;
  data: string;
  caminhaoId: number;
  placa?: string;
}
