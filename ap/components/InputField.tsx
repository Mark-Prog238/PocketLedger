import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

const CustumInput: React.FC<Props> = ({ label, error, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasText, setHasText] = useState(false);

  const { onChangeText: onChangeTextProp, value, ...restProps } = props;

  const handleChange = (text: string) => {
    setHasText(text.trim().length > 0);
    onChangeTextProp?.(text);
  };

  const hasValue = value?.toString().trim().length! > 0 || hasText;
  const isActive = hasValue || isFocused;

  const baseBorder = error ? 'border-red-500/80' : 'border-gray-600/90';
  const labelColor = error ? 'text-red-300' : isActive ? 'text-gray-200' : 'text-gray-400';

  return (
    <View className="relative mb-4">
      <TextInput
        className={`pt-4 pb-3 cursor-default bg-gray-700/85 rounded-xl px-4 text-white text-base border ${baseBorder}`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChangeText={handleChange}
        placeholder=""
        value={value as any}
        {...restProps}
      />
      <Text
        className={`absolute left-4 transition-all duration-200 ${
          isActive ? 'top-1 text-xs' : 'top-3.5 text-base'
        } ${labelColor}`}
      >
        {label}
      </Text>
      {error ? (
        <Text className="text-xs text-red-400 mt-1 ml-1">{error}</Text>
      ) : null}
    </View>
  );
};

export default CustumInput;


