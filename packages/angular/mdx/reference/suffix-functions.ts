export const SUFFIX_FUNCTIONS = [
    {
        label: 'AllMembers',
        expression: `Hierarchy_Expression.AllMembers | Level_Expression.AllMembers`,
        insertText: 'AllMembers',
        documentation: `The AllMembers function returns a set that contains all members, which includes calculated members, in the specified hierarchy or level. The AllMembers function returns the calculated members even if the specified hierarchy or level contains no visible members.
> When a dimension contains only a single visible hierarchy, the hierarchy can be either referred to by the dimension name or by the hierarchy name, because the dimension name in this case is resolved to its only visible hierarchy. For example, Measures.AllMembers is a valid MDX expression because it resolves to the only hierarchy in the Measures dimension.

## Examples

The following example returns all members in the [Date].[Calendar Year] attribute hierarchy on the column axis, this includes calculated members, and the set of all children of the [Product].[Model Name] attribute hierarchy on the row axis from the Adventure Works cube.

\`\`\`sql
SELECT  
   [Date].[Calendar Year].AllMembers ON COLUMNS,  
   [Product].[Model Name].Children ON ROWS  
FROM  
   [Adventure Works]
\`\`\`
`,
   },
   {
      label: 'Members',
      expression: `Hierarchy_Expression.Members | Level_Expression.Members`,
      insertText: 'Members',
      documentation: ``
   }
]
