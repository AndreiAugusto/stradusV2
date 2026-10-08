export interface PerfilModel {
  id: number;
  nome: string;
  email: string;
}

export interface AtualizarPerfilModel {
  nome?: string;
  email?: string;
  novaSenha?: string;
  senhaAtual: string;
}
