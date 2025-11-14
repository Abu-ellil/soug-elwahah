// لوحة التحكم التفاعلية - Interactive Statistical Dashboard
// ========================================================

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { LineChart, BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCustomersStatistics } from '../../utils/customerManager';
import { translationManager, t } from '../../utils/localization';

// ألوان المخطط - Chart Colors
const CHART_COLORS = {
  primary: '#FF6B35',
  secondary: '#4ECDC4',
  accent: '#FFE66D',
  success: '#06D6A0',
  danger: '#EF476F',
  warning: '#FFA726',
  purple: '#9B59B6',
  blue: '#3498DB',
  green: '#2ECC71',
  orange: '#E67E22',
  red: '#E74C3C',
};

// بيانات وهمية للرسوم البيانية - Mock Data for Charts
const generateMockData = () => {
  const months = [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ];

  const currentMonth = new Date().getMonth();
  const recentMonths = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1);

  return {
    // نمو العملاء - Customer Growth
    customerGrowth: {
      labels: recentMonths,
      datasets: [
        {
          data: [120, 145, 168, 192, 215, 243],
          color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
          strokeWidth: 3,
        },
      ],
      legend: ['عدد العملاء'],
    },

    // الإيرادات الشهرية - Monthly Revenue
    monthlyRevenue: {
      labels: recentMonths,
      datasets: [
        {
          data: [45000, 52000, 48000, 61000, 67000, 73000],
        },
      ],
    },

    // توزيع العملاء حسب النوع - Customer Distribution by Type
    customerTypes: {
      data: [
        {
          name: 'فردي',
          population: 45,
          color: CHART_COLORS.primary,
          legendFontColor: '#333',
          legendFontSize: 14,
        },
        {
          name: 'تجاري',
          population: 35,
          color: CHART_COLORS.secondary,
          legendFontColor: '#333',
          legendFontSize: 14,
        },
        {
          name: 'VIP',
          population: 20,
          color: CHART_COLORS.accent,
          legendFontColor: '#333',
          legendFontSize: 14,
        },
      ],
    },

    // توزيع العملاء حسب الحالة - Customer Distribution by Status
    customerStatus: {
      data: [
        {
          name: 'نشط',
          population: 70,
          color: CHART_COLORS.success,
          legendFontColor: '#333',
          legendFontSize: 14,
        },
        {
          name: 'غير نشط',
          population: 20,
          color: CHART_COLORS.warning,
          legendFontColor: '#333',
          legendFontSize: 14,
        },
        {
          name: 'محظور',
          population: 7,
          color: CHART_COLORS.danger,
          legendFontColor: '#333',
          legendFontSize: 14,
        },
        {
          name: 'في الانتظار',
          population: 3,
          color: CHART_COLORS.purple,
          legendFontColor: '#333',
          legendFontSize: 14,
        },
      ],
    },

    // مستويات الولاء - Loyalty Tiers
    loyaltyTiers: {
      data: [
        {
          name: 'برونزي',
          population: 30,
          color: '#CD7F32',
          legendFontColor: '#333',
          legendFontSize: 14,
        },
        {
          name: 'فضي',
          population: 25,
          color: '#C0C0C0',
          legendFontColor: '#333',
          legendFontSize: 14,
        },
        {
          name: 'ذهبي',
          population: 25,
          color: '#FFD700',
          legendFontColor: '#333',
          legendFontSize: 14,
        },
        {
          name: 'بلاتيني',
          population: 20,
          color: '#E5E4E2',
          legendFontColor: '#333',
          legendFontSize: 14,
        },
      ],
    },

    // أداء المبيعات - Sales Performance
    salesPerformance: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      data: [0.4, 0.6, 0.8, 0.9],
    },

    // متوسط قيمة الطلب - Average Order Value Trend
    averageOrderValue: {
      labels: recentMonths,
      datasets: [
        {
          data: [250, 280, 260, 320, 340, 380],
        },
      ],
    },
  };
};

// مكون بطاقة الإحصائية - Stat Card Component
const StatCard = ({ title, value, change, icon, color, subtitle }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statHeader}>
      <Text style={[styles.statTitle, { color }]}>{title}</Text>
      <Text style={[styles.statIcon, { color }]}>{icon}</Text>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    {change && (
      <Text
        style={[
          styles.statChange,
          { color: change > 0 ? CHART_COLORS.success : CHART_COLORS.danger },
        ]}>
        {change > 0 ? '↗' : '↘'} {Math.abs(change)}%
      </Text>
    )}
  </View>
);

// مكون رسم بياني مخصص - Custom Chart Component
const CustomChart = ({ title, type, data, height = 200 }) => {
  const screenWidth = Dimensions.get('window').width - 40;

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart
            data={data}
            width={screenWidth}
            height={height}
            chartConfig={chartConfig}
            bezier
            style={styles.chartStyle}
          />
        );

      case 'bar':
        return (
          <BarChart
            data={data}
            width={screenWidth}
            height={height}
            chartConfig={chartConfig}
            style={styles.chartStyle}
          />
        );

      case 'pie':
        return (
          <PieChart
            data={data}
            width={screenWidth}
            height={height}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        );

      case 'progress':
        return (
          <ProgressChart
            data={data}
            width={screenWidth}
            height={height}
            chartConfig={chartConfig}
            style={styles.chartStyle}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      {renderChart()}
    </View>
  );
};

// مكون لوحة التحكم الرئيسية - Main Dashboard Component
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    charts: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // تحميل إحصائيات العملاء - Load customer statistics
      const customerStats = getCustomersStatistics();

      // إنشاء بيانات وهمية للرسوم البيانية - Generate mock chart data
      const chartData = generateMockData();

      setDashboardData({
        stats: customerStats,
        charts: chartData,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('خطأ في تحميل بيانات لوحة التحكم:', error);
      setDashboardData((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount);
  };

  if (dashboardData.loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('loading.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (dashboardData.error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{dashboardData.error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { stats, charts } = dashboardData;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* رأس الصفحة - Page Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('dashboard.title')}</Text>
          <Text style={styles.headerSubtitle}>
            {t('dashboard.welcome')} • {new Date().toLocaleDateString('ar-EG')}
          </Text>
        </View>

        {/* إحصائيات سريعة - Quick Statistics */}
        <View style={styles.statsGrid}>
          <StatCard
            title={t('dashboard.totalCustomers')}
            value={stats?.totalCustomers || 0}
            change={12.5}
            icon="👥"
            color={CHART_COLORS.primary}
          />
          <StatCard
            title={t('dashboard.activeCustomers')}
            value={stats?.activeCustomers || 0}
            change={8.3}
            icon="✅"
            color={CHART_COLORS.success}
          />
          <StatCard
            title={t('dashboard.monthlyRevenue')}
            value={formatCurrency(stats?.totalRevenue || 0)}
            change={-2.1}
            icon="💰"
            color={CHART_COLORS.secondary}
          />
          <StatCard
            title={t('dashboard.newCustomers')}
            value="23"
            change={18.7}
            icon="🆕"
            color={CHART_COLORS.accent}
          />
        </View>

        {/* الرسوم البيانية الرئيسية - Main Charts */}
        <CustomChart
          title={t('dashboard.charts.customerGrowth')}
          type="line"
          data={charts.customerGrowth}
          height={250}
        />

        <CustomChart
          title="الإيرادات الشهرية (جنيه)"
          type="bar"
          data={charts.monthlyRevenue}
          height={250}
        />

        {/* توزيع العملاء - Customer Distribution */}
        <View style={styles.distributionContainer}>
          <Text style={styles.sectionTitle}>توزيع العملاء</Text>
          <View style={styles.distributionCharts}>
            <View style={styles.chartWrapper}>
              <CustomChart title="حسب النوع" type="pie" data={charts.customerTypes} height={200} />
            </View>
            <View style={styles.chartWrapper}>
              <CustomChart
                title="حسب الحالة"
                type="pie"
                data={charts.customerStatus}
                height={200}
              />
            </View>
          </View>
        </View>

        {/* مستويات الولاء - Loyalty Tiers */}
        <CustomChart title="مستويات الولاء" type="pie" data={charts.loyaltyTiers} height={250} />

        {/* أداء المبيعات - Sales Performance */}
        <CustomChart
          title="أداء المبيعات السنوي"
          type="progress"
          data={charts.salesPerformance}
          height={250}
        />

        {/* متوسط قيمة الطلب - Average Order Value */}
        <CustomChart
          title="متوسط قيمة الطلب (جنيه)"
          type="line"
          data={charts.averageOrderValue}
          height={250}
        />

        {/* مؤشرات الأداء الرئيسية - Key Performance Indicators */}
        <View style={styles.kpiContainer}>
          <Text style={styles.sectionTitle}>مؤشرات الأداء الرئيسية</Text>

          <View style={styles.kpiCards}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{(stats?.conversionRate || 0).toFixed(1)}%</Text>
              <Text style={styles.kpiLabel}>معدل التحويل</Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{formatCurrency(stats?.averageOrderValue || 0)}</Text>
              <Text style={styles.kpiLabel}>متوسط قيمة الطلب</Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>4.2</Text>
              <Text style={styles.kpiLabel}>متوسط رضا العملاء</Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>95.3%</Text>
              <Text style={styles.kpiLabel}>معدل الاحتفاظ</Text>
            </View>
          </View>
        </View>

        {/* أحدث النشاطات - Recent Activities */}
        <View style={styles.activitiesContainer}>
          <Text style={styles.sectionTitle}>أحدث النشاطات</Text>

          <View style={styles.activityCard}>
            <Text style={styles.activityIcon}>👤</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>انضم عميل جديد: أحمد محمد</Text>
              <Text style={styles.activityTime}>منذ ساعتين</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <Text style={styles.activityIcon}>💰</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>طلب بقيمة 1,250 جنيه من شركة النهضة</Text>
              <Text style={styles.activityTime}>منذ 4 ساعات</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <Text style={styles.activityIcon}>📈</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>ارتفاع 15% في عدد العملاء الجدد</Text>
              <Text style={styles.activityTime}>منذ 6 ساعات</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// أنماط CSS - CSS Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  scrollView: {
    flex: 1,
    padding: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#666',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
  },

  header: {
    marginBottom: 30,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
  },

  headerSubtitle: {
    fontSize: 16,
    color: '#636E72',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },

  statCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  statTitle: {
    fontSize: 14,
    fontWeight: '600',
  },

  statIcon: {
    fontSize: 20,
  },

  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 4,
  },

  statSubtitle: {
    fontSize: 12,
    color: '#636E72',
    marginBottom: 4,
  },

  statChange: {
    fontSize: 12,
    fontWeight: '600',
  },

  chartContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  chartStyle: {
    borderRadius: 16,
    marginVertical: 8,
  },

  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
    textAlign: 'center',
  },

  distributionContainer: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
  },

  distributionCharts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  chartWrapper: {
    width: '48%',
  },

  kpiContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  kpiCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  kpiCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 12,
  },

  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 4,
  },

  kpiLabel: {
    fontSize: 12,
    color: '#636E72',
    textAlign: 'center',
  },

  activitiesContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  activityIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 40,
    textAlign: 'center',
  },

  activityContent: {
    flex: 1,
  },

  activityText: {
    fontSize: 14,
    color: '#2D3436',
    marginBottom: 4,
  },

  activityTime: {
    fontSize: 12,
    color: '#636E72',
  },
});

export default Dashboard;
