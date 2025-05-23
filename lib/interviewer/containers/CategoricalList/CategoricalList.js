import { entityAttributesProperty } from '@codaco/shared-consts';
import { compose } from '@reduxjs/toolkit';
import cx from 'classnames';
import color from 'color';
import { throttle } from 'es-toolkit';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Flipper } from 'react-flip-toolkit';
import { connect } from 'react-redux';
import { getCSSVariableAsString } from '~/lib/ui/utils/CSSVariables';
import { MonitorDragSource } from '../../behaviours/DragAndDrop';
import { makeGetVariableOptions } from '../../selectors/interface';
import {
  getPromptOtherVariable,
  getPromptVariable,
} from '../../selectors/prop';
import {
  getCurrentStage,
  getNetworkNodesForType,
  getPromptId,
} from '../../selectors/session';
import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';
import CategoricalListItem from './CategoricalListItem';
import { getExpandedSize, getItemSize } from './helpers';

const isSpecialValue = (value) => {
  if (value === null) {
    return true;
  }
  if (typeof value === 'number' && value < 0) {
    return true;
  }
  return false;
};

/**
 * CategoricalList: Renders a list of categorical bin items
 */
class CategoricalList extends Component {
  constructor(props) {
    super(props);
    this.categoricalListElement = React.createRef();
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    this.colorPresets = [
      getCSSVariableAsString('--nc-cat-color-seq-1'),
      getCSSVariableAsString('--nc-cat-color-seq-2'),
      getCSSVariableAsString('--nc-cat-color-seq-3'),
      getCSSVariableAsString('--nc-cat-color-seq-4'),
      getCSSVariableAsString('--nc-cat-color-seq-5'),
      getCSSVariableAsString('--nc-cat-color-seq-6'),
      getCSSVariableAsString('--nc-cat-color-seq-7'),
      getCSSVariableAsString('--nc-cat-color-seq-8'),
      getCSSVariableAsString('--nc-cat-color-seq-9'),
      getCSSVariableAsString('--nc-cat-color-seq-10'),
    ];
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
    this.onResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize = throttle(() => {
    this.forceUpdate();
  }, 1000 / 60);

  get binSizes() {
    const { bins } = this.props;

    if (!this.categoricalListElement.current) {
      return [];
    }

    const categoricalListElement = this.categoricalListElement.current;

    const bounds = getAbsoluteBoundingRect(categoricalListElement);

    const expandedSize = getExpandedSize(bounds);

    const itemSize = getItemSize(bounds, bins.length, this.isExpanded);

    return {
      expandedSize,
      itemSize,
    };
  }

  get isExpanded() {
    const { expandedBinIndex } = this.props;
    return expandedBinIndex !== null;
  }

  getCatColor = (itemNumber, bin) => {
    if (itemNumber < 0) {
      return null;
    }
    const categoryColor =
      this.colorPresets[itemNumber % this.colorPresets.length];

    if (isSpecialValue(bin.value)) {
      return color(categoryColor).desaturate(0.6).darken(0.5).toString();
    }

    return categoryColor;
  };

  getBinSize = (index) => {
    const { expandedBinIndex } = this.props;
    return expandedBinIndex === index
      ? this.binSizes.expandedSize
      : this.binSizes.itemSize;
  };

  renderCategoricalBins = () => {
    const {
      bins,
      promptId,
      stageId,
      activePromptVariable,
      promptOtherVariable,
      onExpandBin,
      expandedBinIndex,
    } = this.props;

    return bins.map((bin, index) => (
      <CategoricalListItem
        id={`CATBIN_ITEM_${stageId}_${promptId}_${index}`}
        key={index}
        index={index}
        bin={bin}
        size={this.getBinSize(index)}
        activePromptVariable={activePromptVariable}
        promptOtherVariable={promptOtherVariable}
        accentColor={this.getCatColor(index, bin)}
        onExpandBin={onExpandBin}
        isExpanded={expandedBinIndex === index}
      />
    ));
  };

  render() {
    const { bins, expandedBinIndex, onExpandBin } = this.props;

    const listClasses = cx(
      'categorical-list',
      `categorical-list--items--${bins.length}`,
      { 'categorical-list--expanded': expandedBinIndex !== null },
    );

    // Render before filter, because we need to preserve order for colors.
    const categoricalBins = this.renderCategoricalBins();

    const expandedBin = categoricalBins[expandedBinIndex];

    const otherBins = categoricalBins.filter(
      (_, index) => index !== expandedBinIndex,
    );

    return (
      <div
        className={listClasses}
        ref={this.categoricalListElement}
        onClick={(e) => {
          // Allow resetting the expanded bin by clicking outside the bin
          e.stopPropagation();
          onExpandBin();
        }}
      >
        <Flipper flipKey={expandedBinIndex} className="categorical-list__items">
          {expandedBin}
          {otherBins}
        </Flipper>
      </div>
    );
  }
}

CategoricalList.propTypes = {
  activePromptVariable: PropTypes.string.isRequired,
  promptOtherVariable: PropTypes.string,
  bins: PropTypes.array.isRequired,
  prompt: PropTypes.object.isRequired,
  stage: PropTypes.object.isRequired,
  expandedBinIndex: PropTypes.number,
  onExpandBin: PropTypes.func.isRequired,
};

const matchVariable = (node, variable, value) =>
  node[entityAttributesProperty][variable] &&
  node[entityAttributesProperty][variable].includes(value);

const hasOtherVariable = (node, otherVariable) =>
  otherVariable && node[entityAttributesProperty][otherVariable] !== null;

const matchBin = (bin, variable) => (node) =>
  matchVariable(node, variable, bin.value) ||
  hasOtherVariable(node, bin.otherVariable);

const appendNodesForBin = (nodes, activePromptVariable) => (bin) => ({
  ...bin,
  nodes: nodes.filter(matchBin(bin, activePromptVariable)),
});

function makeMapStateToProps() {
  const getCategoricalValues = makeGetVariableOptions(true);

  return function mapStateToProps(state, props) {
    const stage = getCurrentStage(state);
    const promptId = getPromptId(state);
    const stageNodes = getNetworkNodesForType(state, props);
    const activePromptVariable = getPromptVariable(state, props);
    const [promptOtherVariable, promptOtherVariablePrompt] =
      getPromptOtherVariable(state, props);
    const bins = getCategoricalValues(state, props).map(
      appendNodesForBin(stageNodes, activePromptVariable),
    );

    return {
      stageId: stage.id,
      prompt: promptId,
      activePromptVariable,
      promptOtherVariable,
      promptOtherVariablePrompt,
      bins,
    };
  };
}

export default compose(
  connect(makeMapStateToProps),
  MonitorDragSource(['isDragging', 'meta']),
)(CategoricalList);
