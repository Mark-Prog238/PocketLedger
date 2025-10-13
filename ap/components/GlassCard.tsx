import React, { ReactNode } from 'react';
import { View, ViewStyle, StyleSheet, StyleProp, Pressable, PressableProps } from 'react-native';

type GlassCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

// /////////////////////////////////////////////////////
// THIS IS AN ALERT
//  CUSTUM INPUT CARD

type InputCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const InputCard: React.FC<InputCardProps> = ({ children, style }) => (
  <View style={[styles.inputContainer, style]}>{children}</View>
);



// /////////////////////////////////////////////////////
//  CUSTOM BUTTON
type CustomButtonProps = PressableProps & {
  children: ReactNode;
};

export const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  ...rest
}) => (
  <Pressable
    className="
      bg-violet-600
      h-12
      px-4
      rounded-xl
      items-center
      justify-center
      active:bg-violet-900
      disabled:opacity-50
    "
    style={{ elevation: 3 }}
    {...rest}
  >
    {children}
  </Pressable>
);


const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
    alignSelf: 'stretch',
    maxWidth: 360,
    alignItems: 'stretch',
  },
    inputContainer: {
    marginBottom: 14,
  },
});