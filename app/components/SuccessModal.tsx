// components/SuccessModal.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { RFValue } from 'react-native-responsive-fontsize';

interface SuccessModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  duration?: number; // in milliseconds
}

const { width } = Dimensions.get('window');

const SuccessModal: React.FC<SuccessModalProps> = ({
  isVisible,
  onClose,
  title = 'Succès !',
  message = 'Opération réussie.',
  duration = 3000,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <LottieView
          source={require('../images/success.json')} // Ensure this path is correct
          autoPlay
          loop={false}
          style={styles.lottie}
        />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent backdrop
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.7,
    backgroundColor: '#E8F6EF', // Green background for success
    borderRadius: 16,
    alignItems: 'center',
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  lottie: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: '#065F46',
    textAlign: 'center',
    marginBottom: 5,
  },
  message: {
    fontSize: RFValue(14),
    color: '#047857',
    textAlign: 'center',
  },
});

export default SuccessModal;