import { Injectable } from '@nestjs/common';
// import { core } from '../../../../packages/core/src/index'
import * as core from '@metad/ocap-core'

@Injectable()
export class AppService {
  getData(): { message: string } {
    return { message: `Welcome to ${core.core()}!` };
  }
}
