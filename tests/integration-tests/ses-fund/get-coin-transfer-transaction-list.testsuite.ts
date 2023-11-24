import {
  CoinTransferTransactionTypeEnum,
  CoinTransferTransactionDbModel
} from "../../../src/database";

const request = require('supertest');
const app = require('../index');

export const testGetAllCoinTransferTransaction = () => {
  describe('test get all coin transfer transaction', () => {
    let transferTransaction: any;
    const insertData = {
       userId: 2,
       type: CoinTransferTransactionTypeEnum.EGF,
       amount: 1000,
       metadata: "test",
       paymentServiceTxs: {}
    };

    beforeAll(async () => {
      transferTransaction = await CoinTransferTransactionDbModel.create(insertData) as any;

    });

    afterAll(async () => {

      await CoinTransferTransactionDbModel.destroy({
        where: { id: transferTransaction.id },
        force: true
      });
    });

    // describe('Get coin transfer transactions success', () => {
    //   it('should return status code 200 OK Request', async () => {
    //     const res = await request(app)
    //       .get(`/api/v1/wallet/ses-fund/transactions/incoming?limit=9&&pageNumber=1`)
    //     expect(res.statusCode).toEqual(200);
    //     expect(res.body.data).not.toBeUndefined();
    //   });
    // });

    describe('Get coin transfer transactions error', () => {
      it('should get return error 400 limit bigger 100', async () => {
        const res = await request(app)
          .get(`/api/v1/wallet/ses-fund/transactions/incoming?limit= 120`)
        expect(res.statusCode).toEqual(400);
      });
  
      it('should get return error 400 pageNumber is 0', async () => {
        const res = await request(app)
          .get(`/api/v1/wallet/ses-fund/transactions/incoming?pageNumber=0`)
        expect(res.statusCode).toEqual(400);
      });
    });
  });
}
