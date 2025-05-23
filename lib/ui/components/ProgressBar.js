import cx from 'classnames';
import PropTypes from 'prop-types';

const fillerValue = (orientation, percentProgress) => {
  const property = orientation === 'horizontal' ? 'width' : 'height';

  return {
    [property]: `${percentProgress}%`,
  };
};

const ProgressBar = ({
  indeterminate = false,
  onClick,
  orientation = 'vertical',
  percentProgress = 0,
  nudge = true,
}) => (
  <div
    className={cx('progress-bar', `progress-bar--${orientation}`, {
      'progress-bar--indeterminate': indeterminate || percentProgress === null,
      'progress-bar--complete': percentProgress === 100 && nudge,
    })}
    onClick={onClick?.()}
  >
    <div
      className="progress-bar__filler"
      style={fillerValue(orientation, percentProgress)}
    />
  </div>
);

ProgressBar.propTypes = {
  indeterminate: PropTypes.bool,
  onClick: PropTypes.func,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  percentProgress: PropTypes.number,
  nudge: PropTypes.bool,
};

export default ProgressBar;
