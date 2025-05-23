import cx from 'classnames';
import PropTypes from 'prop-types';
import { memo, useId } from 'react';
import MarkdownLabel from './MarkdownLabel';

const Checkbox = (props) => {
  const {
    label,
    className = '',
    input,
    disabled = false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fieldLabel,
    ...rest
  } = props;

  const id = useId();

  const componentClasses = cx('form-field-checkbox', className, {
    'form-field-checkbox--disabled': disabled,
  });

  return (
    <label className={componentClasses} htmlFor={id.current}>
      <input
        className="form-field-checkbox__input"
        id={id.current}
        // input.checked is only provided by redux form if type="checkbox" or type="radio" is
        // provided to <Field />, so for the case that it isn't we can rely on the more reliable
        // input.value
        checked={!!input.value}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...input}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...rest}
        type="checkbox"
      />
      <div className="form-field-checkbox__checkbox" />
      {label && (
        <MarkdownLabel
          inline
          label={label}
          className="form-field-inline-label"
        />
      )}
    </label>
  );
};

Checkbox.propTypes = {
  label: PropTypes.node,
  fieldLabel: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  input: PropTypes.object.isRequired,
};

const areEqual = (prevProps, nextProps) => {
  const {
    input: { value: prevValue },
    ...prevRest
  } = prevProps;
  const {
    input: { value: nextValue },
    ...nextRest
  } = nextProps;

  return prevValue === nextValue && prevRest === nextRest;
};

export default memo(Checkbox, areEqual);
