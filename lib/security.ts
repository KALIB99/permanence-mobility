export async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function validPortalPin(value: string): boolean {
  return /^\d{6}$/.test(value);
}

export function validPassword(value: string): boolean {
  return value.length >= 10 && value.length <= 128;
}

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(password: string, salt = crypto.getRandomValues(new Uint8Array(16))): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 120_000 }, key, 256);
  return `${hex(salt)}:${hex(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, expected] = stored.split(":");
  if (!saltHex || !expected) return false;
  const salt = new Uint8Array(saltHex.match(/.{2}/g)?.map((pair) => Number.parseInt(pair, 16)) ?? []);
  const actual = (await hashPassword(password, salt)).split(":")[1];
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) difference |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  return difference === 0;
}
