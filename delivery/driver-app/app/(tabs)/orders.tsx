import { View, Text, StyleSheet } from 'react-native';

export default function OrdersTabScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>طلباتي</Text>
      <Text>شاشة الطلبات النشطة</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});