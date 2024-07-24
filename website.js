import React from 'react';
import { Button, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { WebView } from 'react-native-webview';

const Stack = createStackNavigator();

const HomeScreen = ({ navigation }) => {
  const openLink = () => {
    navigation.navigate('WebScreen', { url: 'https://www.google.com' });
  };

  return (
    <View style={styles.container}>
      <Button title="Open Link" onPress={openLink} />
    </View>
  );
};

const WebScreen = ({ route }) => {
  const { url } = route.params;

  return (
    <View style={styles.container}>
      <WebView source={{ uri: url }} />
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="WebScreen" component={WebScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
