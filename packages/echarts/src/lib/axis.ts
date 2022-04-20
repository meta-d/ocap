import { ChartOrient } from "@metad/ocap-core"
import { AxisEnum } from "./types"

/**
 * 设置轴方向布局
 *
 * @param orient ChartOrient
 * @return [categoryAxis, valueAxis]
 */
export function axisOrient(orient: ChartOrient): [AxisEnum, AxisEnum] {
  // Chart Orient
  if (orient === ChartOrient.horizontal) {
    return [AxisEnum.y, AxisEnum.x]
  } else {
    return [AxisEnum.x, AxisEnum.y]
  }
}