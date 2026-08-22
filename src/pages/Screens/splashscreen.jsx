import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector/icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen({ navigation }) {
  const handleGetStarted = () => {
    // If you have React Navigation set up:
    navigation?.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#07182C', '#0B4140']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.container}
      >

        {/* Lightning Icon */}
        <View style={styles.iconContainer}>
          <Ionicons
            name="flash-outline"
            size={25}
            color="#FFFFFF"
          />
        </View>

        {/* Vyloc Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>
            Vyloc
          </Text>

          <Text style={styles.tagline}>
            Fast. Secure. Effortless.
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.button}
          onPress={handleGetStarted}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07182C',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#F7941D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '700',
    marginBottom: 8,
  },
  tagline: {
    color: '#A4A9BF',
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#F7941D',
    borderRadius: 40,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
