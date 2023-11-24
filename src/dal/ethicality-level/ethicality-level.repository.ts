import { EthicalityLevelDbModel, IEthicalityLevelModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IEthicalityLevelRepository = IRepository<IEthicalityLevelModel>;

export class EthicalityLevelRepository extends BaseRepository<IEthicalityLevelModel> implements IEthicalityLevelRepository {
  constructor() {
    super(EthicalityLevelDbModel);
  }
}
