import { type FilterRule } from '@codaco/protocol-validation';
import {
  entityAttributesProperty,
  entityPrimaryKeyProperty,
  type NcEdge,
  type NcEgo,
  type NcNetwork,
  type NcNode,
} from '@codaco/shared-consts';
import predicate, { operators } from './predicate';

const singleEdgeRule =
  ({ type, attribute, operator, value: other }: FilterRule['options']) =>
  (node: NcNode, edges: NcEdge[]) => {
    const nodeEdges = edges.filter(
      (edge) =>
        edge.from === node[entityPrimaryKeyProperty] ||
        edge.to === node[entityPrimaryKeyProperty],
    );

    const nodeHasEdgeOfType = nodeEdges.some((edge) => edge.type === type);

    if (!attribute) {
      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      switch (operator) {
        case 'EXISTS':
          return nodeHasEdgeOfType;
        default:
          return !nodeHasEdgeOfType;
      }
    }

    const nodeHasEdgeWithAttribute =
      nodeHasEdgeOfType &&
      nodeEdges.some(
        (edge) =>
          edge.type === type &&
          predicate(operator)({
            value: edge[entityAttributesProperty][attribute],
            other,
          }),
      );

    return nodeHasEdgeWithAttribute;
  };

export type SingleEdgeRule = typeof singleEdgeRule;

const singleNodeRule =
  ({ type, attribute, operator, value: other }: FilterRule['options']) =>
  (node: NcNode) => {
    if (!attribute) {
      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      switch (operator) {
        case operators.EXISTS:
          return node.type === type;
        default:
          return node.type !== type;
      }
    }

    return (
      node.type === type &&
      predicate(operator)({
        value: node[entityAttributesProperty][attribute],
        other,
      })
    );
  };

type SingleNodeRule = typeof singleNodeRule;

// Reduce edges to any that match the rule
// Filter nodes by the resulting edges
const edgeRule =
  ({ attribute, operator, type, value: other }: FilterRule['options']) =>
  (nodes: NcNetwork['nodes'], edges: NcNetwork['edges']) => {
    let filteredEdges;
    // If there is no attribute, we just care about filtering by type
    if (!attribute) {
      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      switch (operator) {
        case operators.EXISTS:
          filteredEdges = edges.filter((edge) => edge.type === type);
          break;
        default:
          filteredEdges = edges.filter((edge) => edge.type !== type);
      }
    } else {
      // If there is an attribute we check that, too.
      filteredEdges = edges.filter(
        (edge) =>
          edge.type === type &&
          predicate(operator)({
            value: edge[entityAttributesProperty][attribute],
            other,
          }),
      );
    }

    const edgeMap = filteredEdges.flatMap((edge) => [edge.from, edge.to]);

    const filteredNodes = nodes.filter((node) =>
      edgeMap.includes(node[entityPrimaryKeyProperty]),
    );

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  };

type EdgeRule = typeof edgeRule;

/**
 * Creates an alter rule, which can be called with `rule(node)`
 *
 * @param {Object} options Rule configuration
 * @param {string} options.type Which type of node we are interested in
 * @param {string} options.attribute Which node attribute to assess
 * @param {string} options.operator What predicate to apply to the attribute
 * @param {string} options.value Value to compare the node attribute with
 *
 * Usage:
 * ```
 * // Check node is of type
 * const rule = nodeRule({ type: 'person', operator: operators.EXISTS });
 * const result = rule(node); // returns boolean
 * ```
 * ```
 * // Check node is of type and has attribute that matches the expression
 * const rule = nodeRule({
 *   type: 'person',
 *   operator: operators.EXISTS,
 *   attribute:'age',
 *   operator: 'GREATER_THAN',
 *   value: 20
 * });
 * const result = rule(node); // returns boolean
 * ```
 */
const nodeRule =
  ({ attribute, operator, type, value: other }: FilterRule['options']) =>
  (nodes: NcNetwork['nodes'] = [], edges: NcNetwork['edges'] = []) => {
    let filteredNodes: NcNode[] = [];
    // If there is no attribute, we just care about filtering by type
    if (!attribute) {
      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      switch (operator) {
        case operators.EXISTS:
          filteredNodes = nodes.filter((node) => node.type === type!);
          break;
        default:
          filteredNodes = nodes.filter((node) => node.type !== type);
      }
    } else {
      // If there is an attribute we check that, too.
      filteredNodes = nodes.filter(
        (node) =>
          node.type === type &&
          predicate(operator)({
            value: node[entityAttributesProperty][attribute],
            other,
          }),
      );
    }

    const nodeIds = filteredNodes.map((node) => node[entityPrimaryKeyProperty]);

    const filteredEdges = edges.filter(
      (edge) => nodeIds.includes(edge.from) && nodeIds.includes(edge.to),
    );

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  };

type NodeRule = typeof nodeRule;

/**
 * Creates an ego rule, which can be called with `rule(ego)`
 *
 * @param {Object} options Rule configuration
 * @param {string} options.attribute Which ego attribute to assess
 * @param {string} options.operator What predicate to apply to the attribute
 * @param {string} options.value Value to compare the ego attribute with
 */
const egoRule =
  ({ attribute, operator, value: other }: FilterRule['options']) =>
  (ego: NcEgo) =>
    predicate(operator)({
      value: ego[entityAttributesProperty][attribute!],
      other,
    });

export type EgoRule = typeof egoRule;

type RuleWithMetadata = {
  type: FilterRule['type'];
  options: FilterRule['options'];
}

type RuleFunction =
  | EgoRule
  | NodeRule
  | EdgeRule
  | SingleNodeRule
  | SingleEdgeRule;

export type RuleFunctionWithMetadata = RuleFunction & RuleWithMetadata;

const createRule = (
  type: FilterRule['type'],
  options: FilterRule['options'],
  f: RuleFunction,
) => {
  const rule = f(options) as unknown as RuleFunctionWithMetadata;
  rule.type = type;
  rule.options = options;
  return rule;
};

/**
 * Creates a configured rule function based on the ruleConfig
 *
 * @param {Object} ruleConfig
 * @param {string} ruleConfig.type Which type of rule we need
 * @param {Object} ruleConfig.options Configuration object for specific rule type
 *
 * Usage:
 * ```
 * const rule = getRule({ type: alter, options: { type: 'person', operator: operators.EXISTS } });
 * const result = rule(node, edges); // returns boolean
 * ```
 */
export const getRuleFunction = ({ type, options }: FilterRule) => {
  switch (type) {
    case 'alter':
      return createRule('alter', options, nodeRule);
    case 'edge':
      return createRule('edge', options, edgeRule);
    case 'ego':
      return createRule('ego', options, egoRule);
  }
};

// As above, but for rules matching single array or edge
export const getSingleRuleFunction = ({ type, options }: FilterRule) => {
  switch (type) {
    case 'alter':
      return createRule('alter', options, singleNodeRule);
    case 'edge':
      return createRule('edge', options, singleEdgeRule);
    case 'ego':
      return createRule('ego', options, egoRule);
  }
};
