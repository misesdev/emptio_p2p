import "react-native-reanimated"
import "react-native-gesture-handler"
import "react-native-get-random-values"

import { enableScreens } from "react-native-screens";
enableScreens()

import "./libs/global"

import React from 'react';
import { StyleSheet, View } from 'react-native'
import AppNavigator from "./src/routes/AppNavigator";
import SplashScreen from "./src/components/general/SplashScreen";
import useBootApp from "./src/hooks/useBootApp";
import { TranslateProvider } from "./src/providers/TranslateProvider";
import { AuthProvider } from "./src/context/AuthContext";
import theme from './src/theme';

export default function App(): React.JSX.Element {

    const { loading } = useBootApp()

    if(loading) return <SplashScreen />

    return (
        <View style={styles.root}>
            <TranslateProvider>
                <AuthProvider>
                    <AppNavigator />
                </AuthProvider>
            </TranslateProvider>
        </View>
    )
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.black }
})


