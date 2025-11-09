import React, { useState, useEffect } from 'react';
import { X, Loader2, ShoppingCart } from 'lucide-react';
import { sellMedicine } from '../../utils/api';

interface Medicine {
  id: number;
  name: string;
  generic_name: string;
  manufacturer: string;
  category: string;
  dosage: string;
  unit_price: string;
  stock_quantity: number;
  minimum_stock: number;
  expiry_date: string;
  description: string;
  is_low_stock?: boolean;
}

interface SellMedicineModalProps {
  open: boolean;
  onClose: () => void;
  medicine: Medicine | null;
  onSold: (order: any, quantity: number) => void;
}

const SellMedicineModal: React.FC<SellMedicineModalProps> = ({ 
  open, 
  onClose, 
  medicine, 
  onSold 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [prescription, setPrescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes or medicine changes
  useEffect(() => {
    if (open && medicine) {
      setQuantity(1);
      setCustomerName('');
      setCustomerPhone('');
      setPrescription('');
      setError('');
    }
  }, [open, medicine]);

  if (!open || !medicine) return null;

  const totalPrice = parseFloat(medicine.unit_price) * quantity;
  const maxQuantity = medicine.stock_quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!medicine) return;

    setLoading(true);
    try {
      const orderData = {
        medicine_id: medicine.id,
        quantity: quantity,
        customer_name: customerName,
        customer_phone: customerPhone,
        prescription: prescription,
        total_price: totalPrice.toFixed(2) 
      };

      console.log('Submitting order data:', orderData);
      
      const result = await sellMedicine(orderData);
      const payload = {
        medicine_id: medicine.id,
        quantity,
        serverResponse: result,
      };

      onSold(payload, quantity);
      onClose();
      
    } catch (error: any) {
      console.error('Error selling medicine:', error);
      const msg = error?.detail || error?.message || JSON.stringify(error);
      alert(`Sale failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };
  const handleQuantityChange = (value: string) => {
    let newQuantity = parseInt(value, 10) || 0;
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > maxQuantity) newQuantity = maxQuantity;
    setQuantity(newQuantity);
  };

  return (
    <div className="fixed inset-0  bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Sell Medicine</h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Medicine Information */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="font-semibold text-gray-900 text-lg">{medicine.name}</h4>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Dosage:</span> {medicine.dosage}</p>
              <p><span className="font-medium">Manufacturer:</span> {medicine.manufacturer}</p>
              <p><span className="font-medium">Category:</span> {medicine.category}</p>
              <p className={`font-medium ${medicine.is_low_stock ? 'text-orange-600' : 'text-gray-700'}`}>
                Available Stock: {medicine.stock_quantity} units
              </p>
              <p className="font-medium text-green-700">
                Price: ${parseFloat(medicine.unit_price).toFixed(2)} per unit
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity to Sell <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum: {maxQuantity} units available • {maxQuantity - quantity} remaining after sale
            </p>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter customer full name"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Phone
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter phone number (optional)"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prescription Details
              </label>
              <textarea
                rows={3}
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter prescription details (optional)"
                disabled={loading}
              />
            </div>
          </div>

          {/* Total Price Display */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total Amount:</span>
              <span className="text-xl font-bold text-green-700">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              {quantity} unit(s) × ${parseFloat(medicine.unit_price).toFixed(2)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || quantity <= 0 || quantity > maxQuantity || !customerName.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Complete Sale
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellMedicineModal;

// Called after successful sale from modal
// const onSold = async (arg1: any, arg2?: number) => {
//   console.debug('onSold called with:', { arg1, arg2, selectedMed });

//   // Normalize inputs: prefer explicit second argument (quantity)
//   let soldQty = Number(arg2 ?? 0);
//   let medId: number | undefined;

//   if (arg1 && typeof arg1 === 'object') {
//     // payload created by modal { medicine_id, quantity, serverResponse }
//     medId = Number(arg1.medicine_id ?? arg1.med_id ?? arg1.serverResponse?.medicine_id ?? selectedMed?.id);
//     if (!soldQty) soldQty = Number(arg1.quantity ?? arg1.serverResponse?.quantity ?? arg1.serverResponse?.soldQuantity ?? 0);
//   }

//   // fallback to selectedMed if medId missing
//   medId = medId ?? selectedMed?.id;

//   if (!medId || soldQty <= 0) {
//     console.warn('onSold: invalid medId or soldQty', { medId, soldQty });
//     setSelectedMed(null);
//     setSellOpen(false);
//     return;
//   }

//   // Functional update to avoid stale closures
//   setMedicines((prev) =>
//     prev.map((m) => (m.id === medId ? { ...m, stock_quantity: Math.max(0, m.stock_quantity - soldQty), is_low_stock: Math.max(0, m.stock_quantity - soldQty) <= m.minimum_stock } : m))
//   );

//   // Update filtered list similarly
//   setFiltered((prev) =>
//     prev.map((m) => (m.id === medId ? { ...m, stock_quantity: Math.max(0, m.stock_quantity - soldQty), is_low_stock: Math.max(0, m.stock_quantity - soldQty) <= m.minimum_stock } : m))
//   );

//   setSelectedMed(null);
//   setSellOpen(false);

//   (async () => {
//     try {
//       await loadMedicines();
//     } catch (err) {
//       console.error('Error refreshing medicines after sale:', err);
//     }
//   })();

//   try {
//     await refreshPatientDashboard();
//   } catch (err) {
//     console.error('Error notifying dashboard:', err);
//   }
// };