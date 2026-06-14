/** 分 → 元（显示用） */
export function formatPrice(fen: number | null | undefined): string {
  if (fen == null) return '0.00'
  return (fen / 100).toFixed(2)
}

/** 元 → 分（提交用） */
export function yuanToFen(yuan: number): number {
  return Math.round(yuan * 100)
}
