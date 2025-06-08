import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Modal, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RFValue } from 'react-native-responsive-fontsize';
import { useOrientation } from '../hooks/shared/useOrientation';
import { isAuthenticated } from '../hooks/shared/useIsAuthenticated';


const CryptoWalletScreen = () => {
  const router = useRouter();
  const isLandscape = useOrientation();

  const [auth, setAuth] = useState<boolean | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showUserAgreement, setShowUserAgreement] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      setAuth(authenticated);
    };
    checkAuth();
  }, []);

  if (auth === null) return null;

  // 🔁 If already authenticated, redirect to main app tabs
  if (auth) {
    return <Redirect href="/(tabs)/Home" />;
  }

  const UserAgreementModal = () => (
    <Modal
      visible={showUserAgreement}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB'
        }}>
          <Text style={{ 
            fontSize: RFValue(18), 
            fontWeight: 'bold',
            fontFamily: 'Inter-Bold'
          }}>
            User Agreement
          </Text>
          <TouchableOpacity onPress={() => setShowUserAgreement(false)}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Text style={{ 
            fontSize: RFValue(16), 
            lineHeight: 24, 
            marginBottom: 16,
            fontFamily: 'Inter-Regular'
          }}>
            <Text style={{ fontWeight: 'bold' }}>Effective Date:</Text> {new Date().toLocaleDateString()}
          </Text>
          
          <Text style={{ 
            fontSize: RFValue(14), 
            lineHeight: 22, 
            marginBottom: 16,
            fontFamily: 'Inter-Regular'
          }}>
            Welcome to CustWallet. By using our application, you agree to the following terms and conditions:
          </Text>

          <Text style={{ 
            fontSize: RFValue(16), 
            fontWeight: 'bold', 
            marginBottom: 8,
            fontFamily: 'Inter-Bold'
          }}>
            1. Acceptance of Terms
          </Text>
          <Text style={{ 
            fontSize: RFValue(14), 
            lineHeight: 22, 
            marginBottom: 16,
            fontFamily: 'Inter-Regular'
          }}>
            By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.
          </Text>

          <Text style={{ 
            fontSize: RFValue(16), 
            fontWeight: 'bold', 
            marginBottom: 8,
            fontFamily: 'Inter-Bold'
          }}>
            2. Use of Service
          </Text>
          <Text style={{ 
            fontSize: RFValue(14), 
            lineHeight: 22, 
            marginBottom: 16,
            fontFamily: 'Inter-Regular'
          }}>
            You may use our service for lawful purposes only. You agree not to use the service for any fraudulent or unauthorized purpose.
          </Text>

          <Text style={{ 
            fontSize: RFValue(16), 
            fontWeight: 'bold', 
            marginBottom: 8,
            fontFamily: 'Inter-Bold'
          }}>
            3. Security
          </Text>
          <Text style={{ 
            fontSize: RFValue(14), 
            lineHeight: 22, 
            marginBottom: 16,
            fontFamily: 'Inter-Regular'
          }}>
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
          </Text>

          <Text style={{ 
            fontSize: RFValue(16), 
            fontWeight: 'bold', 
            marginBottom: 8,
            fontFamily: 'Inter-Bold'
          }}>
            4. Cryptocurrency Risks
          </Text>
          <Text style={{ 
            fontSize: RFValue(14), 
            lineHeight: 22, 
            marginBottom: 16,
            fontFamily: 'Inter-Regular'
          }}>
            Cryptocurrency investments carry significant risk. The value of digital assets can be volatile and may result in partial or total loss of your investment.
          </Text>

          <Text style={{ 
            fontSize: RFValue(16), 
            fontWeight: 'bold', 
            marginBottom: 8,
            fontFamily: 'Inter-Bold'
          }}>
            5. Limitation of Liability
          </Text>
          <Text style={{ 
            fontSize: RFValue(14), 
            lineHeight: 22, 
            marginBottom: 16,
            fontFamily: 'Inter-Regular'
          }}>
            We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
          </Text>

          <Text style={{ 
            fontSize: RFValue(16), 
            fontWeight: 'bold', 
            marginBottom: 8,
            fontFamily: 'Inter-Bold'
          }}>
            6. Changes to Terms
          </Text>
          <Text style={{ 
            fontSize: RFValue(14), 
            lineHeight: 22, 
            marginBottom: 32,
            fontFamily: 'Inter-Regular'
          }}>
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const PrivacyPolicyModal = () => (
    <Modal
      visible={showPrivacyPolicy}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB'
        }}>
          <Text style={{ 
            fontSize: RFValue(18), 
            fontWeight: 'bold',
            fontFamily: 'Inter-Bold'
          }}>
            Privacy Policy
          </Text>
          <TouchableOpacity onPress={() => setShowPrivacyPolicy(false)}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Text style={{ 
            fontSize: RFValue(16), 
            lineHeight: 24, 
            marginBottom: 16,
            fontFamily: 'Inter-Regular'
          }}>
            <Text style={{ fontWeight: 'bold' }}>Effective Date:</Text> {new Date().toLocaleDateString()}
          </Text>
          
          <Text style={{ 
            fontSize: RFValue(14), 
            lineHeight: 22, 
            marginBottom: 16,
            fontFamily: 'Inter-Regular'
          }}>
            This Privacy Policy describes how CustWallet collects, uses, and protects your information when you use our service.
          </Text>

          <Text style={{ 
            fontSize: RFValue(16), 
            fontWeight: 'bold', 
            marginBottom: 8,
            fontFamily: 'Inter-Bold'
          }}>
            1. Information We Collect
          </Text>
          <Text style={{ 
            fontSize: RFValue(14), 
            lineHeight: 22, 
            marginBottom: 16,
            fontFamily: 'Inter-Regular'
          }}>
            We collect information you provide directly to us, such as when you create an account, make transactions, or contact us for support.
          </Text>

          <Text style={{ 
            fontSize: RFValue(16), 
            fontWeight: 'bold', 
            marginBottom: 8,
            fontFamily: 'Inter-Bold'
          }}>
            2. How We Use Your Information
          </Text>
          <Text style={{ 
            fontSize: RFValue(14), 
            lineHeight: 22, 
            marginBottom: 16,
            fontFamily: 'Inter-Regular'
          }}>
            We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
          </Text>

          <Text style={{ 
            fontSize: RFValue(16), 
            fontWeight: 'bold', 
            marginBottom: 8,
            fontFamily: 'Inter-Bold'
          }}>
            3. Information Sharing
          </Text>
          <Text style={{ 
            fontSize: RFValue(14), 
            lineHeight: 22, 
            marginBottom: 16,
            fontFamily: 'Inter-Regular'
          }}>
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
          </Text>

          <Text style={{ 
            fontSize: RFValue(16), 
            fontWeight: 'bold', 
            marginBottom: 8,
            fontFamily: 'Inter-Bold'
          }}>
            4. Data Security
          </Text>
          <Text style={{ 
            fontSize: RFValue(14), 
            lineHeight: 22, 
            marginBottom: 16,
            fontFamily: 'Inter-Regular'
          }}>
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </Text>

          <Text style={{ 
            fontSize: RFValue(16), 
            fontWeight: 'bold', 
            marginBottom: 8,
            fontFamily: 'Inter-Bold'
          }}>
            5. Cookies and Tracking
          </Text>
          <Text style={{ 
            fontSize: RFValue(14), 
            lineHeight: 22, 
            marginBottom: 16,
            fontFamily: 'Inter-Regular'
          }}>
            We may use cookies and similar tracking technologies to enhance your experience and gather information about visitors and visits to our application.
          </Text>

          <Text style={{ 
            fontSize: RFValue(16), 
            fontWeight: 'bold', 
            marginBottom: 8,
            fontFamily: 'Inter-Bold'
          }}>
            6. Your Rights
          </Text>
          <Text style={{ 
            fontSize: RFValue(14), 
            lineHeight: 22, 
            marginBottom: 16,
            fontFamily: 'Inter-Regular'
          }}>
            You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.
          </Text>

          <Text style={{ 
            fontSize: RFValue(16), 
            fontWeight: 'bold', 
            marginBottom: 8,
            fontFamily: 'Inter-Bold'
          }}>
            7. Contact Us
          </Text>
          <Text style={{ 
            fontSize: RFValue(14), 
            lineHeight: 22, 
            marginBottom: 32,
            fontFamily: 'Inter-Regular'
          }}>
            If you have any questions about this Privacy Policy, please contact us at privacy@cryptowallet.com
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <LinearGradient
      colors={['rgba(255, 255, 255 ,1)', 'rgba(255, 255, 255,0.5)']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <Animated.View
          entering={FadeInUp.duration(600)}
          style={{
            width: '100%',
            paddingTop: isLandscape ? 8 : 16,
            paddingBottom: isLandscape ? 4 : 8,
            paddingHorizontal: isLandscape ? 24 : 16,
            marginTop: isLandscape ? 0 : 24,
          }}
        >
          <Text
            style={{
              color: 'black',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: isLandscape ? 24 : 32,
              fontFamily: 'Inter-Black',
            }}
          >
            CustWallet
          </Text>
        </Animated.View>

        {/* Lottie Animation */}
        <Animated.View className='opacity-50'
          entering={FadeIn.duration(600)}
          style={{
            width: '100%',
            height: isLandscape ? 200 : 250,
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: isLandscape ? 8 : 16,
          }}
        >
          <LottieView
            source={require('../images/splash.json')}
            autoPlay
            loop
            style={{ width: '100%', height: '100%' }}
          />
        </Animated.View>

        {/* Intro */}
        <Animated.View className='pt-0'
          entering={FadeInDown.duration(600).delay(200)}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: isLandscape ? 24 : 16,
          }}
        >
          <Text
            style={{
              color: 'black',
              textAlign: 'center',
              lineHeight: 30,
              fontSize: RFValue(isLandscape ? 14 : 18),
              fontFamily: 'Inter-Regular',
            }}
          >
            Manage your custom asset effortlessly and stay ahead in the digital economy.
          </Text>
        </Animated.View>

        {/* Buttons */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(400)}
          style={{
            width: '100%',
            paddingHorizontal: isLandscape ? 24 : 16,
            paddingBottom: isLandscape ? 16 : 32,
          }}
        >
          {/* Terms and Conditions */}
          <TouchableOpacity
            onPress={() => setTermsAccepted(!termsAccepted)}
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: isLandscape ? 8 : 16,
              paddingHorizontal: 20,
            }}
          >
            <Ionicons 
              name={termsAccepted ? "checkbox" : "square-outline"} 
              size={RFValue(20)} 
              color={termsAccepted ? "#6B5B95" : "#D1D5DB"} 
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                color: '#6B7280',
                fontSize: RFValue(isLandscape ? 7: 9),
                textAlign: 'center',
                flex: 1,
                fontFamily: 'Inter-Regular',
              }}
            >
              I agree to the{' '}
              <Text 
                style={{ 
                  textDecorationLine: 'underline', 
                  color: '#A78BFA',
                  fontWeight: '500'
                }}
                onPress={() => setShowUserAgreement(true)}
              >
                User Agreement
              </Text>{' '}
              and{' '}
              <Text 
                style={{ 
                  textDecorationLine: 'underline', 
                  color: '#A78BFA',
                  fontWeight: '500'
                }}
                onPress={() => setShowPrivacyPolicy(true)}
              >
                Privacy Policy
              </Text>
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: isLandscape ? 16 : 24,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: '#E9D5FF',
                borderRadius: 999,
                paddingVertical: isLandscape ? 8 : 12,
                paddingHorizontal: isLandscape ? 16 : 24,
                marginRight: 16,
              }}
              onPress={() => router.push('/screens/email-verification.screen')}
            >
              <Text
                style={{
                  color: 'black',
                  fontWeight: '500',
                  fontSize: RFValue(isLandscape ? 14 : 16),
                }}
              >
                Learn More
              </Text>
            </TouchableOpacity>

            <Animated.View entering={FadeIn.duration(600).delay(600)}>
              <TouchableOpacity
                style={{
                  borderRadius: 999,
                  paddingVertical: isLandscape ? 8 : 12,
                  paddingHorizontal: isLandscape ? 16 : 24,
                  backgroundColor: termsAccepted ? 'black' : '#D1D5DB',
                }}
                disabled={!termsAccepted}
                onPress={() => {
                  if (termsAccepted) {
                    router.replace(auth ? '/(tabs)/Home' : '/screens/login.screen');
                  }
                }}
              >
                <Text
                  style={{
                    color: termsAccepted ? 'white' : '#9CA3AF',
                    fontWeight: '500',
                    fontSize: RFValue(isLandscape ? 14 : 16),
                  }}
                >
                  Get Started
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>

        <StatusBar style="dark" translucent={false} />

        {/* Modals */}
        <UserAgreementModal />
        <PrivacyPolicyModal />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default CryptoWalletScreen;