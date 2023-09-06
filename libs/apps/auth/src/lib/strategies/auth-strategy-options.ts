/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { PacAuthTokenClass } from '../services/token/token';

export interface NbStrategyToken {
  class?: PacAuthTokenClass;
  [key: string]: any;
}

export class PacAuthStrategyOptions {
  name: string;
  token?: NbStrategyToken;
}
