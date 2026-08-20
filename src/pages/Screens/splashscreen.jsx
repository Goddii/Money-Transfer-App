import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

         <Text style=