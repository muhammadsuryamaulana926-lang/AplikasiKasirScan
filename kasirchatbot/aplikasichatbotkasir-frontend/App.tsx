import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { registerRootComponent } from 'expo';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from './contexts/ThemeContext';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#007AFF',
    surface: '#FFFFFF',
    background: '#FFFFFF',
    onSurface: '#000000',
  },
};

const App = () => {
  return (
    <ThemeProvider>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <AppNavigator />
        </SafeAreaProvider>
      </PaperProvider>
    </ThemeProvider>
  );
};

registerRootComponent(App);
export default App;