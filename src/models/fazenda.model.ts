export interface FazendaModel {
  id?: number;
  nome: string;
  /** usado ao criar/atualizar (nome do campo no DTO do backend) */
  cidadeId?: number | null;
  /** como vem no GET (nome real da coluna, snake_case) */
  cidade_id?: number | null;
  nomeCidade?: string;
  siglaEstado?: string;
  totalContatos?: number;
}

export interface FazendaContatoModel {
  id: number;
  fazendaId: number;
  contato: string;
}
