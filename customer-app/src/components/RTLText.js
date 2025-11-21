import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useLocalizationStore } from '../stores/localizationStore';
import COLORS from '../constants/colors';

const RTLText = ({
  children,
  style,
  variant = 'body', // body, title, caption, etc.
  color = 'text',
  align = 'auto', // auto, left, right, center
  ...props
}) => {
  const localizationStore = useLocalizationStore();
  const isRTL = localizationStore.isRTL;
  const getTextAlign = localizationStore.getTextAlign || (() => (isRTL ? 'right' : 'left'));

  const variantStyles = {
    body: { fontSize: 16, fontWeight: 'normal' },
    body2: { fontSize: 14, fontWeight: 'normal' },
    body3: { fontSize: 12, fontWeight: 'normal' },
    caption: { fontSize: 11, fontWeight: 'normal' },
    title: { fontSize: 18, fontWeight: 'bold' },
    h4: { fontSize: 20, fontWeight: 'bold' },
    h5: { fontSize: 18, fontWeight: 'bold' },
    h6: { fontSize: 16, fontWeight: 'bold' },
    button: { fontSize: 16, fontWeight: 'bold' },
  };

  const colorMap = {
    text: COLORS.text,
    secondary: COLORS.textSecondary,
    primary: COLORS.primary,
    white: COLORS.card,
    danger: COLORS.danger,
    success: COLORS.success,
    warning: COLORS.warning,
  };

  const baseTextStyle = StyleSheet.flatten([
    variantStyles[variant],
    { color: colorMap[color] || COLORS.text },
    style,
  ]);

  // Apply RTL transformations
  const textAlign = align === 'auto' ? getTextAlign() : align;
  const rtlStyle = {
    ...baseTextStyle,
    textAlign,
    writingDirection: isRTL ? 'rtl' : 'ltr',
  };

  return (
    <Text style={rtlStyle} {...props}>
      {children}
    </Text>
  );
};

export default RTLText;
