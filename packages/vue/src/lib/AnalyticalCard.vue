<template>
  <div>{{ title }}</div>

  <div>

  <v-chart class="chart" :option="option" />

  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import ECharts from 'vue-echarts'
import { use } from "echarts/core"
import { DataSettings, ChartBusinessService } from '@metad/ocap-core'
import { SmartEChartEngine } from '@metad/ocap-echarts'
import { switchMap, tap } from 'rxjs'
import "echarts";
// import ECharts modules manually to reduce bundle size
import {
  CanvasRenderer
} from 'echarts/renderers'
import {
  BarChart
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  VisualMapComponent
} from 'echarts/components'
import { CoreServiceKey } from './Core'

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TooltipComponent,
  VisualMapComponent
])

export default defineComponent({
  name: 'AnalyticalCard',
  components: {
    'v-chart': ECharts,
  },
  inject: {
    coreService: { from: CoreServiceKey }
  },
  props: {
    title: String,
    dataSettings: {
      type: Object as PropType<DataSettings>,
      required: true
    }
  },
  data() {
    return {
      engine: new SmartEChartEngine(),
      chartBusinessService: new ChartBusinessService(this.coreService as any),
      option: {}
    }
  },
  mounted() {
    this.engine.selectChartOptions().subscribe(({options}) => {
      this.option = options
      console.log(this.option)
    })

    this.engine.chartAnnotation = this.dataSettings.chartAnnotation

    this.chartBusinessService.onAfterServiceInit()
      .pipe(
        tap(() => this.chartBusinessService.refresh()),
        switchMap(() => {
          return this.chartBusinessService.selectResult()
        })
      ).subscribe(result => {
      this.engine.data = result
    })
    this.chartBusinessService.dataSettings = this.dataSettings
  },
  watch: {
    dataSettings(newValue, oldValue) {
      if (newValue) {
        console.log(newValue)
        this.engine.chartAnnotation = newValue?.chartAnnotation
        this.chartBusinessService.dataSettings = newValue
      }
    }
  }
})
</script>

<style scoped>
.chart {
  height: 400px;
}
</style>