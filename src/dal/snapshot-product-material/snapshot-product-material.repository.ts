import { ISnapshotProductMaterialModel, SnapshotProductMaterialDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type ISnapshotProductMaterialRepository = IRepository<ISnapshotProductMaterialModel>;

export class SnapshotProductMaterialRepository extends BaseRepository<ISnapshotProductMaterialModel>
  implements ISnapshotProductMaterialRepository {
  constructor() {
    super(SnapshotProductMaterialDbModel);
  }
}
