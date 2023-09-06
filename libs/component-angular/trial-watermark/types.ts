export interface NxWatermarkOptions {
  text?: string
  width?: number
  height?: number
  fontFamily?: string
  fontSize?: string
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
  color?: string
  alpha?: number
  degree?: number
  lineHeight?: number
  textAlign?: 'start' | 'end' | 'center' | 'left' | 'right'
  textBaseline?: 'alphabetic' | 'top' | 'hanging' | 'middle' | 'ideographic' | 'bottom'
  backgroundRepeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' | 'space' | 'round' | 'initial'
  backgroundPosition?: string
}
