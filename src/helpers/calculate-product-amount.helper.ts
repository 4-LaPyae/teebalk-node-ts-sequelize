export interface ICalculateProductAmount {
  cashbackCoin: number;
  priceWithTax: number;
  totalPrice: number;
  totalPriceWithTax: number;
  totalCashbackCoin: number;
  shippingFeeWithTax: number;
  amount: number;
}

export interface ICalculateProductTransparencyLevel {
  ethicalityLevel: number;
  transparencyLevel: number;
}

export interface ICalculateProductAmountParam {
  productPrice: number;
  quantity: number;
  taxPercents: number;
  shippingFeeWithTax?: number;
  coinRewardPercents: number;
}

export interface ICalculateExperienceTransparencyLevel {
  ethicalityLevel: number;
  transparencyLevel: number;
}

export const calculateProductAmount = (calculateProductAmountParam: ICalculateProductAmountParam): ICalculateProductAmount => {
  const { productPrice, taxPercents = 0, quantity, shippingFeeWithTax = 0, coinRewardPercents = 0 } = calculateProductAmountParam;
  const priceWithTax = Math.round(productPrice + (productPrice * taxPercents) / 100);

  const totalPrice = productPrice * quantity;
  const totalPriceWithTax = priceWithTax * quantity;

  const cashbackCoin = Math.floor((priceWithTax * coinRewardPercents) / 100);
  const totalCashbackCoin = Math.floor((totalPriceWithTax * coinRewardPercents) / 100);

  return {
    priceWithTax,
    totalPrice,
    totalPriceWithTax,
    shippingFeeWithTax,
    totalCashbackCoin,
    cashbackCoin,
    amount: totalPriceWithTax + shippingFeeWithTax
  };
};
