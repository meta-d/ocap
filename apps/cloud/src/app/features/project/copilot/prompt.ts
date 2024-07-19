export function promptIndicatorCode(indicatorCodes: string) {
    return `Indicator code rules:
  a. Cannot be the same as the following existing ones: [${indicatorCodes}]
  b. Cannot be the same as the name of measures in the cube
  c. The code uses a unified coding rule, for example, indicators belonging to the same business module use the same code prefix.`
}