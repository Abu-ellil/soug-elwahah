// Customer Profile Management using API
// =====================================

import { API } from '../services/api';
import { getToken } from './storage';

// Customer Profile Manager using API
export class CustomerProfileManager {
  // Get current customer profile
 static async getProfile(token) {
    try {
      const response = await API.profileAPI.getProfile(token);
      if (response.success) {
        return response.data.user;
      } else {
        throw new Error(response.message || 'فشل في جلب الملف الشخصي');
      }
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  }

  // Update customer profile
  static async updateProfile(profileData, token) {
    try {
      const response = await API.profileAPI.updateProfile(profileData, token);
      if (response.success) {
        return response.data.user;
      } else {
        throw new Error(response.message || 'فشل في تحديث الملف الشخصي');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Get customer addresses
  static async getAddresses(token) {
    try {
      const response = await API.addressesAPI.getMyAddresses(token);
      if (response.success) {
        return response.data.addresses;
      } else {
        throw new Error(response.message || 'فشل في جلب العناوين');
      }
    } catch (error) {
      console.error('Error getting addresses:', error);
      throw error;
    }
 }

  // Add new address
  static async addAddress(addressData, token) {
    try {
      const response = await API.addressesAPI.addAddress(addressData, token);
      if (response.success) {
        return response.data.address;
      } else {
        throw new Error(response.message || 'فشل في إضافة العنوان');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  }

  // Update existing address
  static async updateAddress(addressId, addressData, token) {
    try {
      const response = await API.addressesAPI.updateAddress(addressId, addressData, token);
      if (response.success) {
        return response.data.address;
      } else {
        throw new Error(response.message || 'فشل في تحديث العنوان');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  // Delete address
  static async deleteAddress(addressId, token) {
    try {
      const response = await API.addressesAPI.deleteAddress(addressId, token);
      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'فشل في حذف العنوان');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }
}

// Export instance and helper functions
export const customerProfileManager = new CustomerProfileManager();

// Quick functions
export const getCustomerProfile = async () => {
  const token = await getToken();
  if (!token) {
    throw new Error('غير مصادق عليه');
  }
 return CustomerProfileManager.getProfile(token);
};

export const updateCustomerProfile = async (profileData) => {
  const token = await getToken();
  if (!token) {
    throw new Error('غير مصادق عليه');
  }
  return CustomerProfileManager.updateProfile(profileData, token);
};

export const getCustomerAddresses = async () => {
  const token = await getToken();
  if (!token) {
    throw new Error('غير مصادق عليه');
  }
  return CustomerProfileManager.getAddresses(token);
};

export const addCustomerAddress = async (addressData) => {
  const token = await getToken();
  if (!token) {
    throw new Error('غير مصادق عليه');
  }
  return CustomerProfileManager.addAddress(addressData, token);
};

export const updateCustomerAddress = async (addressId, addressData) => {
  const token = await getToken();
  if (!token) {
    throw new Error('غير مصادق عليه');
  }
  return CustomerProfileManager.updateAddress(addressId, addressData, token);
};

export const deleteCustomerAddress = async (addressId) => {
  const token = await getToken();
  if (!token) {
    throw new Error('غير مصادق عليه');
  }
  return CustomerProfileManager.deleteAddress(addressId, token);
};

export default customerProfileManager;
