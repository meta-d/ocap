import { HttpClientModule } from '@angular/common/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { TranslateModule } from '@ngx-translate/core'

import {
  AggregationRole,
  C_MEASURES,
  CalculatedProperty,
  CalculationType,
  Dimension,
  EntityType,
  Measure
} from '@metad/ocap-core'
import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger'
import { MonacoEditorModule } from 'ngx-monaco-editor'
import { CalculationEditorComponent } from '../calculation'
import { PropertySelectComponent } from '../property-select/property-select.component'
import { PropertyModule } from '../property.module'

const ENTITY_TYPE: EntityType = {
  name: 'Sales',
  visible: true,
  properties: {
    A: {
      name: 'A',
      caption: 'Field A',
      role: AggregationRole.dimension,
      hierarchies: [
        {
          name: '[A]',
          caption: 'H-A',
          role: AggregationRole.hierarchy,
          levels: [
            {
              name: '[A].[All]',
              caption: '[A] Level 00',
              role: AggregationRole.level,
              levelNumber: 0
            },
            {
              name: '[A].[Description]',
              caption: '[A] Level 01',
              role: AggregationRole.level,
              levelNumber: 1,
              properties: [
                {
                  name: '[TEXTSH]',
                  caption: '短文本'
                },
                {
                  name: '[TEXTMD]',
                  caption: '中文本'
                },
                {
                  name: '[TEXTLG]',
                  caption: '长文本'
                }
              ]
            }
          ]
        }
      ]
    },
    B: {
      name: 'B',
      caption: 'Field B',
      role: AggregationRole.dimension
    },
    C: {
      name: 'C',
      caption: 'Field C',
      role: AggregationRole.measure
    },
    D: {
      name: 'D',
      caption: 'Field D',
      role: AggregationRole.measure,
      calculationType: CalculationType.Calculated,
      formula: 'C / 100'
    } as CalculatedProperty
  }
}

export default {
  title: 'Components/Property/Property Select',
  component: PropertySelectComponent,
  argTypes: {
    valueChange: { action: 'clicked' }
  },
  decorators: [
    moduleMetadata({
      declarations: [],
      imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        LoggerModule.forRoot({
          level: NgxLoggerLevel.DEBUG
        }),
        TranslateModule.forRoot(),
        PropertyModule,
        MonacoEditorModule.forRoot()
      ]
    })
  ]
} as Meta

const Template: Story<PropertySelectComponent> = (args: PropertySelectComponent) => ({
  component: PropertySelectComponent,
  props: {
    calculationEditor: CalculationEditorComponent,
    ...args
  }
})

export const Primary = () => ({
  component: PropertySelectComponent,
  props: {
    entityType: ENTITY_TYPE
  }
})

export const DimensionWithHierarchy = Template.bind({})
DimensionWithHierarchy.args = {
  entityType: ENTITY_TYPE,
  value: {
    dimension: '[Customers]',
    hierarchy: '[Customers]',
    level: '[Customers].[Country]'
  }
}

export const DimensionWithoutHierarchy = Template.bind({})
DimensionWithoutHierarchy.args = {
  entityType: ENTITY_TYPE,
  value: {
    dimension: 'B'
  }
}

export const Level = {
  args: {
    entityType: ENTITY_TYPE,
    value: {
      dimension: 'A',
      hierarchy: '[A]',
      level: '[A].[Description]'
    }
  }
}

export const MeasureField = {
  args: {
    entityType: ENTITY_TYPE,
    value: {
      dimension: 'C'
    }
  }
}

const measureObject: Measure = {
  dimension: C_MEASURES,
  measure: 'C'
}

export const MeasureObject = Template.bind({})
MeasureObject.args = {
  entityType: ENTITY_TYPE,
  value: measureObject
}

const measuresDimension: Dimension = {
  dimension: C_MEASURES,
  members: ['C']
}

export const MeasuresObject = Template.bind({})
MeasuresObject.args = {
  entityType: ENTITY_TYPE,
  value: measuresDimension
}

export const Calculation = Template.bind({})
Calculation.args = {
  entityType: ENTITY_TYPE,
  value: {
    dimension: 'D'
  }
}

export const Members = Template.bind({})
Members.args = {
  entityType: ENTITY_TYPE,
  value: {
    dimension: 'A',
    members: [
      {
        value: 'A1'
      },
      {
        value: 'A2'
      }
    ]
  }
}

export const Properties = Template.bind({})
Properties.args = {
  entityType: ENTITY_TYPE,
  value: {
    dimension: 'A',
    hierarchy: '[A]',
    level: '[A].[Description]',
    properties: ['[TEXTSH]', '[TEXTLG]']
  }
}
