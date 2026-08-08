/** Primeiro e último dia do mês corrente, no fuso local, como 'YYYY-MM-DD' (formato de <input type="date">). */
export function intervaloMesAtual(): { dataInicio: string; dataFim: string } {
  const hoje = new Date();
  const primeiro = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const ultimo = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  return { dataInicio: formatarDataISO(primeiro), dataFim: formatarDataISO(ultimo) };
}

function formatarDataISO(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}
