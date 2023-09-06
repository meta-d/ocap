import * as https from 'https'
import { IDSSchema } from '../types'
import { BaseHTTPQueryRunner, HttpAdapterOptions, register } from '../base'

const httpsAgent = new https.Agent({ rejectUnauthorized: false })


export interface XmlaAdapterOptions extends HttpAdapterOptions {
  path?: string
  use_ssl?: boolean
  disable_reject_cert?: boolean
}

export class XMLA extends BaseHTTPQueryRunner<XmlaAdapterOptions> {

  static type = 'xmla'

  name = 'XMLA'
  type = XMLA.type
  syntax = 'mdx'
  protocol = 'xmla'

  get configurationSchema() {
    return {
      type: 'object',
      properties: {
        use_ssl: { type: 'boolean', title: 'Use SSL', default: false },
        host: { type: 'string' },
        port: { type: 'number', default: 80 },
        path: { type: 'string' },
        username: { type: 'string' },
        password: { type: 'string' },
        data_source_info: { type: 'string', title: 'Data Source Info' },
        disable_reject_cert: { type: 'boolean', title: 'Disable reject cert', default: false },
      },
      required: ['host', 'port', 'path'],
      order: ['host', 'port', 'path'],
      secret: ['password']
    }
  }

  get url() {
    let url = `${this.options.use_ssl ? 'https' : 'http'}://${
      this.options.host
    }:${this.options.port}`
    if (this.options.path) {
      url = `${url}${(this.options.path as string).startsWith('/') ? '' : '/'}${
        this.options.path
      }`
    }
    return url
  }

  runQuery(query: string, options?: Record<string, any>) {
    const headers = options?.headers || {}
    return this.post(query, {
      auth: {
        // TODO 这里是 Options.username 在 SQL 里是 user 需要统一
        username: this.options.username,
        password: this.options.password,
      },
      headers: {
        ...headers,
        Accept: 'text/xml, application/xml, application/soap+xml',
        'Content-Type': 'text/xml',
      },
      httpsAgent: this.options.disable_reject_cert ? httpsAgent : null
    })
  }
  
  getCatalogs(): Promise<IDSSchema[]> {
    throw new Error('Method not implemented.')
  }
  getSchema(): Promise<IDSSchema[]> {
    throw new Error('Method not implemented.')
  }

  async ping(): Promise<void> {
    await this.run(``)
  }

  async teardown() {
    //
  }
}

register(XMLA.type, XMLA)
