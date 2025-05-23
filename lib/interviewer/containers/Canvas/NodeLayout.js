import {
  entityAttributesProperty,
  entityPrimaryKeyProperty,
} from '@codaco/shared-consts';
import { get } from 'es-toolkit/compat';
import { connect } from 'react-redux';
import { compose, withHandlers, withState } from 'recompose';
import { DropTarget } from '~/lib/interviewer/behaviours/DragAndDrop';
import withBounds from '~/lib/interviewer/behaviours/withBounds';
import NodeLayout from '~/lib/interviewer/components/Canvas/NodeLayout';
import {
  toggleEdge,
  toggleNodeAttributes,
  updateNode,
} from '~/lib/interviewer/ducks/modules/session';

const relativeCoords = (container, node) => ({
  x: (node.x - container.x) / container.width,
  y: (node.y - container.y) / container.height,
});

const withConnectFrom = withState('connectFrom', 'setConnectFrom', null);

const withConnectFromHandler = withHandlers({
  handleConnectFrom:
    ({ setConnectFrom }) =>
    (id) => {
      setConnectFrom(id);
    },
  handleResetConnectFrom:
    ({ setConnectFrom }) =>
    () =>
      setConnectFrom(null),
});

const withDropHandlers = withHandlers({
  accepts:
    () =>
    ({ meta }) =>
      meta.itemType === 'POSITIONED_NODE',
  onDrop:
    ({ updateNode, layout, twoMode, width, height, x, y }) =>
    (item) => {
      const layoutVariable = twoMode ? layout[item.meta.type] : layout;

      updateNode({
        nodeId: item.meta[entityPrimaryKeyProperty],
        newAttributeData: {
          [layoutVariable]: relativeCoords(
            {
              width,
              height,
              x,
              y,
            },
            item,
          ),
        },
      });
    },
});

const withSelectHandlers = compose(
  withHandlers({
    connectNode:
      ({
        nodes,
        createEdge,
        connectFrom,
        handleConnectFrom,
        toggleEdge,
        originRestriction,
      }) =>
      (nodeId) => {
        // If edge creation is disabled, return
        if (!createEdge) {
          return;
        }

        // If the target and source node are the same, deselect
        if (connectFrom === nodeId) {
          handleConnectFrom(null);
          return;
        }

        // If there isn't a target node yet, and the type isn't restricted,
        // set the selected node into the linking state
        if (!connectFrom) {
          const nodeType = get(nodes, [nodeId, 'type']);

          // If the node type is restricted, return
          if (originRestriction && nodeType === originRestriction) {
            return;
          }

          handleConnectFrom(nodeId);
          return;
        }

        // Either add or remove an edge
        if (connectFrom !== nodeId) {
          toggleEdge({
            from: connectFrom,
            to: nodeId,
            type: createEdge,
          });
        }

        // Reset the node linking state
        handleConnectFrom(null);
      },
    toggleHighlightAttribute:
      ({ allowHighlighting, highlightAttribute, toggleHighlight }) =>
      (node) => {
        if (!allowHighlighting) {
          return;
        }
        const newVal = !node[entityAttributesProperty][highlightAttribute];
        toggleHighlight({
          nodeId: node[entityPrimaryKeyProperty],
          attributes: {
            [highlightAttribute]: newVal,
          },
        });
      },
  }),
  withHandlers({
    onSelected:
      ({ allowHighlighting, connectNode, toggleHighlightAttribute }) =>
      (node) => {
        if (!allowHighlighting) {
          connectNode(node[entityPrimaryKeyProperty]);
        } else {
          toggleHighlightAttribute(node);
        }
      },
  }),
);

const mapDispatchToProps = {
  toggleHighlight: toggleNodeAttributes,
  toggleEdge: toggleEdge,
  updateNode: updateNode,
};

export default compose(
  withConnectFrom,
  withConnectFromHandler,
  connect(null, mapDispatchToProps),
  withBounds,
  withDropHandlers,
  withSelectHandlers,
  DropTarget,
)(NodeLayout);
