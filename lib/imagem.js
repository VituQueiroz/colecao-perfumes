// Reduz a imagem para no máximo `max` px e converte para WebP.
// Uma foto de 90 KB cai para ~20-30 KB, o que economiza espaço agora
// (localStorage) e depois (Supabase Storage).
export async function comprimirImagem(arquivo, max = 800, qualidade = 0.85) {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, max / Math.max(bitmap.width, bitmap.height));

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return canvas.toDataURL('image/webp', qualidade);
}
