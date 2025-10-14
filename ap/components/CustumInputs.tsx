import React, { useState } from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";

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

  const baseBorder = error ? "border-red-500/80" : "border-gray-600/90";
  const labelColor = error
    ? "text-red-300"
    : isActive
      ? "text-gray-200"
      : "text-gray-400";

  return (
    <View className="relative mb-6">
      <TextInput
        className={`font-inter pt-6 pb-3 h-16 cursor-default bg-gray-800/50 backdrop-blur-sm rounded-2xl px-5 text-white text-base border-2 transition-all duration-200 ${baseBorder} ${
          isFocused ? 'border-violet-400 bg-gray-700/50' : 'border-gray-600/50'
        }`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChangeText={handleChange}
        placeholder=""
        value={value as any}
        placeholderTextColor="rgba(255,255,255,0.4)"
        {...restProps}
      />
      <Text
        className={`font-inter-medium absolute left-5 transition-all duration-200 ${
          isActive ? "top-2 text-xs text-gray-300" : "top-5 text-base text-gray-400"
        }`}
      >
        {label}
      </Text>
      {error ? (
        <Text className="font-inter text-xs text-red-400 mt-2 ml-1">{error}</Text>
      ) : null}
    </View>
  );
};

export default CustumInput;
