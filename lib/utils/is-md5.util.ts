export function isMD5(data: string | Buffer): boolean {
  const md5HashPattern = /^[a-fA-F0-9]{32}$/;
  return md5HashPattern.test(data.toString());
}
