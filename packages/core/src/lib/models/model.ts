export interface SemanticModel {
    name: string
    type: 'DuckDB' | 'MDX',
    schemaName: string
    entities: Array<{
        name: string
        type: 'parquet' | 'csv' | 'json'
        sourceUrl: string
        delimiter?: string
    }>

    schema?: {
        dimensions: any[]
        cubes: any[]
    }
}
