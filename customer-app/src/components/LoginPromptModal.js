import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import COLORS from '../constants/colors';
import SIZES from '../constants/sizes';

const LoginPromptModal = ({
  visible,
  onClose,
  onLogin,
  message = 'يجب تسجيل الدخول أولاً لتنفيذ هذه العملية',
}) => {
  const handleLogin = () => {
    onLogin();
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="lock-outline" size={48} color={COLORS.primary} />
          </View>

          <Text style={styles.title}>تسجيل الدخول مطلوب</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    margin: SIZES.padding,
    width: '90%',
    maxWidth: 400,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  title: {
    fontSize: SIZES.h5,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.base,
  },
  message: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.padding,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.base,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.text,
  },
  loginButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.card,
  },
});

export default LoginPromptModal;
