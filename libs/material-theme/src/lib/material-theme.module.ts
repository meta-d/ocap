import { registerTheme } from 'echarts/core'
import { COSMIC_THEME } from '../styles/theme.cosmic'
import { DARK_THEME } from '../styles/theme.dark'
import { DEFAULT_THEME } from '../styles/theme.default'
import { THIN_THEME } from '../styles/theme.thin'

export function registerEChartsThemes() {
  registerTheme(DEFAULT_THEME.name, DEFAULT_THEME.chartTheme)
  registerTheme('light', DEFAULT_THEME.chartTheme)
  registerTheme(DARK_THEME.name, DARK_THEME.chartTheme)
  registerTheme(COSMIC_THEME.name, COSMIC_THEME.chartTheme)
  registerTheme(THIN_THEME.name, THIN_THEME.chartTheme)
}
