import { omit } from 'es-toolkit';
import { filter, isEmpty, some } from 'es-toolkit/compat';

const UPSERT_TARGET = 'DRAG_AND_DROP/UPSERT_TARGET';
const RENAME_TARGET = 'DRAG_AND_DROP/RENAME_TARGET';
const REMOVE_TARGET = 'DRAG_AND_DROP/REMOVE_TARGET';
const UPSERT_OBSTACLE = 'DRAG_AND_DROP/UPSERT_OBSTACLE';
const REMOVE_OBSTACLE = 'DRAG_AND_DROP/REMOVE_OBSTACLE';
const DRAG_START = 'DRAG_AND_DROP/DRAG_START';
const DRAG_MOVE = 'DRAG_AND_DROP/DRAG_MOVE';
const DRAG_END = 'DRAG_AND_DROP/DRAG_END';

const initialState = {
  targets: [],
  obstacles: [],
  source: null,
};

const defaultSource = {
  meta: {},
};

// Since accepts() is a weak link and can throw errors if not carefully written.
const willAccept = (accepts, source) => {
  try {
    return accepts({
      ...defaultSource,
      ...source,
    });
  } catch (e) {
    console.warn('Error in accept() function', e, source); // eslint-disable-line no-console
    return false;
  }
};

const markOutOfBounds = (source) => {
  const isOutOfBounds =
    source.x > window.innerWidth ||
    source.x < 0 ||
    source.y > window.innerHeight ||
    source.y < 0;

  return isOutOfBounds;
};

const markHitTarget = ({ target, source }) => {
  if (!source) {
    return { ...target, isOver: false, willAccept: false };
  }

  const isOver =
    source.x >= target.x &&
    source.x <= target.x + target.width &&
    source.y >= target.y &&
    source.y <= target.y + target.height;

  return {
    ...target,
    isOver,
    willAccept: target.accepts ? willAccept(target.accepts, source) : false,
  };
};

const markHitTargets = ({ targets, source }) =>
  targets.map((target) => markHitTarget({ target, source }));

const markHitSource = ({ targets, source }) => {
  if (isEmpty(source)) {
    return source;
  }

  return {
    ...source,
    isOver: filter(targets, 'isOver').length > 0,
    isOutOfBounds: markOutOfBounds(source),
  };
};

const markHitAll = ({ targets, obstacles, source, ...rest }) => {
  const targetsWithHits = markHitTargets({ targets, source });
  const obstaclesWithHits = markHitTargets({ targets: obstacles, source });
  const sourceWithHits = markHitSource({ targets: targetsWithHits, source });

  return {
    ...rest,
    targets: targetsWithHits,
    obstacles: obstaclesWithHits,
    source: sourceWithHits,
  };
};

const resetHits = ({ targets, ...rest }) => ({
  targets: targets.map((target) => omit(target, ['isOver', 'willAccept'])),
  ...rest,
});

const triggerDrag = (state, source) => {
  const hits = markHitAll({
    ...state,
    source: {
      ...state.source,
      ...source,
    },
  });

  source.setValidMove(true);

  if (some(hits.obstacles, { isOver: true }) || hits.source.isOutOfBounds) {
    source.setValidMove(false);
    return;
  }

  filter(hits.targets, { isOver: true, willAccept: true }).forEach((target) => {
    source.setValidMove(true);
    target.onDrag?.(hits.source);
  });
};

const triggerDrop = (state, source) => {
  const hits = markHitAll({
    ...state,
    source: {
      ...state.source,
      ...source,
    },
  });

  filter(hits.targets, { willAccept: true }).forEach((target) => {
    target.onDragEnd?.(hits.source);
  });

  if (some(hits.obstacles, { isOver: true })) {
    return;
  }

  filter(hits.targets, { isOver: true, willAccept: true }).forEach((target) => {
    target.onDrop(hits.source);
  });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPSERT_TARGET: {
      const targets = [
        ...filter(state.targets, (target) => target.id !== action.target.id),
        markHitTarget({ target: action.target, source: state.source }),
      ];

      const source = markHitSource({
        targets,
        source: state.source,
      });

      return {
        ...state,
        targets,
        source,
      };
    }
    case RENAME_TARGET:
      return {
        ...state,
        targets: state.targets.map((target) => {
          if (action.from !== target.id) {
            return target;
          }

          return {
            ...target,
            id: action.to,
          };
        }),
      };
    case REMOVE_TARGET: {
      const targets = filter(
        state.targets,
        (target) => target.id !== action.id,
      );
      const source = markHitSource({ targets, source: state.source });
      return {
        ...state,
        targets,
        source,
      };
    }
    case UPSERT_OBSTACLE: {
      const obstacles = [
        ...filter(
          state.obstacles,
          (obstacle) => obstacle.id !== action.obstacle.id,
        ),
        markHitTarget({ target: action.obstacle, source: state.source }),
      ];

      const source = markHitSource({
        targets: obstacles,
        source: state.source,
      });

      return {
        ...state,
        obstacles,
        source,
      };
    }
    case REMOVE_OBSTACLE: {
      const obstacles = filter(
        state.obstacles,
        (obstacle) => obstacle.id !== action.id,
      );
      const source = markHitSource({
        targets: obstacles,
        source: state.source,
      });

      return {
        ...state,
        obstacles,
        source,
      };
    }
    case DRAG_START: {
      return markHitAll({
        ...state,
        source: action.source,
      });
    }
    case DRAG_MOVE:
      if (state.source === null) {
        return state;
      }

      return markHitAll({
        ...state,
        source: {
          ...state.source,
          ...action.source,
        },
      });
    case DRAG_END:
      return resetHits({
        ...state,
        source: null,
      });
    default:
      return state;
  }
};

function upsertTarget(data) {
  return {
    type: UPSERT_TARGET,
    target: data,
  };
}

function renameTarget({ from, to }) {
  return {
    type: RENAME_TARGET,
    from,
    to,
  };
}

function removeTarget(id) {
  return {
    type: REMOVE_TARGET,
    id,
  };
}

function upsertObstacle(data) {
  return {
    type: UPSERT_OBSTACLE,
    obstacle: data,
  };
}

function removeObstacle(id) {
  return {
    type: REMOVE_OBSTACLE,
    id,
  };
}

function dragStart(data) {
  return {
    type: DRAG_START,
    source: data,
  };
}

function dragMove(data) {
  return (dispatch, getState) => {
    triggerDrag(getState(), data);

    dispatch({
      type: DRAG_MOVE,
      source: data,
    });
  };
}

function dragEnd(data) {
  return (dispatch, getState) => {
    triggerDrop(getState(), data);

    dispatch({
      type: DRAG_END,
    });
  };
}

const actionCreators = {
  upsertTarget,
  renameTarget,
  removeTarget,
  upsertObstacle,
  removeObstacle,
  dragStart,
  dragMove,
  dragEnd,
};

export { actionCreators };

export default reducer;
