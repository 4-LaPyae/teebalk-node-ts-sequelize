import { InstoreOrderDbModel, InstoreOrderDetailDbModel, InstoreOrderGroupDbModel } from "../../../src/database";

export const clearTestInstoreOrders = async (userId: number, productIds: number[]) => {
  await Promise.all([
    InstoreOrderDetailDbModel.destroy({
      where: { productId: productIds },
      force: true
    }),
    InstoreOrderDbModel.destroy({
      where: { sellerId: userId },
      force: true
    })
  ]);
  
  await InstoreOrderGroupDbModel.destroy({
    where: { sellerId: userId },
    force: true
  });
}
