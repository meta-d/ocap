import { AggregationRole, Semantics } from '@metad/ocap-core'
import { AccordionWrappers, FORMLY_ROW, FORMLY_W_1_2 } from '@metad/story/designer'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { format } from 'date-fns'
import { map, startWith, tap } from 'rxjs'

export function SQLExpression(COMMON) {
  return {
    key: 'sql',
    fieldGroupClassName: FORMLY_ROW,
    fieldGroup: [
      {
        key: 'dialect',
        type: 'ngm-select',
        className: FORMLY_W_1_2,
        props: {
          label: COMMON?.SQLExpression?.Dialect ?? 'Dialect',
          searchable: true,
          valueKey: 'key',
          options: [
            { value: null, caption: COMMON?.None ?? 'None' },
            { value: 'generic', caption: 'generic' },
            { value: 'access', caption: 'access' },
            { value: 'db2', caption: 'db2' },
            { value: 'derby', caption: 'derby' },
            { value: 'firebird', caption: 'firebird' },
            { value: 'hsqldb', caption: 'hsqldb' },
            { value: 'mssql', caption: 'mssql' },
            { value: 'mysql', caption: 'mysql' },
            { value: 'oracle', caption: 'oracle' },
            { value: 'postgres', caption: 'postgres' },
            { value: 'sybase', caption: 'sybase' },
            { value: 'teradata', caption: 'teradata' },
            { value: 'ingres', caption: 'ingres' },
            { value: 'infobright', caption: 'infobright' },
            { value: 'luciddb', caption: 'luciddb' },
            { value: 'vertica', caption: 'vertica' },
            { value: 'neoview', caption: 'neoview' }
          ]
        }
      },
      {
        key: 'content',
        type: 'textarea',
        className: FORMLY_W_1_2,
        props: {
          label: COMMON?.SQLExpression?.Content ?? 'Content',
          rows: 1,
          autosize: true
        }
      }
    ]
  }
}

export function Role(I18N?) {
  return {
    key: 'role',
    type: 'select',
    className: FORMLY_W_1_2,
    props: {
      label: I18N?.AggregationRole ?? 'Aggregation Role',
      options: [
        {
          value: null,
          caption: 'None'
        },
        {
          value: AggregationRole.dimension,
          caption: 'Dimension'
        },
        {
          value: AggregationRole.measure,
          caption: 'Measure'
        },
        {
          value: AggregationRole.hierarchy,
          caption: 'Hierarchy'
        },
        {
          value: AggregationRole.level,
          caption: 'Hierarchy Level'
        }
      ]
    }
  }
}

export function Semantic(COMMON?) {
  return {
    key: 'semantic',
    type: 'select',
    className: FORMLY_W_1_2,
    props: {
      icon: 'class',
      label: COMMON?.Semantic ?? 'Semantic',
      searchable: true,
      options: [
        { value: null, caption: COMMON?.None ?? 'None' },
        { value: Semantics.Geography, caption: 'Geography' },
        {
          value: Semantics['GeoLocation.Latitude'],
          caption: 'GeoLocation Latitude'
        },
        {
          value: Semantics['GeoLocation.Longitude'],
          caption: 'GeoLocation Longitude'
        },
        {
          value: Semantics.Calendar,
          caption: 'Calendar'
        },
        { value: Semantics['Calendar.Year'], caption: 'Calendar Year' },
        { value: Semantics['Calendar.Quarter'], caption: 'Calendar Quarter' },
        { value: Semantics['Calendar.Month'], caption: 'Calendar Month' },
        { value: Semantics['Calendar.Week'], caption: 'Calendar Week' },
        { value: Semantics['Calendar.Day'], caption: 'Calendar Day' },
        {
          value: Semantics['Amount.CurrencyCode'],
          caption: 'Amount CurrencyCode'
        },
        {
          value: Semantics['Quantity.UnitOfMeasure'],
          caption: 'Quantity UnitOfMeasure'
        },
        {
          value: Semantics.CurrencyCode,
          caption: 'Currency Code'
        },
        {
          value: Semantics.UnitOfMeasure,
          caption: 'Unit of Measure'
        },
        {
          value: Semantics.Language,
          caption: 'Language'
        },
        {
          value: Semantics['Address.Region'],
          caption: 'Address Region'
        },
        {
          value: Semantics['Address.SubRegion'],
          caption: 'Address SubRegion'
        },
        {
          value: Semantics['Address.Country'],
          caption: 'Address Country'
        },
        {
          value: Semantics['Address.City'],
          caption: 'Address City'
        },
        {
          value: Semantics['Address.ZipCode'],
          caption: 'Address ZipCode'
        },
        {
          value: Semantics['Address.PostBox'],
          caption: 'Address PostBox'
        },
        {
          value: Semantics['Address.Street'],
          caption: 'Address Street'
        }
      ]
    }
  }
}

export function CalendarFormatter(COMMON?) {
  return {
    hideExpression: `!model || !model.semantic?.startsWith('Calendar')`,
    key: 'formatter',
    type: 'input',
    className: FORMLY_W_1_2,
    props: {
      icon: 'date_range',
      label: COMMON?.Formatter ?? 'Time formatter',
      options: []
    },
    hooks: {
      onInit: (field: FormlyFieldConfig) => {
        const formatters = [
          {
            semantic: Semantics['Calendar.Day'],
            value: 'yyyyMMdd',
            caption: format(new Date(), 'yyyyMMdd')
          },
          {
            semantic: Semantics['Calendar.Day'],
            value: 'yyyy.MM.dd',
            caption: format(new Date(), 'yyyy.MM.dd')
          },
          {
            semantic: Semantics['Calendar.Day'],
            value: 'yyyy-MM-dd',
            caption: format(new Date(), 'yyyy-MM-dd')
          },
          {
            semantic: Semantics['Calendar.Month'],
            value: `yyyyMM`,
            caption: format(new Date(), `yyyyMM`)
          },
          {
            semantic: Semantics['Calendar.Month'],
            value: `yyyy.MM`,
            caption: format(new Date(), `yyyy.MM`)
          },
          {
            semantic: Semantics['Calendar.Month'],
            value: `yyyy-MM`,
            caption: format(new Date(), `yyyy-MM`)
          },
          {
            semantic: Semantics['Calendar.Quarter'],
            value: `yyyy'Q'Q`,
            caption: format(new Date(), `yyyy'Q'Q`)
          },
          {
            semantic: Semantics['Calendar.Quarter'],
            value: `yyyy.'Q'Q`,
            caption: format(new Date(), `yyyy.'Q'Q`)
          },
          {
            semantic: Semantics['Calendar.Quarter'],
            value: `yyyy-'Q'Q`,
            caption: format(new Date(), `yyyy-'Q'Q`)
          },
          {
            semantic: Semantics['Calendar.Year'],
            value: `yyyy`,
            caption: format(new Date(), `yyyy`)
          }
        ]

        const semanticControl = field.parent.fieldGroup.find((fieldGroup) => fieldGroup.key === 'semantic').formControl
        field.props.options = semanticControl.valueChanges.pipe(
          tap(() => field.formControl.setValue(null)),
          startWith(semanticControl.value),
          map((semantic) => formatters.filter((item) => item.semantic === semantic))
        )
      }
    }
  }
}

export function SemanticsAccordionWrapper(i18n) {
  return AccordionWrappers([
    {
      key: 'semantics',
      label: i18n?.Semantics ?? 'Semantics',
      toggleable: true,
      fieldGroup: [Semantic(i18n), CalendarFormatter(i18n)]
    }
  ])
}

export function KeyExpressionAccordion(COMMON) {
  return {
    key: 'keyExpression',
    label: COMMON?.KeyExpression ?? 'Key Expression',
    toggleable: true,
    fieldGroup: [SQLExpression(COMMON)]
  }
}

export function NameExpressionAccordion(COMMON) {
  return {
    key: 'nameExpression',
    label: COMMON?.NameExpression ?? 'Name Expression',
    toggleable: true,
    fieldGroup: [SQLExpression(COMMON)]
  }
}

export function CaptionExpressionAccordion(COMMON) {
  return {
    key: 'captionExpression',
    label: COMMON?.CaptionExpression ?? 'Caption Expression',
    toggleable: true,
    fieldGroup: [SQLExpression(COMMON)]
  }
}

export function OrdinalExpressionAccordion(COMMON) {
  return {
    key: 'ordinalExpression',
    label: COMMON?.OrdinalExpression ?? 'Ordinal Expression',
    toggleable: true,
    fieldGroup: [SQLExpression(COMMON)]
  }
}

export function ParentExpressionAccordion(COMMON) {
  return {
    key: 'parentExpression',
    label: COMMON?.ParentExpression ?? 'Parent Expression',
    toggleable: true,
    fieldGroup: [SQLExpression(COMMON)]
  }
}

export function MeasureExpressionAccordion(COMMON) {
  return {
    key: 'measureExpression',
    label: COMMON?.MeasureExpression ?? 'Measure Expression',
    toggleable: true,
    fieldGroup: [SQLExpression(COMMON)]
  }
}

export function MeasureFormatting(FORMATTING?) {
  return {
    key: 'formatting',
    wrappers: ['panel'],
    fieldGroupClassName: FORMLY_ROW,
    props: {
      label: FORMATTING?.Title ?? 'Measure Formatting'
    },
    fieldGroup: [
      {
        key: 'shortNumber',
        type: 'checkbox',
        className: FORMLY_W_1_2,
        props: {
          label: FORMATTING?.ShortNumber ?? 'Short Number'
        }
      },
      {
        key: 'decimal',
        type: 'input',
        className: FORMLY_W_1_2,
        props: {
          label: FORMATTING?.DecimalFormatter ?? 'Decimal Formatter'
        }
      },
      {
        key: 'unit',
        type: 'input',
        className: FORMLY_W_1_2,
        props: {
          label: FORMATTING?.Unit ?? 'Unit'
        }
      }
    ]
  }
}
