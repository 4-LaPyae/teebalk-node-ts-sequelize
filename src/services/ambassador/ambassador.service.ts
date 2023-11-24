import { DEFAULT_LIMIT, LogMethodFail } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';

import { DEFAULT_PAGE_NUMBER, LanguageEnum } from '../../constants';
import { IAmbassadorsListSearch, ISearchQuery } from '../../controllers/ambassador/interfaces';
import {
  IAmbassadorContentRepository,
  IAmbassadorHighlightPointRepository,
  IAmbassadorImageRepository,
  IAmbassadorRepository,
  IExtendedAmbassador,
  IExtendedGiftSetProduct,
  IHighlightPointRepository
} from '../../dal';
import { getPaginationMetaData, IPaginationInfoParams, selectWithLanguage } from '../../helpers';
import { IUser } from '../auth';
import { UserService } from '../user';

const log = new Logger('SRV:AmbassadorService');

export interface AmbassadorServiceOptions {
  ambassadorRepository: IAmbassadorRepository;
  ambassadorContentRepository: IAmbassadorContentRepository;
  ambassadorImageRepository: IAmbassadorImageRepository;
  ambassadorHighlightPointRepository: IAmbassadorHighlightPointRepository;
  highlightPointRepository: IHighlightPointRepository;
  userService: UserService;
}

export class AmbassadorService {
  private services: AmbassadorServiceOptions;

  constructor(services: AmbassadorServiceOptions) {
    this.services = services;
  }

  @LogMethodFail(log)
  async getAmbassadorDetail(code: string, language?: LanguageEnum): Promise<IExtendedAmbassador> {
    const ambassador = await this.services.ambassadorRepository.getOneDetail({ code });

    const content = selectWithLanguage(ambassador?.contents, language, false);
    const image = selectWithLanguage(ambassador?.images, language, false);

    const user = ambassador?.userId
      ? await this.services.userService.getCombinedOne(ambassador.userId, ['name', 'photo', 'profession', 'socialLinks'])
      : null;

    const ambassadorUser = {
      name: user?.name || content?.name,
      profession: user?.profession || content?.profession,
      photo: user?.photo || ambassador.imagePath,
      socialLinks: user?.socialLinks || ambassador.socialLinks
    } as Partial<IUser>;

    const giftSets = ambassador.giftSets?.map(giftSet => {
      const giftSetContent = selectWithLanguage(giftSet.contents, language, false);
      const giftSetProducts = this.mappingGiftSetProducts(giftSet.giftSetProducts, language);

      const giftSetResult = {
        ...giftSet,
        giftSetProducts,
        content: giftSetContent
      };

      delete giftSetResult.contents;

      return giftSetResult;
    });

    const result = {
      ...ambassador,
      giftSets,
      user: ambassadorUser,
      content,
      image
    };

    delete result.contents;
    delete result.images;

    return result;
  }

  async searchAmbassador(searchQuery: ISearchQuery): Promise<IAmbassadorsListSearch> {
    let ambassadors = await this.services.ambassadorRepository.getAmbassadors(searchQuery);
    let ambassadorIds = ambassadors.rows.map((data: IExtendedAmbassador) => data.id.toString());
    let ambassadorList = await this.services.ambassadorRepository.getAmbassadorData(searchQuery, ambassadorIds);
    const dist = ambassadorList.rows.filter(data => data.id);
    ambassadorList.rows = dist;
    const { limit = DEFAULT_LIMIT } = searchQuery;
    let { pageNumber = DEFAULT_PAGE_NUMBER } = searchQuery;
    let { count } = ambassadorList;

    while (ambassadorList.rows.length === 0 && count > 0) {
      pageNumber = Math.ceil(count / limit);
      const newSearchQuery = {
        ...searchQuery,
        pageNumber
      };

      ambassadors = await this.services.ambassadorRepository.getAmbassadors(newSearchQuery);
      ambassadorIds = ambassadors.rows.map((data: IExtendedAmbassador) => data.id.toString());
      ambassadorList = await this.services.ambassadorRepository.getAmbassadorData(searchQuery, ambassadorIds);
      const dist = ambassadorList.rows.filter(data => data.id);
      ambassadorList.rows = dist;
      count = ambassadorList.count;
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
      rows: await this.mappingAmbassadorResponse(ambassadorList.rows, searchQuery.language)
    };
  }

  private async mappingAmbassadorResponse(ambassadors: IExtendedAmbassador[], language?: LanguageEnum): Promise<IExtendedAmbassador[]> {
    const ambassadorCombinedUsers = await this.services.userService.getCombinedList(
      ambassadors.filter(ambassador => ambassador.userId).map(ambassador => ambassador.userId as number),
      ['name', 'photo', 'profession', 'socialLinks']
    );

    const result = Promise.all(
      ambassadors.map(async item => {
        const user = item.userId ? ambassadorCombinedUsers.get(item.userId) : null;
        const ambassador = await this.mappingAmbassador(item, user, language);
        return ambassador;
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
    ambassador: IExtendedAmbassador,
    combinedUser?: IUser | null,
    language?: LanguageEnum
  ): Promise<IExtendedAmbassador> {
    const user =
      !combinedUser && ambassador.userId
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
    };

    if (result.contents) {
      delete result.contents;
    }
    if (result.images) {
      delete result.images;
    }

    return result;
  }
}
