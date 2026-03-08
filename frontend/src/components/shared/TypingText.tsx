import React, { useState, useEffect, useRef } from 'react';
import { Text, TextStyle, Animated, View, StyleSheet } from 'react-native';

interface TypingTextProps {
    phrases: string[];
    style?: TextStyle | TextStyle[];
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseTime?: number;
}

const TypingText: React.FC<TypingTextProps> = ({
    phrases,
    style,
    typingSpeed = 70,
    deletingSpeed = 40,
    pauseTime = 2500,
}) => {
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);
    const cursorOpacity = useRef(new Animated.Value(1)).current;

    // Cursor blinking animation
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(cursorOpacity, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(cursorOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [cursorOpacity]);

    // Typing and Deleting logic
    useEffect(() => {
        if (subIndex === phrases[index].length + 1 && !reverse) {
            const timeout = setTimeout(() => setReverse(true), pauseTime);
            return () => clearTimeout(timeout);
        }

        if (subIndex === 0 && reverse) {
            setReverse(false);
            setIndex((prev) => (prev + 1) % phrases.length);
            return;
        }

        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, reverse ? deletingSpeed : typingSpeed);

        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse, phrases, typingSpeed, deletingSpeed, pauseTime]);

    return (
        <View style={styles.container}>
            <Text style={style}>
                {`${phrases[index].substring(0, subIndex)}`}
                <Animated.Text style={[style, { opacity: cursorOpacity, fontWeight: 'bold', color: '#FF7043' }]}>
                    |
                </Animated.Text>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default TypingText;
