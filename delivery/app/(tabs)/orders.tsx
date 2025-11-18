import { View, Text, StyleSheet } from 'react-native';
import ProtectedRoute from '../../src/components/ProtectedRoute';

export default function OrdersTabScreen() {
  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <Text style={styles.title}>طلباتي</Text>
        <Text>شاشة الطلبات النشطة</Text>
      </View>
    </ProtectedRoute>
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