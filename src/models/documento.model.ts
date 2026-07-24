export type TipoDocumento = 'empresa' | 'caminhao' | 'motorista' | 'fazenda';

export interface DocumentoModel {
  id?: number;
  titulo: string;
  categoria?: string;
  tipo: TipoDocumento;
  caminhaoId?: number | null;
  motoristaId?: number | null;
  fazendaId?: number | null;
  url?: string;
  nomeArquivo?: string;
  mimeType?: string;
  tamanho?: number;
  criadoEm?: string;
  placaCaminhao?: string;
  nomeMotorista?: string;
  nomeFazenda?: string;
}
