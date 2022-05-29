import { assign, isEmpty } from 'lodash'
import { Annotation, PropertyName } from '../types'

/**
 * [Hierarchy Vocabulary](https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Hierarchy.md)
 */
export interface RecursiveHierarchyType extends Annotation {
  parentNodeProperty: PropertyName // Property holding the parent hierarchy node value
  /**
   * TODO 意思应该是指被子节点`parentNodeProperty`引用的唯一键字段
   */
  externalKeyProperty?: PropertyName // Property holding the external key value for a node
  valueProperty: PropertyName // Property for whose values the hierarchy is defined
  labelProperty?: PropertyName
  levelProperty?: PropertyName
  /**
   * Property holding the number of descendants of a node
   * The descendant count of a node is the number of its descendants in the hierarchy structure of the result considering
   * only those nodes matching any specified $filter and $search. A property holding descendant counts has an integer data type.
   */
  descendantCountProperty?: PropertyName
  /**
   * Property holding the drill state of a node
   * The drill state is indicated by one of the following string values: collapsed, expanded, leaf.
   * For an expanded node, its children are included in the result collection. For a collapsed node,
   * the children are included in the entity set, but they are not part of the result collection.
   * Retrieving them requires a relaxed filter expression or a separate request filtering on the parent node ID with the ID of
   * the collapsed node.
   * A leaf does not have any child in the entity set.
   */
  drillStateProperty?: PropertyName
  /**
   * Property holding the sibling rank of a node
   * The sibling rank of a node is the index of the node in the sequence of all nodes with the same parent created by preorder traversal of
   * the hierarchy structure after evaluating the $filter expression in the request excluding any conditions on key properties.
   * The first sibling is at position 0.
   */
  siblingRankProperty?: PropertyName

  /**
   * Property holding the preorder rank of a node
   * The preorder rank of a node expresses its position in the sequence of nodes created from preorder traversal of
   * the hierarchy structure after evaluating the $filter expression in the request excluding any conditions on key properties.
   * The first node in preorder traversal has rank 0.
   */
  preorderRankProperty?: PropertyName

  memberTypeProperty?: PropertyName
}

/**
 * RecursiveHierarchy 类型的数据与 RecursiveHierarchy Annotation 绑定一起的类型
 */
export interface RecursiveHierarchyData<T> {
  data: Array<TreeNodeInterface<T>>
  recursiveHierarchy: RecursiveHierarchyType
}
export interface TreeNodeInterface<T> {
  key: string
  raw: T
  value?: number
  level?: number
  label: string
  title: string
  name: string
  expand?: boolean
  children?: TreeNodeInterface<T>[]
  parent?: TreeNodeInterface<T>
  isLeaf?: boolean
}

export function hierarchize<T>(
  items: Array<T>,
  recursiveHierarchy: RecursiveHierarchyType,
  valueProperty?: string
): Array<TreeNodeInterface<T>> {

  const root = []
  const results = {} as Record<string, TreeNodeInterface<T>>
  items.forEach((item) => {
    if (!results[item[recursiveHierarchy.valueProperty]]) {
      results[item[recursiveHierarchy.valueProperty]] = {
        children: []
      } as TreeNodeInterface<T>
    }
    assign(results[item[recursiveHierarchy.valueProperty]], {
      key: item[recursiveHierarchy.valueProperty],
      label: item[recursiveHierarchy.labelProperty],
      title: item[recursiveHierarchy.labelProperty],
      name: item[recursiveHierarchy.labelProperty],
      raw: item
    })

    if (valueProperty) {
      results[item[recursiveHierarchy.valueProperty]].value = item[valueProperty]
    }

    if (item[recursiveHierarchy.parentNodeProperty]) {
      if (results[item[recursiveHierarchy.parentNodeProperty]]) {
        results[item[recursiveHierarchy.parentNodeProperty]].children.push(
          results[item[recursiveHierarchy.valueProperty]]
        )
      } else {
        results[item[recursiveHierarchy.parentNodeProperty]] = {
          children: [
            results[item[recursiveHierarchy.valueProperty]]
          ]
        } as TreeNodeInterface<T>
      }
    } else {
      root.push(results[item[recursiveHierarchy.valueProperty]])
    }
  })

  Object.values(results).forEach((node) => {
    if (isEmpty(node.children)) {
      node.isLeaf = true
      node.children = null
    }
    if (!node.raw) {
      root.push(...node.children)
    }
  })
  return root
}
