<template>

  <div v-for="(item, index) in dataSettings" :key="index">
    <AnalyticalCard :title="item.title" :dataSettings="item.dataSettings"></AnalyticalCard>
  </div>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CoreServiceKey, AnalyticalCard } from '@metad/ocap-vue'
import { DSCoreService } from '@metad/ocap-core'
import { ReferenceLineType, ReferenceLineValueType, ReferenceLineAggregation, ChartDimensionRoleType } from '@metad/ocap-core'


export default defineComponent({
  name: 'App',
  provide() {
    return {
      [CoreServiceKey]: new DSCoreService({
        Sales: {
          name: 'Sales',
          type: 'SQL'
        }
      })
    }
  },
  components: {
    AnalyticalCard
  },
  data() {
    return {
      dataSettings: [
        {
      title: 'Sales Order Bar',
      dataSettings: {
        dataSource: 'Sales',
        entitySet: 'SalesOrder',
        chartAnnotation: {
          chartType: {
            type: 'Bar'
          },
          dimensions: [
            {
              dimension: 'product',
              role: ChartDimensionRoleType.Stacked
            },
            {
              dimension: 'productCategory'
            }
          ],
          measures: [
            {
              dimension: 'Measures',
              measure: 'sales'
            }
          ]
        }
      }
    },
    {
      title: 'Purchase Order Bar',
      dataSettings: {
        dataSource: 'Sales',
        entitySet: 'PurchaseOrder',
        chartAnnotation: {
          chartType: {
            type: 'Bar'
          },
          dimensions: [
            {
              dimension: 'product'
            },
            {
              dimension: 'productCategory'
            }
          ],
          measures: [
            {
              dimension: 'Measures',
              measure: 'sales',
              palette: {
                name: 'PuOr',
                pattern: 1
              },
              referenceLines: [
                {
                  label: 'Sales Average',
                  type: ReferenceLineType.markLine,
                  valueType: ReferenceLineValueType.dynamic,
                  aggregation: ReferenceLineAggregation.average
                }
              ]
            }
          ]
        }
      }
    },
    {
      title: 'Sales Order Line',
      dataSettings: {
        dataSource: 'Sales',
        entitySet: 'SalesOrder',
        chartAnnotation: {
          chartType: {
            type: 'Line'
          },
          dimensions: [
            {
              dimension: 'product'
            },
            {
              dimension: 'productCategory',
              role: ChartDimensionRoleType.Trellis
            }
          ],
          measures: [
            {
              dimension: 'Measures',
              measure: 'sales'
            }
          ]
        }
      },
    }
      ]
    }
  }
})
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
