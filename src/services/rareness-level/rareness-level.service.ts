import { HighlightPointRepository, IRarenessLevelDao, RarenessLevelRepository } from '../../dal';
import { HighlightTypeEnum, IHighlightPointModel } from '../../database';
import { ApiError } from '../../errors';
export interface RarenessLevelServiceOption {
  rarenessLevelRepository: RarenessLevelRepository;
  highlightPointRepository: HighlightPointRepository;
}

export class RarenessLevelService {
  private services: RarenessLevelServiceOption;

  constructor(services: RarenessLevelServiceOption) {
    this.services = services;
  }

  async getAll(): Promise<IRarenessLevelDao[]> {
    const rarenessLevelList = await this.services.rarenessLevelRepository.findAll({
      where: { deletedAt: null }
    });

    return rarenessLevelList;
  }

  async calcRarenessTotalPoint(highlightPointIds?: number[], rarenessLevelId?: number): Promise<number> {
    if (!rarenessLevelId) {
      return 0;
    }

    const rarenessLevel = await this.services.rarenessLevelRepository.getById(rarenessLevelId);
    if (!rarenessLevel) {
      throw ApiError.badRequest('Parameter "rarenessLevel" is not exist');
    }

    const highlightPoints = await this.services.highlightPointRepository.getAllByTypeAndIds(
      highlightPointIds || [],
      HighlightTypeEnum.RARENESS
    );
    const totalValueHighlightPoint = this.calcTotalValueHighlightPoint(highlightPoints);
    const rarenessLevelValue = rarenessLevel.point;

    const totalValue = totalValueHighlightPoint + rarenessLevelValue;

    return totalValue > 5 ? 5 : totalValue;
  }

  calcTotalValueHighlightPoint(highlightPoints: IHighlightPointModel[]): number {
    return highlightPoints.reduce((total, highlightPoint) => total + (highlightPoint.value || 0), 0);
  }
}
