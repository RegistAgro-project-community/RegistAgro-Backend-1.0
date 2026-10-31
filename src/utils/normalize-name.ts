/** Pure normalization shared by business models after Zod has validated input. */
export function normalizeName(value: string): string {
  return value.trim().split(/\s+/u).map(part => part[0]!.toLocaleUpperCase("pt-AO") + part.slice(1).toLocaleLowerCase("pt-AO")).join(" ");
}
