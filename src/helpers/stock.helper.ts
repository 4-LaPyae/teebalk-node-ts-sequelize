export const isQuantityStockUnlimited = (inStock?: number | null): boolean => {
  return inStock === undefined || inStock === null;
};
