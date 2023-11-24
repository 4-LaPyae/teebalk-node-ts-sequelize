import { LogMethodFail } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';

import { DEFAULT_LIMIT, DEFAULT_PAGE_NUMBER, LanguageEnum } from '../../constants';
import { IGiftSetPaginationOptions, IGiftSetsListSearch, ISearchQuery } from '../../controllers/gift/interfaces';
import {
  IExtendedAmbassador,
  IExtendedGiftSet,
  IExtendedGiftSetProduct,
  IGiftSetContentRepository,
  IGiftSetProductRepository,
  IGiftSetRepository,
  ITopGiftSetDao,
  ITopGiftSetRepository
} from '../../dal';
import { GiftSetStatusEnum } from '../../database';
import { getPaginationMetaData, IPaginationInfoParams, selectWithLanguage } from '../../helpers';
import { IUser } from '../auth';
import { UserService } from '../user';

const log = new Logger('SRV:GiftSetService');

export interface GiftSetServiceOptions {
  giftSetRepository: IGiftSetRepository;
  userService: UserService;
  giftSetContentRepository: IGiftSetContentRepository;
  giftSetProductRepository: IGiftSetProductRepository;
  topGiftSetRepository: ITopGiftSetRepository;
}

export class GiftSetService {
  private services: GiftSetServiceOptions;

  constructor(services: GiftSetServiceOptions) {
    this.services = services;
  }

  @LogMethodFail(log)
  getPublishedGiftSetProductsById(id: number): Promise<IExtendedGiftSet> {
    return this.services.giftSetRepository.getOneGiftSetProducts({ id, status: GiftSetStatusEnum.PUBLISHED });
  }

  @LogMethodFail(log)
  async getPublishedGiftSetDetail(code: string, language?: LanguageEnum): Promise<IExtendedGiftSet> {
    const giftSet = await this.services.giftSetRepository.getOneDetail({ code, status: GiftSetStatusEnum.PUBLISHED });
    const giftSetContent = selectWithLanguage(giftSet?.contents, language, false);
    const giftSetProducts = this.mappingGiftSetProducts(giftSet?.giftSetProducts, language);
    const ambassador = await this.mappingAmbassador(giftSet?.ambassador, null, language);

    const result: IExtendedGiftSet = {
      ...giftSet,
      giftSetProducts,
      content: giftSetContent,
      ambassador
    };

    delete result.contents;

    return result;
  }

  @LogMethodFail(log)
  async getPublishedGiftSetDescription(code: string, language?: LanguageEnum): Promise<string | null> {
    const giftSet = await this.services.giftSetRepository.getOneDescription({ code, status: GiftSetStatusEnum.PUBLISHED });
    const giftSetContent = selectWithLanguage(giftSet?.contents, language, false);

    return giftSetContent.description;
  }

  async getPublishedGiftSetAmbassadorAudioPathAfterPayment(code: string, language?: LanguageEnum): Promise<IExtendedGiftSet> {
    const giftSet = await this.services.giftSetRepository.getOneAmbassadorAudioPathAfterPayment({
      code,
      status: GiftSetStatusEnum.PUBLISHED
    });
    const ambassador = await this.mappingAmbassador(giftSet?.ambassador, null, language);

    const result: IExtendedGiftSet = {
      ...giftSet,
      ambassador
    };

    return result;
  }

  @LogMethodFail(log)
  async searchGiftSet(searchQuery: ISearchQuery): Promise<IGiftSetsListSearch> {
    let giftSets = await this.services.giftSetRepository.getGiftSets(searchQuery);
    let giftSetIds = giftSets.rows.map((data: IExtendedGiftSet) => data.id.toString());

    let giftSetsList = await this.services.giftSetRepository.getGiftSetsData(searchQuery, giftSetIds);
    const { limit = DEFAULT_LIMIT } = searchQuery;
    let { pageNumber = DEFAULT_PAGE_NUMBER } = searchQuery;
    let { count } = giftSetsList;

    while (giftSetsList.rows.length === 0 && count > 0) {
      pageNumber = Math.ceil(count / limit);
      const newSearchQuery = {
        ...searchQuery,
        pageNumber
      };
      giftSets = await this.services.giftSetRepository.getGiftSets(newSearchQuery);
      giftSetIds = giftSets.rows.map((data: IExtendedGiftSet) => data.id.toString());
      giftSetsList = await this.services.giftSetRepository.getGiftSetsData(searchQuery, giftSetIds);
      count = giftSetsList.count;
    }

    const paginationInfoParams: IPaginationInfoParams = {
      limit,
      pageNumber,
      count
    };

    const metadata = getPaginationMetaData(paginationInfoParams);

    return {
      count,
      metadata,
      rows: await this.mappingGiftSetResponse(giftSetsList.rows, searchQuery.language)
    };
  }

  async getTopList(options: IGiftSetPaginationOptions): Promise<ITopGiftSetDao[]> {
    const { language } = options || {};

    const topGiftSets = await this.services.topGiftSetRepository.getTopList();

    const ambassadorCombinedUsers = await this.services.userService.getCombinedList(
      topGiftSets.filter(item => item.giftSet?.ambassador?.userId).map(item => item.giftSet?.ambassador?.userId as number),
      ['name', 'photo', 'profession', 'socialLinks']
    );

    const result = await Promise.all(
      topGiftSets.map(async item => {
        const giftSet = item.giftSet;
        const content = selectWithLanguage(giftSet?.contents, language, false);
        const giftSetProducts = this.mappingGiftSetProducts(giftSet?.giftSetProducts, language);
        const user = giftSet?.ambassador?.userId ? ambassadorCombinedUsers.get(giftSet.ambassador.userId) : null;
        const ambassador = await this.mappingAmbassador(giftSet?.ambassador, user, language);

        const itemResult = {
          ...item,
          giftSet: {
            ...giftSet,
            content,
            giftSetProducts,
            ambassador
          }
        } as ITopGiftSetDao;

        if (itemResult.giftSet?.contents) {
          delete itemResult.giftSet.contents;
        }

        return itemResult;
      })
    );

    return result;
  }

  private async mappingGiftSetResponse(giftsets: IExtendedGiftSet[], language?: LanguageEnum): Promise<IExtendedGiftSet[]> {
    const ambassadorCombinedUsers = await this.services.userService.getCombinedList(
      giftsets.filter(giftset => giftset.ambassador?.userId).map(giftset => giftset.ambassador?.userId as number),
      ['name', 'photo', 'profession', 'socialLinks']
    );

    const result = await Promise.all(
      giftsets.map(async item => {
        const content = selectWithLanguage(item.contents, language, false);
        const giftSetProducts = this.mappingGiftSetProducts(item.giftSetProducts, language);
        const user = item.ambassador?.userId ? ambassadorCombinedUsers.get(item.ambassador.userId) : null;
        const ambassador = await this.mappingAmbassador(item.ambassador, user, language);

        const itemResult = {
          ...item,
          content,
          giftSetProducts,
          ambassador
        };

        if (itemResult.contents) {
          delete itemResult.contents;
        }

        return itemResult;
      })
    );

    return result;
  }

  private mappingGiftSetProducts(
    giftSetProducts?: Partial<IExtendedGiftSetProduct>[],
    language?: LanguageEnum
  ): IExtendedGiftSetProduct[] | undefined {
    return giftSetProducts?.map(giftSetProduct => {
      const giftSetProductContent = selectWithLanguage(giftSetProduct?.contents, language, false);
      const productContent = selectWithLanguage(giftSetProduct?.product?.contents, language, false);
      const productImage = selectWithLanguage(giftSetProduct?.product?.images, language, false);
      const shopContent = selectWithLanguage(giftSetProduct?.product?.shop?.contents, language, false);

      const giftSetProductResult = {
        ...giftSetProduct,
        content: giftSetProductContent,
        product: {
          ...giftSetProduct?.product,
          content: productContent,
          image: productImage,
          shop: {
            ...giftSetProduct?.product?.shop,
            content: shopContent
          }
        }
      } as IExtendedGiftSetProduct;

      delete giftSetProductResult.contents;
      if (giftSetProductResult.product?.contents) {
        delete giftSetProductResult.product.contents;
      }
      if (giftSetProductResult.product?.images) {
        delete giftSetProductResult.product.images;
      }
      if (giftSetProductResult.product?.shop?.contents) {
        delete giftSetProductResult.product.shop.contents;
      }

      return giftSetProductResult;
    });
  }

  private async mappingAmbassador(
    ambassador?: Partial<IExtendedAmbassador>,
    combinedUser?: IUser | null,
    language?: LanguageEnum
  ): Promise<Partial<IExtendedAmbassador> | undefined> {
    const user =
      !combinedUser && ambassador?.userId
        ? await this.services.userService.getCombinedOne(ambassador.userId, ['name', 'photo', 'profession', 'socialLinks'])
        : combinedUser;
    const ambassadorContent = selectWithLanguage(ambassador?.contents, language, false);
    const ambassadorImage = selectWithLanguage(ambassador?.images, language, false);
    const ambassadorUser = {
      name: user?.name || ambassadorContent?.name,
      profession: user?.profession || ambassadorContent?.profession,
      photo: user?.photo || ambassador?.imagePath,
      socialLinks: user?.socialLinks || ambassador?.socialLinks
    } as Partial<IUser>;

    const result = {
      ...ambassador,
      user: ambassadorUser,
      content: ambassadorContent,
      image: ambassadorImage
    } as IExtendedAmbassador;

    if (result.contents) {
      delete result.contents;
    }
    if (result.images) {
      delete result.images;
    }

    return result;
  }
}
