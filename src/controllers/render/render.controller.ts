import autobind from 'autobind-decorator';
import { Request, Response } from 'express';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as imageSizeOf from 'probe-image-size';

// import striptags from 'striptags';

import config from '../../config';
import { LanguageEnum, URL_REGEX } from '../../constants';
import { IExperienceDao, IExtendedAmbassador, IExtendedGiftSet, IProductDao } from '../../dal';
import { IExperienceContentModel, IProductContentModel, IProductImageModel } from '../../database';
import { selectWithLanguage } from '../../helpers';
import { IExtendedRequest } from '../../middlewares';
import { IExperienceSessionTicketReservationLinkDao } from '../../services';

@autobind
class RenderController {
  private readonly appTitle = 'tells market（テルズ マーケット） | 買い物をするだけで森が増えるエシカルマーケット';
  private readonly appDescription =
    `「売ること」よりも「伝えること」  エシカルには物語がある。` +
    `作り手の想い、材料や過程の透明性、地球との共存、命あふれる文化を大切に、未来に継承されるべき全ての品々を集めた市場。それが「tells market」です。` +
    `"後世に伝えるべきもの"をエシカルと定義。それは、環境や人にやさしい品物はもちろん、大切に受け継がれてきた伝統・文化も。`;

  async renderMoffLPInfo(req: IExtendedRequest, res: Response) {
    const imageUrl = this.getAssetsTellsSEOImageUrl('moff_2022.png');
    const imageDimensions = await this.getImageDimensions(imageUrl);
    const faviconUrl = this.getTellsFaviconUrl(req);
    const title = '【MoFF2022】五感で感じよう100年先へ想い伝えるエシカル展';
    const description =
      '全国から100ブランド以上が集結するエシカルマーケット開催！豪華トークセッションやワークショップも必見。100年先まで残したいモノ・コトに出会い、体験しよう';
    const context = {
      url: this.getFullUrl(req),
      title,
      subtitle: title,
      description,
      metaTagDescription: description,
      image: imageUrl,
      imageHeight: imageDimensions.height,
      imageWidth: imageDimensions.width,
      faviconUrl
    };

    res.render('seo', context);
  }

  async renderExperienceTicketLinkInfo(req: IExtendedRequest, res: Response) {
    const reservationLink = req.state.reservationLink as IExperienceSessionTicketReservationLinkDao;
    const language = req.state.language || LanguageEnum.ENGLISH;
    if (!reservationLink || !reservationLink.available) {
      return this.renderGeneralInfo(req, res);
    }

    const orderDetail = reservationLink.ticketReservation.orderDetail;
    const experience = orderDetail.experience;
    // const session = orderDetail.session;
    // const sessionTicket = orderDetail.ticket;
    const experienceContent: any = selectWithLanguage(orderDetail.experience.contents, language, false);

    let image = null;
    let imageDimensions;

    if (experience.images && experience.images?.length > 0) {
      const experienceImage = experience.images[0];
      image = URL_REGEX.test(experienceImage.imagePath)
        ? experienceImage.imagePath
        : this.getRequestOrigin(req) + experienceImage.imagePath;

      imageDimensions = await this.getImageDimensions(image);
    }

    const faviconUrl = this.getTellsFaviconUrl(req);
    // const experienceDescription = experienceContent.plainTextDescription?.substring(0, 200);

    let context;
    if (experience.nameId === 'moff_2022') {
      const description =
        '9月9日(金)に渋谷のTRUNK HOTELにて開催される特別イベント【MoFF2022】' +
        '「100年先まで想い伝えるエシカル展」全国から100ブランド、500を超えるこだわりの品々が集結！豪華ゲストによるトークセッションも必見！';
      context = {
        url: this.getFullUrl(req),
        title: '招待チケットが届きました！| MoFF2022',
        description,
        metaTagDescription: description,
        image,
        imageHeight: imageDimensions?.height,
        imageWidth: imageDimensions?.width,
        faviconUrl
      };
    } else {
      context = {
        url: this.getFullUrl(req),
        title: '招待チケットが届きました！',
        description: experienceContent.title,
        metaTagDescription: experienceContent.title,
        image,
        imageHeight: imageDimensions?.height,
        imageWidth: imageDimensions?.width,
        faviconUrl
      };
    }

    res.render('seo', context);
  }

  async renderProductInfo(req: IExtendedRequest, res: Response) {
    const product = req.state.product as IProductDao;
    const language = req.state.language as LanguageEnum;
    if (!product?.contents) {
      return this.renderGeneralInfo(req, res);
    }

    const productContent: IProductContentModel = selectWithLanguage(product.contents, language, false);
    const productImage: IProductImageModel = selectWithLanguage(product.images, language, true)[0];
    const image = URL_REGEX.test(productImage.imagePath) ? productImage.imagePath : this.getRequestOrigin(req) + productImage.imagePath;
    const imageDimensions = await this.getImageDimensions(image);
    const faviconUrl = this.getTellsFaviconUrl(req);

    const context = {
      url: this.getFullUrl(req),
      title: productContent.title,
      subtitle: productContent.subTitle?.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, ''),
      description: productContent.description?.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, ''),
      metaTagDescription: productContent.description?.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, ''),
      image,
      imageHeight: imageDimensions.height,
      imageWidth: imageDimensions.width,
      faviconUrl
    };

    res.render('seo', context);
  }

  async renderExperienceInfo(req: IExtendedRequest, res: Response) {
    const experience = req.state.experience as IExperienceDao;
    const language = req.state.language || LanguageEnum.ENGLISH;
    if (!experience || !experience?.contents) {
      return this.renderGeneralInfo(req, res);
    }

    const experienceContent: IExperienceContentModel = selectWithLanguage(experience.contents, language, false);
    let image = null;
    let imageDimensions;

    if (experience.images && experience.images?.length > 0) {
      const experienceImage = experience.images[0];
      image = URL_REGEX.test(experienceImage.imagePath)
        ? experienceImage.imagePath
        : this.getRequestOrigin(req) + experienceImage.imagePath;

      imageDimensions = await this.getImageDimensions(image);
    }

    const faviconUrl = this.getTellsFaviconUrl(req);
    const experienceDescription = experienceContent.plainTextDescription?.substring(0, 200);

    const context = {
      url: this.getFullUrl(req),
      title: experienceContent.title,
      description: experienceDescription,
      metaTagDescription: experienceDescription,
      image,
      imageHeight: imageDimensions?.height,
      imageWidth: imageDimensions?.width,
      faviconUrl
    };

    res.render('seo', context);
  }

  async renderAmbassadorInfo(req: IExtendedRequest, res: Response) {
    const ambassadorDetail = req.state.ambassador as IExtendedAmbassador;
    if (!ambassadorDetail) {
      return this.renderGeneralInfo(req, res);
    }

    const ambassadorContent = ambassadorDetail.content;
    const ambassadorImage = ambassadorDetail.user?.photo || '';

    const image = this.isURL(ambassadorImage) ? ambassadorImage : this.getRequestOrigin(req) + ambassadorImage;
    const imageDimensions = await this.getImageDimensions(image);
    const title = ambassadorContent?.specializedFieldTitle || '';
    const description = ambassadorContent?.description?.substring(0, 200);

    const context = {
      url: this.getFullUrl(req),
      faviconUrl: this.getTellsFaviconUrl(req),
      title,
      description,
      metaTagDescription: description,
      image,
      imageHeight: imageDimensions?.height,
      imageWidth: imageDimensions?.width
    };

    res.render('seo', context);
  }

  async renderGiftSetInfo(req: IExtendedRequest, res: Response) {
    const giftSetDetail = req.state.giftSet as IExtendedGiftSet;
    if (!giftSetDetail) {
      return this.renderGeneralInfo(req, res);
    }

    const giftSetContent = giftSetDetail.content;
    const giftSetImage =
      giftSetDetail.giftSetProducts && giftSetDetail.giftSetProducts.length && giftSetDetail.giftSetProducts[0].product?.image
        ? giftSetDetail.giftSetProducts[0].product.image.imagePath
        : '';

    const image = this.isURL(giftSetImage) ? giftSetImage : this.getRequestOrigin(req) + giftSetImage;
    const imageDimensions = await this.getImageDimensions(image);
    const title = giftSetContent?.title || '';
    const description = this.removeHtmlTag(giftSetContent?.description || '').substring(0, 200);

    const context = {
      url: this.getFullUrl(req),
      faviconUrl: this.getTellsFaviconUrl(req),
      title,
      description,
      metaTagDescription: description,
      image,
      imageHeight: imageDimensions?.height,
      imageWidth: imageDimensions?.width
    };

    res.render('seo', context);
  }

  async renderGeneralInfo(req: IExtendedRequest, res: Response) {
    const imageUrl = this.getAssetsTellsSEOImageUrl('general.png');
    const imageDimensions = await this.getImageDimensions(imageUrl);
    const faviconUrl = this.getTellsFaviconUrl(req);
    const context = {
      url: this.getFullUrl(req),
      title: this.appTitle,
      subtitle: this.appTitle,
      description: this.appDescription,
      metaTagDescription: this.appDescription,
      image: imageUrl,
      imageHeight: imageDimensions.height,
      imageWidth: imageDimensions.width,
      faviconUrl
    };

    res.render('seo', context);
  }

  private getFullUrl(req: Request): string {
    return this.getRequestOrigin(req) + req.originalUrl.replace(req.baseUrl, '').split('?')[0];
  }

  private getTellsFaviconUrl(req: Request): string {
    return this.getRequestOrigin(req) + '/favicon.png';
  }

  private getAssetsTellsSEOImageUrl(imageFileName: string): string {
    return `${config.get('assetsUrl')}/images/tells/seo/${imageFileName}`;
  }

  private getRequestOrigin(req: Request): string {
    return 'https://' + req.get('host');
  }

  private async getImageDimensions(url: string): Promise<{ width: number; height: number }> {
    try {
      const dimensions = await imageSizeOf(url);

      return { width: dimensions.width, height: dimensions.height };
    } catch (e) {
      return { width: 0, height: 0 };
    }
  }

  private isURL(path: string): boolean {
    return URL_REGEX.test(path);
  }

  private removeHtmlTag(text: string): string {
    return text.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');
  }
}

export const renderController = new RenderController();
