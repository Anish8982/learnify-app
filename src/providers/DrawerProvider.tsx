import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, View } from 'react-native';
import { CustomDrawer } from '../components/CustomDrawer';
import { drawerEvents } from '../lib/drawerEvents';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.78;

export function DrawerProvider({ children }: { children: React.ReactNode }) {
    const [visible, setVisible] = useState(false);
    const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    const openDrawer = () => {
        setVisible(true);
        Animated.parallel([
            Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
                damping: 20,
                stiffness: 180,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closeDrawer = () => {
        Animated.parallel([
            Animated.timing(translateX, {
                toValue: -DRAWER_WIDTH,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 220,
                useNativeDriver: true,
            }),
        ]).start(() => setVisible(false));
    };

    // Register with the event emitter so any screen can call drawerEvents.open()
    useEffect(() => {
        drawerEvents.setOpenListener(openDrawer);
        drawerEvents.setCloseListener(closeDrawer);
        return () => {
            drawerEvents.setOpenListener(() => { });
            drawerEvents.setCloseListener(() => { });
        };
    }, []);

    return (
        <View style={{ flex: 1 }}>
            {children}

            {visible && (
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999,
                    }}
                    pointerEvents="box-none"
                >
                    {/* Backdrop */}
                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            opacity: backdropOpacity,
                        }}
                    >
                        <Pressable style={{ flex: 1 }} onPress={closeDrawer} />
                    </Animated.View>

                    {/* Drawer panel */}
                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            width: DRAWER_WIDTH,
                            transform: [{ translateX }],
                            zIndex: 1000,
                        }}
                    >
                        <CustomDrawer onClose={closeDrawer} />
                    </Animated.View>
                </View>
            )}
        </View>
    );
}
