const LADO_MAXIMO = 2000;
const TAMANHO_PARA_COMPRIMIR = 1.5 * 1024 * 1024;

/**
 * Fotos de celular costumam ter 3–8MB. Reduz para no máximo 2000px no
 * maior lado (JPEG 85%), o que mantém a nota legível e fica bem abaixo do
 * limite de 10MB. Se o navegador não conseguir ler a imagem (ex.: HEIC no
 * Chrome), devolve o arquivo original.
 */
export async function comprimirImagem(arquivo: File): Promise<File> {
  if (!arquivo.type.startsWith('image/') || arquivo.type === 'image/gif' || arquivo.type === 'image/svg+xml') {
    return arquivo;
  }
  if (arquivo.size < TAMANHO_PARA_COMPRIMIR) return arquivo;

  try {
    const bitmap = await createImageBitmap(arquivo);
    const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    if (!blob || blob.size >= arquivo.size) return arquivo;

    const nome = arquivo.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], nome, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return arquivo;
  }
}
