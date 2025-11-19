// src/utils/expirationCheck.ts
import { Medicine } from './api';

export interface ExpirationStatus {
  is_expiring_soon: boolean;
  is_expired: boolean;
  days_until_expiry: number;
  expiration_level: 'normal' | 'warning' | 'critical' | 'expired';
  expiration_message: string;
}

export type MedicineWithExpiration = Medicine & ExpirationStatus;

export const checkMedicineExpiration = (medicines: Medicine[]): MedicineWithExpiration[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize time to compare dates properly
  
  const criticalDays = 30; // 1 month
  const warningDays = 60; // 2 months
  
  return medicines.map(medicine => {
    try {
      const expiryDate = new Date(medicine.expiry_date);
      expiryDate.setHours(0, 0, 0, 0); // Normalize time
      
      const timeDiff = expiryDate.getTime() - today.getTime();
      const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      const isExpiringSoon = daysUntilExpiry <= warningDays && daysUntilExpiry > 0;
      const isExpired = daysUntilExpiry < 0; // Changed to < 0 to catch expired items
      
      let expiration_level: 'normal' | 'warning' | 'critical' | 'expired' = 'normal';
      let expiration_message = '';
      
      if (isExpired) {
        expiration_level = 'expired';
        expiration_message = `EXPIRED ${Math.abs(daysUntilExpiry)} days ago`;
      } else if (daysUntilExpiry <= criticalDays) {
        expiration_level = 'critical';
        const months = Math.floor(daysUntilExpiry / 30);
        const days = daysUntilExpiry % 30;
        expiration_message = `Expires in ${months > 0 ? `${months} month${months > 1 ? 's' : ''} ` : ''}${days > 0 ? `${days} day${days > 1 ? 's' : ''}` : ''}`.trim();
        if (expiration_message === 'Expires in') {
          expiration_message = 'Expires today';
        }
      } else if (daysUntilExpiry <= warningDays) {
        expiration_level = 'warning';
        const months = Math.floor(daysUntilExpiry / 30);
        expiration_message = `Expires in ${months} month${months > 1 ? 's' : ''}`;
      } else {
        expiration_level = 'normal';
        const months = Math.floor(daysUntilExpiry / 30);
        expiration_message = `Expires in ${months}+ months`;
      }
      
      return {
        ...medicine,
        is_expiring_soon: isExpiringSoon,
        is_expired: isExpired,
        days_until_expiry: daysUntilExpiry,
        expiration_level,
        expiration_message
      };
    } catch (error) {
      console.error('Error processing medicine expiration:', medicine, error);
      // Return medicine with safe defaults if there's an error
      return {
        ...medicine,
        is_expiring_soon: false,
        is_expired: false,
        days_until_expiry: 999,
        expiration_level: 'normal',
        expiration_message: 'Expiry date error'
      };
    }
  });
};

export const getCriticalExpiringMedicines = (medicines: MedicineWithExpiration[]): MedicineWithExpiration[] => {
  return medicines.filter(medicine => 
    medicine.expiration_level === 'critical' && !medicine.is_expired
  );
};

export const getWarningExpiringMedicines = (medicines: MedicineWithExpiration[]): MedicineWithExpiration[] => {
  return medicines.filter(medicine => 
    medicine.expiration_level === 'warning' && !medicine.is_expired
  );
};

export const getExpiredMedicines = (medicines: MedicineWithExpiration[]): MedicineWithExpiration[] => {
  return medicines.filter(medicine => medicine.is_expired);
};

export const getExpirationStats = (medicines: MedicineWithExpiration[]) => {
  return {
    critical: medicines.filter(m => m.expiration_level === 'critical').length,
    warning: medicines.filter(m => m.expiration_level === 'warning').length,
    expired: medicines.filter(m => m.is_expired).length,
    totalExpiring: medicines.filter(m => m.is_expiring_soon).length
  };
};