const CODE_PREFIX = "VXH";
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // bỏ ký tự dễ nhầm (0/O, 1/I)

/** Mã đơn dùng làm nội dung chuyển khoản, VD: VXH7K2M9QP */
export function generateOrderCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(7));
  return CODE_PREFIX + Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/** Tìm mã đơn trong nội dung chuyển khoản (ngân hàng có thể chèn thêm ký tự, viết thường...). */
export function extractOrderCode(content: string) {
  const match = content.toUpperCase().match(new RegExp(`${CODE_PREFIX}[${ALPHABET}]{7}`));
  return match?.[0] ?? null;
}

export function vietQrUrl(amount: number, content: string) {
  const bank = process.env.NEXT_PUBLIC_BANK_ID ?? "";
  const acc = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO ?? "";
  const name = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ?? "";
  const params = new URLSearchParams({ amount: String(amount), addInfo: content, accountName: name });
  return `https://img.vietqr.io/image/${bank}-${acc}-compact2.png?${params}`;
}

export const bankInfo = () => ({
  bank: process.env.NEXT_PUBLIC_BANK_ID ?? "",
  accountNo: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO ?? "",
  accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ?? "",
});
