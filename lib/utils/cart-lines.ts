import type { CartItem, Product } from "@/lib/types";

export type CartLine = {
  productId: string;
  product: Product;
  quantity: number;
  lineTotal: number;
};

export function getCartLines(items: CartItem[], products: Product[]): CartLine[] {
  return items.reduce<CartLine[]>((lines, item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) return lines;
    lines.push({
      productId: item.productId,
      product,
      quantity: item.quantity,
      lineTotal: product.price * item.quantity,
    });
    return lines;
  }, []);
}

export function getCartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotal, 0);
}
