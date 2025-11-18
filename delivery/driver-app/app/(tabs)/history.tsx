import { View, Text, StyleSheet } from 'react-native';

export default function HistoryTabScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>سجل الطلبات</Text>
      <Text>شاشة سجل الطلبات السابقة</Text>
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