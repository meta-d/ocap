export enum PeriodFunctions {
  CURRENT = 'CURRENT',
  /**
   * 年累计
   */
  YTD = 'YTD',
  /**
   * 季度累计
   */
  QTD = 'QTD',
  /**
   * 周累计
   */
  WTD = 'WTD',
  /**
   * 月累计
   */
  MTD = 'MTD',
  /**
   * 去年同期年累计
   */
  PYYTD = 'PYYTD',
  /**
   * 同比
   */
  YOY = 'YOY',
  /**
   * 同比差值（当期 - 去年同期）
   */
  YOYGAP = 'YOYGAP',
  /**
   * 环比
   */
  MOM = 'MOM',
  /**
   * 环比差值（当期 - 上期）
   */
  MOMGAP = 'MOMGAP',
  /**
   * 年累计环比
   */
  YTDOM = 'YTDOM',
  /**
   * 年累计同比
   */
  YTDOY = 'YTDOY',
  /**
   * 年累计同比差值
   */
  YTDOYGAP = 'YTDOYGAP',
  /**
   * 上期
   */
  MPM = 'MPM',
  /**
   * 上期同比
   */
  MPMYOY = 'MPMYOY',
  /**
   * 去年同期
   */
  PYSM = 'PYSM',
  /**
   * 去年同期同比
   */
  PYSMYOY = 'PYSMYOY'
}
