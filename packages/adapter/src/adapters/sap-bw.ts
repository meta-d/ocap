import { register } from '../base'
import { XMLA } from './xmla'

export class SAPBW extends XMLA {
  static type = 'sapbw'

  name = 'SAP BW (OLAP)'
  type = SAPBW.type
  syntax = 'mdx'
  protocol = 'xmla'
}

register(SAPBW.type, SAPBW)
