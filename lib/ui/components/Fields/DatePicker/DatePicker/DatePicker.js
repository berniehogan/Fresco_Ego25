import {
  DATE_FORMATS,
  DEFAULT_MIN_DATE,
  DEFAULT_TYPE,
} from '@codaco/protocol-validation';
import { DateTime, Interval } from 'luxon';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import DatePickerContext from './DatePickerContext';
import { isComplete, isEmpty, now } from './helpers';

/**
 * Get date object from an ISO string
 */
const getDate = (dateString) => {
  const { year, month, day } = dateString
    ? DateTime.fromISO(dateString).toObject()
    : {
        month: null,
        day: null,
        year: null,
      };
  return { year, month, day };
};

const DatePicker = ({
  children,
  date,
  min,
  max,
  onChange,
  type = DEFAULT_TYPE,
}) => {
  const [pickerState, setPickerState] = useState({
    date: getDate(date),
  });

  // Correctly update component state when passed new date prop
  useEffect(() => {
    setPickerState((state) => ({
      ...state,
      date: getDate(date),
    }));
  }, [date]);

  const typeWithDefault = type || DEFAULT_TYPE;

  const format = DATE_FORMATS[typeWithDefault];

  const minWithDefault = min
    ? DateTime.fromISO(min)
    : now().minus(DEFAULT_MIN_DATE);

  const maxWithDefault = max ? DateTime.fromISO(max) : now();

  const range = Interval.fromDateTimes(
    minWithDefault.startOf('day'),
    maxWithDefault.endOf('day'),
  );

  const handleOnChange = (values) => {
    const newDate = { ...pickerState.date, ...values };

    setPickerState((state) => ({
      ...state,
      date: newDate,
    }));

    if (isEmpty(type)(newDate)) {
      onChange?.('');
      return;
    }

    if (isComplete(type)(newDate)) {
      const dateString = DateTime.fromObject(newDate).toFormat(format);
      onChange?.(dateString);
    }
  };

  const context = {
    onChange: handleOnChange,
    range,
    type,
    ...pickerState,
  };

  return (
    <DatePickerContext.Provider value={context}>
      {children}
    </DatePickerContext.Provider>
  );
};

DatePicker.propTypes = {
  children: PropTypes.node,
  date: PropTypes.string,
  type: PropTypes.oneOf([...Object.keys(DATE_FORMATS)]),
  min: PropTypes.string,
  max: PropTypes.string,
  onChange: PropTypes.func,
};

export default DatePicker;
