import { C_FORMLY_INITIAL_VALUE } from '@metad/formly-mat/expansion'
import { AggregationRole, Semantics } from '@metad/ocap-core'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { FORMLY_ROW, FORMLY_W_1_2 } from '@metad/story/designer'
import format from 'date-fns/format'
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
          options: [
            { value: null, label: COMMON?.None ?? 'None' },
            { value: 'generic', label: 'generic' },
            { value: 'access', label: 'access' },
            { value: 'db2', label: 'db2' },
            { value: 'derby', label: 'derby' },
            { value: 'firebird', label: 'firebird' },
            { value: 'hsqldb', label: 'hsqldb' },
            { value: 'mssql', label: 'mssql' },
            { value: 'mysql', label: 'mysql' },
            { value: 'oracle', label: 'oracle' },
            { value: 'postgres', label: 'postgres' },
            { value: 'sybase', label: 'sybase' },
            { value: 'teradata', label: 'teradata' },
            { value: 'ingres', label: 'ingres' },
            { value: 'infobright', label: 'infobright' },
            { value: 'luciddb', label: 'luciddb' },
            { value: 'vertica', label: 'vertica' },
            { value: 'neoview', label: 'neoview' }
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
          autosize: true,
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
          label: 'None'
        },
        {
          value: AggregationRole.dimension,
          label: 'Dimension'
        },
        {
          value: AggregationRole.measure,
          label: 'Measure'
        },
        {
          value: AggregationRole.hierarchy,
          label: 'Hierarchy'
        },
        {
          value: AggregationRole.level,
          label: 'Hierarchy Level'
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
        { value: null, label: COMMON?.None ?? 'None' },
        { value: Semantics.Geography, label: 'Geography' },
        {
          value: Semantics['GeoLocation.Latitude'],
          label: 'GeoLocation Latitude'
        },
        {
          value: Semantics['GeoLocation.Longitude'],
          label: 'GeoLocation Longitude'
        },
        {
          value: Semantics.Calendar,
          label: 'Calendar'
        },
        { value: Semantics['Calendar.Year'], label: 'Calendar Year' },
        { value: Semantics['Calendar.Quarter'], label: 'Calendar Quarter' },
        { value: Semantics['Calendar.Month'], label: 'Calendar Month' },
        { value: Semantics['Calendar.Week'], label: 'Calendar Week' },
        { value: Semantics['Calendar.Day'], label: 'Calendar Day' },
        {
          value: Semantics['Amount.CurrencyCode'],
          label: 'Amount CurrencyCode'
        },
        {
          value: Semantics['Quantity.UnitOfMeasure'],
          label: 'Quantity UnitOfMeasure'
        },
        {
          value: Semantics.CurrencyCode,
          label: 'Currency Code'
        },
        {
          value: Semantics.UnitOfMeasure,
          label: 'Unit of Measure'
        },
        {
          value: Semantics.Language,
          label: 'Language'
        },
        {
          value: Semantics['Address.Region'],
          label: 'Address Region'
        },
        {
          value: Semantics['Address.SubRegion'],
          label: 'Address SubRegion'
        },
        {
          value: Semantics['Address.Country'],
          label: 'Address Country'
        },
        {
          value: Semantics['Address.City'],
          label: 'Address City'
        },
        {
          value: Semantics['Address.ZipCode'],
          label: 'Address ZipCode'
        },
        {
          value: Semantics['Address.PostBox'],
          label: 'Address PostBox'
        },
        {
          value: Semantics['Address.Street'],
          label: 'Address Street'
        }
      ]
    }
  }
}

export function CalendarFormatter(COMMON?) {
  return {
    hideExpression: `model === null || !model.semantic?.startsWith('Calendar')`,
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
            label: format(new Date(), 'yyyyMMdd')
          },
          {
            semantic: Semantics['Calendar.Day'],
            value: 'yyyy.MM.dd',
            label: format(new Date(), 'yyyy.MM.dd')
          },
          {
            semantic: Semantics['Calendar.Day'],
            value: 'yyyy-MM-dd',
            label: format(new Date(), 'yyyy-MM-dd')
          },
          {
            semantic: Semantics['Calendar.Month'],
            value: `yyyyMM`,
            label: format(new Date(), `yyyyMM`)
          },
          {
            semantic: Semantics['Calendar.Month'],
            value: `yyyy.MM`,
            label: format(new Date(), `yyyy.MM`)
          },
          {
            semantic: Semantics['Calendar.Month'],
            value: `yyyy-MM`,
            label: format(new Date(), `yyyy-MM`)
          },
          {
            semantic: Semantics['Calendar.Quarter'],
            value: `yyyy'Q'Q`,
            label: format(new Date(), `yyyy'Q'Q`)
          },
          {
            semantic: Semantics['Calendar.Quarter'],
            value: `yyyy.'Q'Q`,
            label: format(new Date(), `yyyy.'Q'Q`)
          },
          {
            semantic: Semantics['Calendar.Quarter'],
            value: `yyyy-'Q'Q`,
            label: format(new Date(), `yyyy-'Q'Q`)
          },
          {
            semantic: Semantics['Calendar.Year'],
            value: `yyyy`,
            label: format(new Date(), `yyyy`)
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

export function SemanticsExpansion(COMMON?) {
  return {
    fieldGroupClassName: FORMLY_ROW,
    key: 'semantics',
    wrappers: ['expansion'],
    defaultValue: C_FORMLY_INITIAL_VALUE,
    props: {
      label: COMMON?.Semantics ?? 'Semantics',
      icon: 'location_on',
      toggleable: true
    },
    fieldGroup: [Semantic(COMMON), CalendarFormatter(COMMON)]
  }
}

export function KeyExpression(COMMON?) {
  return {
    key: 'keyExpression',
    wrappers: ['expansion'],
    defaultValue: C_FORMLY_INITIAL_VALUE,
    props: {
      icon: 'vpn_key',
      label: COMMON?.KeyExpression ?? 'Key Expression',
      toggleable: true
    },
    fieldGroup: [SQLExpression(COMMON)]
  }
}

export function NameExpression(COMMON?) {
  return {
    key: 'nameExpression',
    wrappers: ['expansion'],
    defaultValue: C_FORMLY_INITIAL_VALUE,
    props: {
      label: COMMON?.NameExpression ?? 'Name Expression',
      toggleable: true
    },
    fieldGroup: [SQLExpression(COMMON)]
  }
}

export function CaptionExpression(COMMON?) {
  return {
    key: 'captionExpression',
    wrappers: ['expansion'],
    defaultValue: C_FORMLY_INITIAL_VALUE,
    props: {
      icon: 'vpn_key',
      label: COMMON?.CaptionExpression ?? 'Caption Expression',
      toggleable: true
    },
    fieldGroup: [SQLExpression(COMMON)]
  }
}

export function OrdinalExpression(COMMON?) {
  return {
    key: 'ordinalExpression',
    wrappers: ['expansion'],
    defaultValue: C_FORMLY_INITIAL_VALUE,
    props: {
      label: COMMON?.OrdinalExpression ?? 'Ordinal Expression',
      toggleable: true
    },
    fieldGroup: [SQLExpression(COMMON)]
  }
}

export function ParentExpression(COMMON?) {
  return {
    key: 'parentExpression',
    wrappers: ['expansion'],
    defaultValue: C_FORMLY_INITIAL_VALUE,
    props: {
      icon: 'vpn_key',
      label: COMMON?.ParentExpression ?? 'Parent Expression',
      toggleable: true
    },
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
