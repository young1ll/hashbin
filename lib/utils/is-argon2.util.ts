// https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md
export function isArgon2(data: string | Buffer): boolean {
  const argon2HashPattern =
    /^\$argon2id\$v=(?:16|19)\$m=\d{1,10},t=\d{1,10},p=\d{1,3}(?:,keyid=[A-Za-z0-9+/]{0,11}(?:,data=[A-Za-z0-9+/]{0,43})?)?\$[A-Za-z0-9+/]{11,64}\$[A-Za-z0-9+/]{16,86}$/i;
  return argon2HashPattern.test(data.toString());
}
