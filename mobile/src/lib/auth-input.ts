export function normalizePhoneNumber(input: string) {
  const compact = input.replace(/[\s()-]/g, "");
  if (/^1\d{10}$/.test(compact)) return `+86${compact}`;
  if (/^\+[1-9]\d{7,14}$/.test(compact)) return compact;
  throw new Error("请输入有效手机号");
}
