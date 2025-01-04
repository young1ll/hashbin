export function isBcrypt(data: string | Buffer): boolean {
  // https://www.npmjs.com/package/bcrypt#hash-info
  const bcryptHashPattern = /^[$]2[abxy]?[$](?:0[4-9]|[12][0-9]|3[01])[$][./0-9a-zA-Z]{53}$/;
  return bcryptHashPattern.test(data.toString());
}
