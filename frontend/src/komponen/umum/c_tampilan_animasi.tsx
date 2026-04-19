import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface AnimatedViewProps {
    children: React.ReactNode;
    delay?: number;
    style?: ViewStyle | ViewStyle[];
    duration?: number;
}

/**
 * AnimatedView provides a consistent entrance animation (fade-in + slide-up)
 * for components, making the app feel more dynamic and premium.
 */
const AnimatedView: React.FC<AnimatedViewProps> = ({ children, delay = 0, style, duration = 400 }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(15)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: duration,
                delay: delay,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: duration,
                delay: delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, [delay, duration, fadeAnim, slideAnim]);

    return (
        <Animated.View
            style={[
                style,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            {children}
        </Animated.View>
    );
};

export default AnimatedView;
