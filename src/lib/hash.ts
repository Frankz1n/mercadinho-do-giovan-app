/** Hash local simples (não substitui bcrypt em produção). */
export async function hashSecret(value: string): Promise<string> {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `local_${(hash >>> 0).toString(16)}`;
}
