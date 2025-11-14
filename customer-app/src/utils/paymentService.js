// Egyptian Payment Methods Integration Service

import { Alert, Linking, Platform } from 'react-native';
import { t, formatEGPCurrency } from './arabicLocalization';

// Egyptian Payment Providers Configuration
export const PAYMENT_PROVIDERS = {
  cash: {
    id: 'cash',
    name: 'الدفع عند الاستلام',
    nameEn: 'Cash on Delivery',
    icon: 'payments',
    color: '#4CAF50',
    type: 'offline',
    fees: 0,
    description: 'ادفع نقداً عند استلام طلبك',
    instructions: [
      'قم بإعداد المبلغ المطلوب',
      'احتفظ بالفكة الصغيرة إن أمكن',
      'يمكنك الدفع للدليفري مباشرة',
    ],
  },

  fawry: {
    id: 'fawry',
    name: 'فوري',
    nameEn: 'Fawry',
    icon: 'receipt',
    color: '#2196F3',
    type: 'online',
    fees: 5, // EGP
    description: 'ادفع من خلال شبكة فوري المنتشرة في كل مكان',
    instructions: [
      'اذهب إلى أقرب نقطة فوري',
      'اختر "تسوق أونلاين"',
      'ادخل رقم الفاتورة',
      'ادفع المبلغ واحتفظ بالإيصال',
    ],
    fawryCode: 'TDS', // Example code
  },

  vodafone_cash: {
    id: 'vodafone_cash',
    name: 'فودافون كاش',
    nameEn: 'Vodafone Cash',
    icon: 'phone-android',
    color: '#E60000',
    type: 'mobile_wallet',
    fees: 0,
    description: 'تحويل فوري من محفظتك الإلكترونية',
    instructions: [
      'اطلب كود التحويل من الدعم الفني',
      'اتصل بـ *9*7# من خط فودافون',
      'اختر "تحويل أموال"',
      'ادخل رقم الهاتف والمبلغ',
    ],
    merchantCode: 'TDS123', // Example merchant code
  },

  orange_money: {
    id: 'orange_money',
    name: 'أورانج ماني',
    nameEn: 'Orange Money',
    icon: 'smartphone',
    color: '#FF6600',
    type: 'mobile_wallet',
    fees: 0,
    description: 'تحويل فوري من محفظتك الإلكترونية',
    instructions: [
      'اطلب كود التحويل من الدعم الفني',
      'اتصل بـ *100*16# من خط أورانج',
      'اختر "تحويل أموال"',
      'ادخل رقم الهاتف والمبلغ',
    ],
    merchantCode: 'TDS456', // Example merchant code
  },

  aman: {
    id: 'aman',
    name: 'أمان',
    nameEn: 'Aman',
    icon: 'security',
    color: '#9C27B0',
    type: 'mobile_wallet',
    fees: 2,
    description: 'محفظة أمان الإلكترونية',
    instructions: [
      'حمل تطبيق أمان من المتجر',
      'أنشئ حساب أو سجل دخولك',
      'اختر "تحويل أموال"',
      'ادخل رقم الهاتف والمبلغ',
    ],
    merchantCode: 'TDS789', // Example merchant code
  },

  masary: {
    id: 'masary',
    name: 'مصاري',
    nameEn: 'Masary',
    icon: 'account-balance-wallet',
    color: '#607D8B',
    type: 'mobile_wallet',
    fees: 1,
    description: 'محفظة مصاري الرقمية',
    instructions: [
      'حمل تطبيق مصاري من المتجر',
      'أنشئ حساب أو سجل دخولك',
      'اختر "تحويل أموال"',
      'ادخل رقم الهاتف والمبلغ',
    ],
    merchantCode: 'TDS321', // Example merchant code
  },

  bank_transfer: {
    id: 'bank_transfer',
    name: 'حوالة بنكية',
    nameEn: 'Bank Transfer',
    icon: 'account-balance',
    color: '#795548',
    type: 'bank',
    fees: 10,
    description: 'تحويل بنكي مباشر إلى حسابنا',
    instructions: [
      'اذهب إلى بنكك أو استخدم الإنترنت البنكي',
      'حوّل المبلغ لحساب: البنك الأهلي',
      'رقم الحساب: 1234567890',
      'أرسل إيصال التحويل',
      'سيتم تأكيد الطلب خلال 24 ساعة',
    ],
    bankDetails: {
      bankName: 'البنك الأهلي المصري',
      accountNumber: '1234567890',
      iban: 'EG1500350008000000002601842',
      swiftCode: 'NBEGEGCX',
      accountHolderName: 'شركة التوصيل للقرى المصرية',
    },
  },
};

// Payment Service Class
class PaymentService {
  constructor() {
    this.currentPayment = null;
    this.listeners = [];
  }

  // Get available payment methods for Egypt
  getAvailablePaymentMethods() {
    return Object.values(PAYMENT_PROVIDERS).filter(
      (provider) => provider.type !== 'offline' || Platform.OS === 'android' // Allow cash on all platforms
    );
  }

  // Initialize payment with selected method
  async initiatePayment(orderDetails, paymentMethodId) {
    const provider = PAYMENT_PROVIDERS[paymentMethodId];
    if (!provider) {
      throw new Error('Payment method not found');
    }

    const paymentRequest = {
      id: this.generatePaymentId(),
      orderId: orderDetails.id,
      amount: orderDetails.total,
      currency: 'EGP',
      method: paymentMethodId,
      provider: provider,
      status: 'pending',
      timestamp: new Date().toISOString(),
      customerInfo: orderDetails.customerInfo,
    };

    this.currentPayment = paymentRequest;

    // Notify listeners
    this.notifyListeners('payment_initiated', paymentRequest);

    return paymentRequest;
  }

  // Process payment based on type
  async processPayment(paymentRequest) {
    const { method } = paymentRequest;

    switch (method) {
      case 'cash':
        return this.processCashPayment(paymentRequest);

      case 'fawry':
        return this.processFawryPayment(paymentRequest);

      case 'vodafone_cash':
      case 'orange_money':
      case 'aman':
      case 'masary':
        return this.processMobileWalletPayment(paymentRequest);

      case 'bank_transfer':
        return this.processBankTransfer(paymentRequest);

      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }
  }

  // Cash on Delivery payment
  async processCashPayment(paymentRequest) {
    return {
      ...paymentRequest,
      status: 'confirmed',
      paymentUrl: null,
      reference: `CASH_${paymentRequest.id}`,
      instructions: PAYMENT_PROVIDERS.cash.instructions,
      message: 'تم تأكيد الدفع عند الاستلام',
    };
  }

  // Fawry payment processing
  async processFawryPayment(paymentRequest) {
    try {
      // In a real implementation, you would:
      // 1. Call Fawry API to create payment request
      // 2. Return payment URL or reference code
      // 3. Handle callback from Fawry

      const fawryRequest = {
        merchantCode: PAYMENT_PROVIDERS.fawry.fawryCode,
        merchantRefNum: paymentRequest.id,
        customerProfileId: paymentRequest.customerInfo.phone,
        amount: Math.round(paymentRequest.amount * 100), // Convert to piasters
        currencyCode: 'EGP',
        description: `طلب رقم ${paymentRequest.orderId}`,
        language: 'ar-eg',
        chargeItems: [
          {
            itemId: paymentRequest.orderId,
            description: `طلب من تطبيق التوصيل للقرى المصرية`,
            price: Math.round(paymentRequest.amount * 100),
            quantity: 1,
          },
        ],
      };

      // Mock response - replace with actual Fawry API call
      const mockResponse = {
        status: 200,
        data: {
          referenceNumber: `FAWRY_${paymentRequest.id}`,
          paymentUrl: `https://www.fawrystaging.com/Fawrypay/Index?refrenceNumber=FAWRY_${paymentRequest.id}`,
          merchantRefNumber: paymentRequest.id,
        },
      };

      return {
        ...paymentRequest,
        status: 'pending_payment',
        paymentUrl: mockResponse.data.paymentUrl,
        reference: mockResponse.data.referenceNumber,
        instructions: PAYMENT_PROVIDERS.fawry.instructions,
        message: 'يرجى الدفع من أقرب نقطة فوري',
      };
    } catch (error) {
      throw new Error('فشل في إنشاء طلب الدفع من فوري');
    }
  }

  // Mobile wallet payment processing
  async processMobileWalletPayment(paymentRequest) {
    const provider = PAYMENT_PROVIDERS[paymentRequest.method];

    try {
      // In a real implementation, you would:
      // 1. Generate payment request with the wallet provider
      // 2. Return payment code or instructions
      // 3. Handle payment confirmation

      const paymentCode = this.generatePaymentCode();

      return {
        ...paymentRequest,
        status: 'pending_payment',
        paymentUrl: null,
        reference: paymentCode,
        instructions: provider.instructions,
        paymentCode: paymentCode,
        merchantCode: provider.merchantCode,
        message: `يرجى الدفع باستخدام ${provider.name}`,
        amountInWallet: paymentRequest.amount,
      };
    } catch (error) {
      throw new Error(`فشل في إنشاء طلب الدفع من ${provider.name}`);
    }
  }

  // Bank transfer processing
  async processBankTransfer(paymentRequest) {
    return {
      ...paymentRequest,
      status: 'pending_verification',
      paymentUrl: null,
      reference: `BANK_${paymentRequest.id}`,
      instructions: PAYMENT_PROVIDERS.bank_transfer.instructions,
      bankDetails: PAYMENT_PROVIDERS.bank_transfer.bankDetails,
      verificationRequired: true,
      message: 'يرجى تحويل المبلغ وإرسال إيصال التحويل',
    };
  }

  // Verify payment status
  async verifyPayment(paymentRequest, verificationData = null) {
    const { method, reference } = paymentRequest;

    try {
      let verificationResult;

      switch (method) {
        case 'fawry':
          verificationResult = await this.verifyFawryPayment(reference);
          break;

        case 'bank_transfer':
          verificationResult = await this.verifyBankTransfer(paymentRequest, verificationData);
          break;

        default:
          verificationResult = { verified: false, message: 'Payment verification not implemented' };
      }

      if (verificationResult.verified) {
        const updatedPayment = {
          ...paymentRequest,
          status: 'completed',
          verifiedAt: new Date().toISOString(),
          verificationData,
        };

        this.notifyListeners('payment_completed', updatedPayment);
        return updatedPayment;
      } else {
        const failedPayment = {
          ...paymentRequest,
          status: 'failed',
          failedAt: new Date().toISOString(),
          failureReason: verificationResult.message,
        };

        this.notifyListeners('payment_failed', failedPayment);
        return failedPayment;
      }
    } catch (error) {
      const errorPayment = {
        ...paymentRequest,
        status: 'error',
        errorAt: new Date().toISOString(),
        errorMessage: error.message,
      };

      this.notifyListeners('payment_error', errorPayment);
      return errorPayment;
    }
  }

  // Mock Fawry verification
  async verifyFawryPayment(reference) {
    // In real implementation, call Fawry API to check payment status
    // For demo purposes, we'll simulate verification
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      verified: true,
      message: 'تم تأكيد الدفع من فوري',
    };
  }

  // Mock bank transfer verification
  async verifyBankTransfer(paymentRequest, verificationData) {
    // In real implementation, you would:
    // 1. Check bank account for incoming transfer
    // 2. Verify amount and reference
    // 3. Update payment status

    if (verificationData && verificationData.transferScreenshot) {
      return {
        verified: true,
        message: 'تم تأكيد التحويل البنكي',
      };
    }

    return {
      verified: false,
      message: 'لم يتم العثور على التحويل البنكي',
    };
  }

  // Generate payment receipt
  generateReceipt(paymentRequest) {
    return {
      receiptNumber: `REC_${paymentRequest.id}`,
      orderId: paymentRequest.orderId,
      amount: paymentRequest.amount,
      currency: 'EGP',
      paymentMethod: PAYMENT_PROVIDERS[paymentRequest.method].name,
      reference: paymentRequest.reference,
      timestamp: new Date().toISOString(),
      customerInfo: paymentRequest.customerInfo,
      merchantInfo: {
        name: 'شركة التوصيل للقرى المصرية',
        address: 'القاهرة، مصر',
        phone: '+20 123 456 7890',
        email: 'support@egyptdelivery.com',
      },
    };
  }

  // Generate payment ID
  generatePaymentId() {
    return `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate payment code for mobile wallets
  generatePaymentCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  // Payment event listeners
  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach((listener) => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in payment listener:', error);
      }
    });
  }

  // Get payment status
  getCurrentPayment() {
    return this.currentPayment;
  }

  // Clear current payment
  clearCurrentPayment() {
    this.currentPayment = null;
  }

  // Open payment URL in browser (for online payments)
  async openPaymentUrl(url) {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return true;
      } else {
        Alert.alert('خطأ', 'لا يمكن فتح الرابط في هذا التطبيق');
        return false;
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل في فتح رابط الدفع');
      return false;
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();

// Export utility functions
export const getPaymentMethod = (methodId) => PAYMENT_PROVIDERS[methodId];

export const calculatePaymentFees = (amount, methodId) => {
  const method = PAYMENT_PROVIDERS[methodId];
  return method ? method.fees : 0;
};

export const getTotalWithFees = (amount, methodId) => {
  return amount + calculatePaymentFees(amount, methodId);
};

export const isPaymentOnline = (methodId) => {
  const method = PAYMENT_PROVIDERS[methodId];
  return method ? method.type !== 'offline' : false;
};

export const getPaymentInstructions = (methodId) => {
  const method = PAYMENT_PROVIDERS[methodId];
  return method ? method.instructions : [];
};

export default paymentService;
