import { CaminhaoModel } from './caminhao.model';
import { MotoristaModel } from './motorista.model';

export interface FreteModel {
  id?: number;
  descricao?: string;
  valor: number;
  data: string;
  caminhaoId: number;
  motoristaId: number;
  porcentagemMotorista: number;
  nomeMotorista?: string;
  placa?:string
}
