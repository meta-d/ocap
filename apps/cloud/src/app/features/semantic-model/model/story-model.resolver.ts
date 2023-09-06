import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { ModelsService } from '@metad/cloud/state'
import { Observable } from 'rxjs'
import { ISemanticModel } from '../../../@core'

@Injectable()
export class StoryModelResolver  {
  constructor(private modelsService: ModelsService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): ISemanticModel | Observable<ISemanticModel> | Promise<ISemanticModel> {
    const modelId = route.paramMap.get('id')
    return this.modelsService.getById(modelId, [
      'dataSource',
      'dataSource.type',
      'stories',
      'stories.createdBy',
      'roles',
      'roles.users',
      'indicators',
      'indicators.createdBy',
      'queries'
    ])
  }
}
