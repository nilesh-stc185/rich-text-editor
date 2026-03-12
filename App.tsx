/**
 * Rich Editor Example App
 * @format
 */

import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RichEditorExampleScreen } from './screens/RichEditorExampleScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <RichEditorExampleScreen />
    </SafeAreaProvider>
  );
}

export default App;
