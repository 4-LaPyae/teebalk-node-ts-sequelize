import Logger from '@freewilltokyo/logger';
import pug from 'pug';
import puppeteer from 'puppeteer';

import config from '../../config';
import { LanguageEnum } from '../../constants';
import { ApiError } from '../../errors';

const log = new Logger('SRV:PDFService');

const PUPPETEER_EXECUTABLE_PATH = config.get('puppeteer').executablePath;

export interface IPDFContext {
  [key: string]: object | string | number | undefined;
}

export class PDFService {
  getPDF(template: string, context: IPDFContext, language?: LanguageEnum): Promise<Buffer> {
    const templateFileName = this.getPDFTemplateFileName(template, language);
    const headerHtml = this.getHeaderHtml();
    const footerHtml = this.getFooterHtml();
    return this.convertHTMLtoPDF(pug.renderFile(templateFileName, context), { headerHtml, footerHtml });
  }

  getPDFList(template: string, contexts: IPDFContext[], language?: LanguageEnum): Promise<Buffer[]> {
    const templateFileName = this.getPDFTemplateFileName(template, language);
    const headerHtml = this.getHeaderHtml();
    const footerHtml = this.getFooterHtml();
    return Promise.all(
      contexts.map(context => this.convertHTMLtoPDF(pug.renderFile(templateFileName, context), { headerHtml, footerHtml }))
    );
  }

  private async convertHTMLtoPDF(html: string, options: { headerHtml: string; footerHtml: string }): Promise<Buffer> {
    let pdf: Buffer;

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: PUPPETEER_EXECUTABLE_PATH,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      // await page.setCacheEnabled(false); // for debug
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      await page.emulateMediaType('screen');
      pdf = await page.pdf({
        format: 'A4',
        displayHeaderFooter: true,
        headerTemplate: options?.headerHtml,
        footerTemplate: options?.footerHtml,
        margin: {
          top: '70px',
          left: '70px',
          right: '70px',
          bottom: '70px'
        },
        printBackground: true
      });
    } catch (error) {
      log.error(error);
      throw ApiError.internal((error as any).message);
    } finally {
      await browser.close();
    }

    return pdf;
  }

  private getPDFTemplateFileName(template: string, language: LanguageEnum = LanguageEnum.JAPANESE): string {
    return `${__dirname}/../../views/${template}.pdf.${language}.pug`;
  }

  private getHeaderHtml() {
    return '<div></div>';
  }

  private getFooterHtml() {
    /* eslint-disable @typescript-eslint/tslint/config */
    return `
<div style="background-color: #000;">
<table style="border-collapse: collapse; width: 100%;">
<tr>
<td style="width: 50px; border: none;"></td>
<td style="width: 35px; border: none;">
<div style="width: 35px;">
<img
style="display: block; width: 30px; height: 20px;"
src="data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2OS4xNCAzMi43OCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiMyMTIxMjE7fTwvc3R5bGU+PC9kZWZzPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTMuNTIsMjIuNTVWMTEuNjZIMFY4SDMuNTJWMy41M2w0Ljc5LTFWOGg3LjE2djMuNjhIOC4zMVYyMmMwLDUsMS4zMSw2Ljc0LDUsNi43NGE0LDQsMCwwLDAsMi4wNi0uNDN2My45MWE5LjU5LDkuNTksMCwwLDEtMi43OC4zM0M2LjM2LDMyLjU1LDMuNTIsMzAsMy41MiwyMi41NVoiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0xMi44NCwyMC4xYzAtNy40Niw1LTEyLjU5LDEyLjI0LTEyLjU5LDcuNzEsMCwxMi4zNyw1LjY4LDExLjc4LDEzLjgySDE3LjU4Yy4xNyw0LjcsMy4wOSw3LjM3LDcuOCw3LjM3LDMuMzksMCw1LjU5LTEuMTUsNi43OC0zLjQ4bDQuMzYuNjhjLTIsNC40OS01Ljc2LDYuNzgtMTEuMjMsNi43OEMxNy43NSwzMi42OCwxMi44NCwyNy42OCwxMi44NCwyMC4xWm0xOS41Ny0yLjVjLS4zNC0zLjg2LTMtNi4zMi03LjI0LTYuMzItNC4wNywwLTYuOTEsMi4xMi03LjQ2LDYuMzJaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMzcuODguMWg0Ljc5VjMyLjIySDM3Ljg4WiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTU1Ljc2LDE3LjIzYS41NC41NCwwLDAsMS0uMzQtLjI1LDIsMiwwLDAsMC0xLjM0LS45MSwxLjgzLDEuODMsMCwwLDAtLjMzLDAsMS41MSwxLjUxLDAsMCwwLS4zLDBoMGExLjA1LDEuMDUsMCwwLDAtLjI0LjA2LDEuODgsMS44OCwwLDAsMC0uNi4zbC0uMDYsMGEyLDIsMCwwLDEtMS4yLjRINTFhLjg0Ljg0LDAsMCwwLS40OS4xNSwxLDEsMCwwLDAtLjI5LjM1LDEuNTksMS41OSwwLDAsMS0uMTQtLjY2LDEuMjIsMS4yMiwwLDAsMSwwLS4yNiwxLjY2LDEuNjYsMCwwLDEsLjExLS4zOCwxLjUxLDEuNTEsMCwwLDEsLjUtLjY0aDBsLjI5LS4xN2gwbC4xMi0uMDcuMjEtLjExaDBsLjQyLS4yMWgwbC4xOC0uMDguMzUtLjE0LjM1LS4xMi4wOCwwLC4xMywwaC4wN2ExLjYxLDEuNjEsMCwwLDAsLjMzLS4xMiwxLjUzLDEuNTMsMCwwLDAsLjQ4LS4zOSwxLjE0LDEuMTQsMCwwLDAsLjE4LS4yNWgwbDAsMGE0LDQsMCwwLDEsLjg2LTEuMUEzLjQyLDMuNDIsMCwwLDEsNTYsMTEuNjZhNC4yNyw0LjI3LDAsMCwxLC41NC0uMTgsMy41LDMuNSwwLDAsMSwuOC0uMDloLjQzYTgsOCwwLDAsMSwxLjIxLjEsOC4zOCw4LjM4LDAsMCwxLDIuNS41Niw1LjMzLDUuMzMsMCwwLDEsMi43NSwyLjIxbDQuMjQtMS4xNGMtMS4wOC0yLjQzLTMuODMtNC4zMy03LTUuMTNhMTMuODcsMTMuODcsMCwwLDAtOS44NCwxLjE0QTcuMTMsNy4xMywwLDAsMCw0OC44MiwxMlYuMUg0NFYzMi4yMmg0Ljc5VjI5YS41Mi41MiwwLDAsMCwuMS4xMSwxMS4yMiwxMS4yMiwwLDAsMCw0LjgzLDIuODUsMTYsMTYsMCwwLDAsNC44LjdjNi40OCwwLDEwLjU5LTIuOTIsMTAuNTktNy41OUM2OS4xNCwxNy43MSw2MC40MywxOC40Niw1NS43NiwxNy4yM1ptMi43OSwxMS4zNGE5LjY4LDkuNjgsMCwwLDEtNC44LTEuMDksNS43Myw1LjczLDAsMCwxLTIuMjgtMi4zbC0yLjU1LjctLjEsMFYxNy40NmMuOTIsMS45NCwyLjc5LDIuOTQsNC45MywzLjU1LDQuNjcsMS4zMywxMC42LjgxLDEwLjYsNC4xN0M2NC4zNSwyNy4zOCw2Mi4zMiwyOC41Nyw1OC41NSwyOC41N1oiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik02OC41MSwxMy4wOWEyLjMzLDIuMzMsMCwwLDEtMS4xOC43MWMtNC44NS40Ny0zLjQ5LDMuNzktMy40NCwzLjgyYTIuNTUsMi41NSwwLDAsMSwuNy0uNTQsNi40Niw2LjQ2LDAsMCwwLDMuMTQtMi43MSw2LjQsNi40LDAsMCwxLTMsMi45LDIuODUsMi44NSwwLDAsMC0xLjE2LDEuNTUsNC4yOCw0LjI4LDAsMCwxLC40NS0uMDksMi41LDIuNSwwLDAsMSwuNS0uODEsMy4wNywzLjA3LDAsMCwwLDQtMS43MkE0LjQ5LDQuNDksMCwwLDAsNjguNTEsMTMuMDlaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNTYuMjQsMTMuNjRjLS4yNi4wNy0uNTIsMC0uNTctLjE5cy4xMi0uMzguMzktLjQ2LjUzLDAsLjU4LjE5UzU2LjUxLDEzLjU3LDU2LjI0LDEzLjY0WiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTUyLjM5LDE1LjI1SDUyLjNhLjIxLjIxLDAsMCwwLS4xMy4wN2wwLDAtLjA4LjA3YS42Mi42MiwwLDAsMS0uMjIuMWwtLjE3LDAtLjEzLDBhLjQ4LjQ4LDAsMCwxLC4zMS0uMTVoMGwuMTEsMGgwYS4zOS4zOSwwLDAsMSwuMjEtLjA4aC4xNloiLz48L3N2Zz4gCg=="
alt="tells-logo">
</div>
</td>
<td style="width: 165px; border: none;">
<div style="width: 165px; font-size: 10px; font-weight: 400; color: #000;">www.tells-market.com</div>
</td>
<td style="width: 72px; border: none;">
<div>
<img
style="display: block; width: 72px; height: 15px; margin-top: 5px; margin-right: auto; margin-left: auto;"
src="data:image/png;base64,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"
alt="tells-logo">
</div>
</td>
<td></td>
</tr>
</table>
</div>
      `;
  }
}
