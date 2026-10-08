export interface NotaModel {
  id: number;
  freteId?: number | null;
  manutencaoId?: number | null;
  nomeArquivo: string;
  mimeType?: string;
  tamanho?: number;
  criadoEm?: string;
}

export type VinculoNota = { freteId: number } | { manutencaoId: number };
