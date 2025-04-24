import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RFValue } from 'react-native-responsive-fontsize';
import Button from '@/app/components/Button'; // Adjust the import path as needed

interface ConfirmationModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
  isLandscape?: boolean;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title = 'Confirm Action',
  message,
  onConfirm,
  onCancel,
  isPending = false,
  isLandscape = false,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={['#A855F7', '#F472B6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.modalGradient}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalText}>{message}</Text>
            <View style={styles.modalButtons}>
              <View className="w-1/2">
                <Button
                  title={cancelText}
                  onPress={onCancel}
                  isLandscape={isLandscape}
                />
              </View>
              <View className="w-1/2">
                <Button
                  title={confirmText}
                  onPress={onConfirm}
                  isLandscape={isLandscape}
                />
              </View>
            </View>
            {isPending && (
              <ActivityIndicator
                size="small"
                color="#A855F7"
                style={styles.modalLoading}
              />
            )}
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalGradient: {
    borderRadius: 16,
    padding: 2,
    width: '80%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalText: {
    fontSize: RFValue(14),
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalLoading: {
    marginTop: 15,
  },
});

export default ConfirmationModal;