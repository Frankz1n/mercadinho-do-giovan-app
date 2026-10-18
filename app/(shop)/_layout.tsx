import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ShopBottomBar } from '@/components/ui';

export default function ShopLayout() {
  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }} />
      <ShopBottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
