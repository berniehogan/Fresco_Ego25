import { noop } from 'es-toolkit';
import { get, isEmpty } from 'es-toolkit/compat';
import { X as ClearIcon, Search as SearchIcon } from 'lucide-react';
import React, { type ComponentProps } from 'react';
import { getCSSVariableAsString } from '../../utils/CSSVariables';
import Text from './Text';

type SearchProps = ComponentProps<typeof Text>;

const Search = (props: SearchProps) => {
  const color = getCSSVariableAsString('--nc-input-text');

  const hasValue = !isEmpty(get(props, ['input', 'value'], ''));

  const onChange = props.input.onChange || noop;

  // Call the change handler with an empty string
  const handleClear = () => {
    const syntheticEvent = {
      target: { value: '' },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  const adornmentLeft = color && <SearchIcon style={{ color }} />;

  const adornmentRight = color && hasValue && (
    <ClearIcon
      style={{
        color,
        cursor: 'pointer',
      }}
      onClick={handleClear}
    />
  );

  return (
    <Text
      adornmentLeft={adornmentLeft}
      adornmentRight={adornmentRight}
      {...props}
      type="search"
    />
  );
};

export default Search;
