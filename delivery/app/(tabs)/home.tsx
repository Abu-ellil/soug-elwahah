import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import ProtectedRoute from '../../src/components/ProtectedRoute';

export default function HomeTabScreen() {
  const { driver } = useAuthStore();

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>مرحباً {driver?.name || 'المستخدم'}!</Text>
          <Text style={styles.subtitle}>الصفحة الرئيسية</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>لوحة التحكم</Text>
          <Text>مرحباً بك في تطبيق التوصيل</Text>
        </View>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
 welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});