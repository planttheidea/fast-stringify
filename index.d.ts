type StandardReplacer = (key: string, value: any) => any;
type CircularReplacer = (key: string, value: any, referenceKey: string) => any;

export default function stringify(
  object: any,
  replacer?: StandardReplacer,
  indent?: number,
  circularReplacer?: CircularReplacer,
): string;
