// eslint-disable-next-line @typescript-eslint/no-redeclare
// interface BigInt {
//   toJSON: () => string;
// }
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
}

// JSON.stringify(
//   this,
//   (key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
// )

// https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields#serializing-bigint
// https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-1006088574
// https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields#working-with-bigint
// https://github.com/prisma/studio/issues/614
// https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-953187833
// https://stackoverflow.com/questions/65152373/typescript-serialize-bigint-in-json