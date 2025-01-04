export function isSHA1(data: string | Buffer): boolean {
  const sha1HashPattern = /^[A-Fa-f0-9]{40}$/;
  return sha1HashPattern.test(data.toString());
}

export function isSHA256(data: string | Buffer): boolean {
  const sha256HashPattern = /^[A-Fa-f0-9]{64}$/;
  return sha256HashPattern.test(data.toString());
}
