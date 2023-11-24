import { IPaginationMetadata } from '../controllers/product/interfaces';

export interface IPaginationInfoParams {
  limit: number;
  pageNumber: number;
  count: number;
}
export const getPaginationMetaData = (params: IPaginationInfoParams): IPaginationMetadata => {
  const { limit, pageNumber, count } = params;
  return {
    limit: +limit,
    pageNumber: count !== 0 ? +pageNumber : 1,
    total: count,
    totalPages: Math.ceil(count / limit)
  };
};
