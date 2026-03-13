
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Dimensions } from 'react-native';
import { Spacing, FontSize, FontWeight, Colors } from '../theme';

const { width } = Dimensions.get('window');

const LoadingDotsEnhanced = () => {
    const animation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animation, {
                    toValue: 4,
                    duration: 2000, // Slower animation (2s)
                    useNativeDriver: false,
                }),
                Animated.delay(500), // Wait a bit before repeating
                Animated.timing(animation, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: false
                })
            ])
        ).start();
    }, []);

    const dots = [0, 1, 2, 3];

    return (
        <View style={styles.dotsContainer}>
            {dots.map((index) => {
                // Determine color based on animation value
                // We want the dot to be orange when animation is close to index

                const color = animation.interpolate({
                    inputRange: [index - 0.5, index, index + 0.5],
                    outputRange: ['#E0E0E0', Colors.light.primary, '#E0E0E0'],
                    extrapolate: 'clamp',
                });

                const scale = animation.interpolate({
                    inputRange: [index - 0.5, index, index + 0.5],
                    outputRange: [1, 1.2, 1],
                    extrapolate: 'clamp',
                });

                return (
                    <Animated.View
                        key={index}
                        style={[
                            styles.dot,
                            {
                                backgroundColor: color,
                                transform: [{ scale }]
                            }
                        ]}
                    />
                );
            })}
        </View>
    );
};

const LoadingScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/kasiraja_main_logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />

            <View style={styles.loadingContainer}>
                <LoadingDotsEnhanced />
                <Text style={styles.text}>Mohon tunggu sebentar...</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: width * 0.6,
        height: 100, // Adjust based on aspect ratio
        marginBottom: Spacing.xxl,
    },
    loadingContainer: {
        alignItems: 'center',
        gap: Spacing.md,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 12,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    text: {
        fontSize: FontSize.md,
        color: '#888888',
        marginTop: Spacing.sm,
        fontWeight: FontWeight.medium,
    },
});

export default LoadingScreen;
