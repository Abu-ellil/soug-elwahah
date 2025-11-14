// نظام البحث والتصفية المتقدم - Advanced Search & Filtering System
// ================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { customerManager } from '../utils/customerManager';
import { t, translationManager } from '../utils/localization';
import { hasPermission } from '../utils/auth';

// أنواع الفلاتر - Filter Types
export const FILTER_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  BOOLEAN: 'boolean',
  RANGE: 'range'
};

// معايير البحث - Search Criteria
export const SEARCH_CRITERIA = {
  NAME: 'name',
  EMAIL: 'email',
  PHONE: 'phone',
  TYPE: 'type',
  TIER: 'tier',
  STATUS: 'status',
  REGISTRATION_DATE: 'registrationDate',
  LAST_ACTIVITY: 'lastActivity',
  TOTAL_SPENT: 'totalSpent',
  TOTAL_PURCHASES: 'totalPurchases',
  LOYALTY_POINTS: 'loyaltyPoints',
  CUSTOM_FIELD: 'customField'
};

// فلاتر البحث المسبقة - Predefined Search Filters
export const PREDEFINED_FILTERS = {
  ACTIVE_CUSTOMERS: {
    id: 'active_customers',
    name: 'العملاء النشطون',
    icon: '✅',
    filters: { status: ['active'] }
  },
  
  HIGH_VALUE_CUSTOMERS: {
    id: 'high_value_customers',
    name: 'العملاء ذوو القيمة العالية',
    icon: '💎',
    filters: { 
      minTotalSpent: 10000,
      minTotalPurchases: 20
    }
  },
  
  RECENT_CUSTOMERS: {
    id: 'recent_customers',
    name: 'العملاء الجدد',
    icon: '🆕',
    filters: {
      registrationDateRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString()
      }
    }
  },
  
  VIP_CUSTOMERS: {
    id: 'vip_customers',
    name: 'عملاء VIP',
    icon: '👑',
    filters: { tier: ['platinum', 'gold'] }
  },
  
  INACTIVE_CUSTOMERS: {
    id: 'inactive_customers',
    name: 'العملاء غير النشطين',
    icon: '⏸️',
    filters: { 
      inactiveDays: 30
    }
  },
  
  COMMERCIAL_CUSTOMERS: {
    id: 'commercial_customers',
    name: 'العملاء التجاريون',
    icon: '🏢',
    filters: { type: ['business'] }
  }
};

// مكون شريط البحث - Search Bar Component
const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  onFilterToggle, 
  activeFilters,
  placeholder = 'البحث عن عملاء...',
  showFilters = true 
}) => {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder={placeholder}
          placeholderTextColor="#999"
          textAlign="right"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => onSearchChange('')}
          >
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {showFilters && (
        <TouchableOpacity
          style={styles.filterButton}
          onPress={onFilterToggle}
        >
          <Text style={styles.filterIcon}>🔽</Text>
          <Text style={styles.filterButtonText}>الفلاتر</Text>
          {Object.keys(activeFilters).length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {Object.keys(activeFilters).length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

// مكون اختيار الفلاتر - Filter Selection Component
const FilterSelector = ({ 
  visible, 
  filters, 
  onFilterChange, 
  onClose,
  currentFilters 
}) => {
  const [localFilters, setLocalFilters] = useState(currentFilters);

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const clearAllFilters = () => {
    setLocalFilters({});
    onFilterChange({});
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={styles.filterOverlay}>
      <View style={styles.filterContainer}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>تصفية النتائج</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.filterContent}>
          {/* فلتر نوع العميل - Customer Type Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupTitle}>نوع العميل</Text>
            <View style={styles.filterOptions}>
              {['individual', 'business', 'vip'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOption,
                    localFilters.type?.includes(type) && styles.filterOptionActive
                  ]}
                  onPress={() => {
                    const currentTypes = localFilters.type || [];
                    const newTypes = currentTypes.includes(type)
                      ? currentTypes.filter(t => t !== type)
                      : [...currentTypes, type];
                    handleFilterChange('type', newTypes.length > 0 ? newTypes : undefined);
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    localFilters.type?.includes(type) && styles.filterOptionActiveText
                  ]}>
                    {type === 'individual' ? 'فردي' : type === 'business' ? 'تجاري' : 'VIP'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* فلتر مستوى الولاء - Loyalty Tier Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupTitle}>مستوى الولاء</Text>
            <View style={styles.filterOptions}>
              {['bronze', 'silver', 'gold', 'platinum'].map(tier => (
                <TouchableOpacity
                  key={tier}
                  style={[
                    styles.filterOption,
                    localFilters.tier?.includes(tier) && styles.filterOptionActive
                  ]}
                  onPress={() => {
                    const currentTiers = localFilters.tier || [];
                    const newTiers = currentTiers.includes(tier)
                      ? currentTiers.filter(t => t !== tier)
                      : [...currentTiers, tier];
                    handleFilterChange('tier', newTiers.length > 0 ? newTiers : undefined);
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    localFilters.tier?.includes(tier) && styles.filterOptionActiveText
                  ]}>
                    {tier === 'bronze' ? 'برونزي' : 
                     tier === 'silver' ? 'فضي' : 
                     tier === 'gold' ? 'ذهبي' : 'بلاتيني'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* فلتر الحالة - Status Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupTitle}>الحالة</Text>
            <View style={styles.filterOptions}>
              {['active', 'inactive', 'blocked', 'pending'].map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterOption,
                    localFilters.status?.includes(status) && styles.filterOptionActive
                  ]}
                  onPress={() => {
                    const currentStatuses = localFilters.status || [];
                    const newStatuses = currentStatuses.includes(status)
                      ? currentStatuses.filter(s => s !== status)
                      : [...currentStatuses, status];
                    handleFilterChange('status', newStatuses.length > 0 ? newStatuses : undefined);
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    localFilters.status?.includes(status) && styles.filterOptionActiveText
                  ]}>
                    {status === 'active' ? 'نشط' : 
                     status === 'inactive' ? 'غير نشط' : 
                     status === 'blocked' ? 'محظور' : 'في الانتظار'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* فلتر النطاق المالي - Financial Range Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupTitle}>المصروفات (جنيه)</Text>
            <View style={styles.rangeFilter}>
              <TextInput
                style={styles.rangeInput}
                placeholder="من"
                value={localFilters.minTotalSpent?.toString() || ''}
                onChangeText={(value) => handleFilterChange('minTotalSpent', value ? parseFloat(value) : undefined)}
                keyboardType="numeric"
              />
              <Text style={styles.rangeSeparator}>-</Text>
              <TextInput
                style={styles.rangeInput}
                placeholder="إلى"
                value={localFilters.maxTotalSpent?.toString() || ''}
                onChangeText={(value) => handleFilterChange('maxTotalSpent', value ? parseFloat(value) : undefined)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* فلتر عدد المشتريات - Purchase Count Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupTitle}>عدد المشتريات</Text>
            <View style={styles.rangeFilter}>
              <TextInput
                style={styles.rangeInput}
                placeholder="من"
                value={localFilters.minTotalPurchases?.toString() || ''}
                onChangeText={(value) => handleFilterChange('minTotalPurchases', value ? parseInt(value) : undefined)}
                keyboardType="numeric"
              />
              <Text style={styles.rangeSeparator}>-</Text>
              <TextInput
                style={styles.rangeInput}
                placeholder="إلى"
                value={localFilters.maxTotalPurchases?.toString() || ''}
                onChangeText={(value) => handleFilterChange('maxTotalPurchases', value ? parseInt(value) : undefined)}
                keyboardType="numeric"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.filterFooter}>
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
            <Text style={styles.clearFiltersText}>مسح الكل</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyFiltersButton} onPress={applyFilters}>
            <Text style={styles.applyFiltersText}>تطبيق الفلاتر</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// مكون الفرز السريع - Quick Sort Component
const QuickSort = ({ 
  sortOptions, 
  currentSort, 
  onSortChange,
  sortOrder,
  onSortOrderChange 
}) => {
  return (
    <View style={styles.sortContainer}>
      <Text style={styles.sortLabel}>ترتيب حسب:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortOptions}>
        {sortOptions.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.sortOption,
              currentSort === option.value && styles.sortOptionActive
            ]}
            onPress={() => onSortChange(option.value)}
          >
            <Text style={[
              styles.sortOptionText,
              currentSort === option.value && styles.sortOptionActiveText
            ]}>
              {option.label}
            </Text>
            {currentSort === option.value && (
              <TouchableOpacity onPress={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}>
                <Text style={styles.sortOrderIcon}>
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// مكون الفلاتر السريعة - Quick Filters Component
const QuickFilters = ({ 
  predefinedFilters, 
  onFilterSelect,
  activeQuickFilter 
}) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickFilters}>
      {predefinedFilters.map(filter => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.quickFilter,
            activeQuickFilter === filter.id && styles.quickFilterActive
          ]}
          onPress={() => onFilterSelect(activeQuickFilter === filter.id ? null : filter.id)}
        >
          <Text style={styles.quickFilterIcon}>{filter.icon}</Text>
          <Text style={[
            styles.quickFilterText,
            activeQuickFilter === filter.id && styles.quickFilterActiveText
          ]}>
            {filter.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// فئة البحث والتصفية - Search & Filter Engine
export class SearchEngine {
  constructor() {
    this.searchTimeout = null;
    this.debounceDelay = 300;
  }

  // البحث في قاعدة البيانات - Search in Database
  async search(customers, query, filters = {}, sortOptions = {}) {
    try {
      let results = [...customers];

      // تطبيق البحث النصي - Apply Text Search
      if (query && query.trim()) {
        results = this.applyTextSearch(results, query.trim());
      }

      // تطبيق الفلاتر - Apply Filters
      if (Object.keys(filters).length > 0) {
        results = this.applyFilters(results, filters);
      }

      // تطبيق الترتيب - Apply Sorting
      if (sortOptions.field) {
        results = this.applySorting(results, sortOptions.field, sortOptions.order || 'asc');
      }

      return {
        results,
        totalCount: results.length,
        filteredCount: results.length,
        searchQuery: query,
        appliedFilters: filters,
        sortOptions
      };
    } catch (error) {
      console.error('خطأ في البحث:', error);
      throw error;
    }
  }

  // تطبيق البحث النصي - Apply Text Search
  applyTextSearch(customers, query) {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return customers.filter(customer => {
      const searchableFields = [
        customer.firstName,
        customer.lastName,
        customer.email,
        customer.phone,
        customer.customFields?.companyName
      ].filter(Boolean).join(' ').toLowerCase();

      return searchTerms.every(term => searchableFields.includes(term));
    });
  }

  // تطبيق الفلاتر - Apply Filters
  applyFilters(customers, filters) {
    return customers.filter(customer => {
      // فلتر نوع العميل - Customer Type Filter
      if (filters.type && filters.type.length > 0) {
        if (!filters.type.includes(customer.type)) return false;
      }

      // فلتر مستوى الولاء - Tier Filter
      if (filters.tier && filters.tier.length > 0) {
        if (!filters.tier.includes(customer.tier)) return false;
      }

      // فلتر الحالة - Status Filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(customer.status)) return false;
      }

      // فلتر النطاق المالي - Financial Range Filter
      if (filters.minTotalSpent !== undefined) {
        if ((customer.statistics?.totalSpent || 0) < filters.minTotalSpent) return false;
      }
      
      if (filters.maxTotalSpent !== undefined) {
        if ((customer.statistics?.totalSpent || 0) > filters.maxTotalSpent) return false;
      }

      // فلتر عدد المشتريات - Purchase Count Filter
      if (filters.minTotalPurchases !== undefined) {
        if ((customer.statistics?.totalPurchases || 0) < filters.minTotalPurchases) return false;
      }
      
      if (filters.maxTotalPurchases !== undefined) {
        if ((customer.statistics?.totalPurchases || 0) > filters.maxTotalPurchases) return false;
      }

      // فلتر العملاء غير النشطين - Inactive Customers Filter
      if (filters.inactiveDays) {
        const lastActivity = new Date(customer.lastActivityDate);
        const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceActivity < filters.inactiveDays) return false;
      }

      // فلتر التاريخ - Date Range Filter
      if (filters.registrationDateRange) {
        const registrationDate = new Date(customer.registrationDate);
        if (filters.registrationDateRange.from) {
          if (registrationDate < new Date(filters.registrationDateRange.from)) return false;
        }
        if (filters.registrationDateRange.to) {
          if (registrationDate > new Date(filters.registrationDateRange.to)) return false;
        }
      }

      return true;
    });
  }

  // تطبيق الترتيب - Apply Sorting
  applySorting(customers, field, order = 'asc') {
    return [...customers].sort((a, b) => {
      let aValue, bValue;

      // التعامل مع الحقول المتداخلة - Handle Nested Fields
      if (field.includes('.')) {
        const fields = field.split('.');
        aValue = fields.reduce((obj, key) => obj?.[key], a);
        bValue = fields.reduce((obj, key) => obj?.[key], b);
      } else {
        aValue = a[field];
        bValue = b[field];
      }

      // التعامل مع التواريخ - Handle Dates
      if (field.includes('Date')) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      // التعامل مع النصوص - Handle Strings
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // مقارنة القيم - Compare Values
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // الحصول على اقتراحات البحث - Get Search Suggestions
  getSearchSuggestions(customers, query, limit = 10) {
    if (!query || query.length < 2) return [];

    const suggestions = new Set();
    const searchTerm = query.toLowerCase();

    customers.forEach(customer => {
      // إضافة أسماء العملاء - Add Customer Names
      if (customer.firstName?.toLowerCase().includes(searchTerm)) {
        suggestions.add(`${customer.firstName} ${customer.lastName}`);
      }
      if (customer.lastName?.toLowerCase().includes(searchTerm)) {
        suggestions.add(`${customer.firstName} ${customer.lastName}`);
      }

      // إضافة عناوين البريد الإلكتروني - Add Email Addresses
      if (customer.email?.toLowerCase().includes(searchTerm)) {
        suggestions.add(customer.email);
      }

      // إضافة أسماء الشركات - Add Company Names
      if (customer.customFields?.companyName?.toLowerCase().includes(searchTerm)) {
        suggestions.add(customer.customFields.companyName);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  // البحث المتقدم بالأوامر - Advanced Search with Commands
  executeAdvancedSearch(customers, command) {
    const { type, params } = command;
    
    switch (type) {
      case 'recent':
        const daysAgo = params.days || 30;
        const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        return customers.filter(c => new Date(c.registrationDate) >= cutoffDate);
      
      case 'highValue':
        const minSpent = params.minAmount || 10000;
        return customers.filter(c => (c.statistics?.totalSpent || 0) >= minSpent);
      
      case 'inactive':
        const inactiveDays = params.days || 30;
        return customers.filter(c => {
          const lastActivity = new Date(c.lastActivityDate);
          const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
          return daysSinceActivity >= inactiveDays;
        });
      
      case 'byType':
        return customers.filter(c => c.type === params.type);
      
      case 'byTier':
        return customers.filter(c => c.tier === params.tier);
      
      default:
        return customers;
    }
  }
}

// إنشاء محرك البحث - Create Search Engine Instance
export const searchEngine = new SearchEngine();

// مكون البحث الرئيسي - Main Search Component
const CustomerSearchScreen = ({ 
  customers = [], 
  onCustomerSelect,
  currentUser,
  showCustomerDetails = true 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [sortOptions, setSortOptions] = useState({
    field: 'firstName',
    order: 'asc'
  });
  const [showFilterSelector, setShowFilterSelector] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState(null);
  const [searchResults, setSearchResults] = useState({
    results: customers,
    totalCount: customers.length,
    filteredCount: customers.length,
    loading: false
  });
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  // تحقق من الصلاحيات - Check Permissions
  const canSearch = hasPermission(currentUser, 'customers:read');

  // خيارات الترتيب - Sort Options
  const sortOptionsList = [
    { value: 'firstName', label: 'الاسم' },
    { value: 'email', label: 'البريد الإلكتروني' },
    { value: 'phone', label: 'رقم الهاتف' },
    { value: 'type', label: 'نوع العميل' },
    { value: 'tier', label: 'مستوى الولاء' },
    { value: 'status', label: 'الحالة' },
    { value: 'registrationDate', label: 'تاريخ التسجيل' },
    { value: 'lastActivityDate', label: 'آخر نشاط' },
    { value: 'statistics.totalSpent', label: 'إجمالي المصروفات' },
    { value: 'statistics.totalPurchases', label: 'عدد المشتريات' }
  ];

  // تنفيذ البحث - Execute Search
  const executeSearch = useMemo(() => {
    return async (query = searchQuery, currentFilters = filters, currentSortOptions = sortOptions) => {
      if (!canSearch) {
        Alert.alert('خطأ', 'غير مخول للبحث في بيانات العملاء');
        return;
      }

      setSearchResults(prev => ({ ...prev, loading: true }));

      try {
        // تطبيق الفلتر السريع المحدد - Apply Selected Quick Filter
        let finalFilters = { ...currentFilters };
        if (activeQuickFilter) {
          const quickFilter = Object.values(PREDEFINED_FILTERS).find(f => f.id === activeQuickFilter);
          if (quickFilter) {
            finalFilters = { ...finalFilters, ...quickFilter.filters };
          }
        }

        const results = await searchEngine.search(customers, query, finalFilters, currentSortOptions);
        setSearchResults({
          ...results,
          loading: false
        });

        // تحديث اقتراحات البحث - Update Search Suggestions
        if (query.length >= 2) {
          const suggestions = searchEngine.getSearchSuggestions(customers, query);
          setSearchSuggestions(suggestions);
        } else {
          setSearchSuggestions([]);
        }
      } catch (error) {
        console.error('خطأ في البحث:', error);
        setSearchResults(prev => ({
          ...prev,
          loading: false
        }));
        Alert.alert('خطأ', 'حدث خطأ أثناء البحث');
      }
    };
  }, [customers, searchQuery, filters, sortOptions, activeQuickFilter, canSearch]);

  useEffect(() => {
    // تنفيذ البحث عند تغيير الاستعلام - Execute search when query changes
    const timeoutId = setTimeout(() => {
      executeSearch();
    }, searchEngine.debounceDelay);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, sortOptions, activeQuickFilter, executeSearch]);

  // تطبيق فلتر سريع - Apply Quick Filter
  const handleQuickFilterSelect = (filterId) => {
    setActiveQuickFilter(filterId);
  };

  // تطبيق فلتر مخصص - Apply Custom Filter
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setActiveQuickFilter(null); // Reset quick filter when custom filters are applied
  };

  // تطبيق ترتيب جديد - Apply New Sort
  const handleSortChange = (field) => {
    setSortOptions(prev => ({
      ...prev,
      field
    }));
  };

  // تغيير اتجاه الترتيب - Change Sort Order
  const handleSortOrderChange = (order) => {
    setSortOptions(prev => ({
      ...prev,
      order
    }));
  };

  // استخدام اقتراح بحث - Use Search Suggestion
  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion);
    setSearchSuggestions([]);
  };

  if (!canSearch) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedText}>غير مخول للبحث في بيانات العملاء</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* شريط البحث - Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterToggle={() => setShowFilterSelector(!showFilterSelector)}
        activeFilters={filters}
      />

      {/* الفلتر السريع - Quick Filters */}
      <QuickFilters
        predefinedFilters={Object.values(PREDEFINED_FILTERS)}
        onFilterSelect={handleQuickFilterSelect}
        activeQuickFilter={activeQuickFilter}
      />

      {/* خيارات الترتيب - Sort Options */}
      <QuickSort
        sortOptions={sortOptionsList}
        currentSort={sortOptions.field}
        onSortChange={handleSortChange}
        sortOrder={sortOptions.order}
        onSortOrderChange={handleSortOrderChange}
      />

      {/* نتائج البحث - Search Results */}
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {searchResults.loading ? 'جاري البحث...' : `${searchResults.filteredCount} من أصل ${searchResults.totalCount} عميل`}
          </Text>
        </View>

        {/* اقتراحات البحث - Search Suggestions */}
        {searchSuggestions.length > 0 && !showFilterSelector && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>اقتراحات:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {searchSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestion}
                  onPress={() => handleSuggestionSelect(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* قائمة العملاء - Customer List */}
        <FlatList
          data={searchResults.results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CustomerListItem
              customer={item}
              onPress={() => onCustomerSelect && onCustomerSelect(item)}
              showDetails={showCustomerDetails}
            />
          )}
          showsVerticalScrollIndicator={false}
          refreshing={searchResults.loading}
          onRefresh={() => executeSearch()}
          ListEmptyComponent={
            !searchResults.loading && (
              <View style={styles.emptyResults}>
                <Text style={styles.emptyResultsText}>
                  {searchQuery || Object.keys(filters).length > 0 
                    ? 'لا توجد نتائج مطابقة للبحث' 
                    : 'لا توجد عملاء'}
                </Text>
              </View>
            )
          }
        />
      </View>

      {/* اختيار الفلاتر - Filter Selector */}
      <FilterSelector
        visible={showFilterSelector}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClose={() => setShowFilterSelector(false)}
        currentFilters={filters}
      />
    </SafeAreaView>
  );
};

// مكون عنصر قائمة العميل - Customer List Item Component
const CustomerListItem = ({ customer, onPress, showDetails }) => {
  const getStatusColor = (status) => {
    const colors = {
      active: '#10B981',
      inactive: '#F59E0B',
      blocked: '#EF4444',
      pending: '#8B5CF6'
    };
    return colors[status] || '#6B7280';
  };

  const getTierColor = (tier) => {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2'
    };
    return colors[tier] || '#6B7280';
  };

  return (
    <TouchableOpacity style={styles.customerItem} onPress={onPress}>
      <View style={styles.customerHeader}>
        <Text style={styles.customerName}>
          {customer.firstName} {customer.lastName}
        </Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(customer.status) }
        ]}>
          <Text style={styles.statusText}>
            {customer.status === 'active' ? 'نشط' : 
             customer.status === 'inactive' ? 'غير نشط' : 
             customer.status === 'blocked' ? 'محظور' : 'في الانتظار'}
          </Text>
        </View>
      </View>

      {showDetails && (
        <View style={styles.customerDetails}>
          <Text style={styles.customerEmail}>{customer.email}</Text>
          <Text style={styles.customerPhone}>{customer.phone}</Text>
          
          <View style={styles.customerMeta}>
            <View style={styles.customerType}>
              <Text style={styles.customerTypeText}>
                {customer.type === 'individual' ? 'فردي' : 
                 customer.type === 'business' ? 'تجاري' : 'VIP'}
              </Text>
            </View>
            
            <View style={[
              styles.tierBadge,
              { borderColor: getTierColor(customer.tier) }
            ]}>
              <Text style={styles.tierText}>
                {customer.tier === 'bronze' ? 'برونزي' : 
                 customer.tier === 'silver' ? 'فضي' : 
                 customer.tier === 'gold' ? 'ذهبي' : 'بلاتيني'}
              </Text>
            </View>
          </View>

          {customer.statistics && (
            <View style={styles.customerStats}>
              <Text style={styles.customerStat}>
                مصروفات: {customer.statistics.totalSpent?.toLocaleString('ar-EG')} جنيه
              </Text>
              <Text style={styles.customerStat}>
                مشتريات: {customer.statistics.totalPurchases}
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

// أنماط CSS - CSS Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  accessDeniedText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
  },

  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },

  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    textAlign: 'right',
  },

  clearButton: {
    padding: 4,
  },

  clearIcon: {
    fontSize: 16,
    color: '#999',
  },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    position: 'relative',
  },

  filterIcon: {
    fontSize: 16,
    marginRight: 4,
  },

  filterButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },

  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  quickFilters: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  quickFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  quickFilterActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },

  quickFilterIcon: {
    fontSize: 14,
    marginRight: 4,
  },

  quickFilterText: {
    fontSize: 14,
    color: '#2D3436',
  },

  quickFilterActiveText: {
    color: 'white',
  },

  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  sortLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3436',
    marginRight: 12,
  },

  sortOptions: {
    flex: 1,
  },

  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },

  sortOptionActive: {
    backgroundColor: '#4ECDC4',
  },

  sortOptionText: {
    fontSize: 14,
    color: '#2D3436',
  },

  sortOptionActiveText: {
    color: 'white',
  },

  sortOrderIcon: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },

  resultsContainer: {
    flex: 1,
  },

  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  resultsCount: {
    fontSize: 14,
    color: '#666',
  },

  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F8FF',
  },

  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3436',
    marginBottom: 8,
  },

  suggestion: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },

  suggestionText: {
    fontSize: 14,
    color: '#4ECDC4',
  },

  customerItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    flex: 1,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },

  customerDetails: {
    marginTop: 8,
  },

  customerEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },

  customerPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },

  customerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  customerType: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },

  customerTypeText: {
    fontSize: 12,
    color: '#2D3436',
  },

  tierBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  tierText: {
    fontSize: 12,
    color: '#2D3436',
  },

  customerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  customerStat: {
    fontSize: 12,
    color: '#666',
  },

  emptyResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  emptyResultsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },

  // Filter Overlay Styles
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  filterContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },

  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
  },

  closeIcon: {
    fontSize: 20,
    color: '#666',
  },

  filterContent: {
    flex: 1,
    padding: 16,
  },

  filterGroup: {
    marginBottom: 20,
  },

  filterGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
  },

  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  filterOption: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },

  filterOptionActive: {
    backgroundColor: '#FF6B35',
  },

  filterOptionText: {
    fontSize: 14,
    color: '#2D3436',
  },

  filterOptionActiveText: {
    color: 'white',
  },

  rangeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rangeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    textAlign: 'center',
  },

  rangeSeparator: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 12,
  },

  filterFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },

  clearFiltersButton: {
    flex: 1,
    backgroundColor: '#EF476F',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },

  clearFiltersText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },

  applyFiltersButton: {
    flex: 1,
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  applyFiltersText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CustomerSearchScreen;