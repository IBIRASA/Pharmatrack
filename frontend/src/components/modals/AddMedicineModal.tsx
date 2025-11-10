import React, { useState, useEffect } from 'react';
import { X, Loader2, Plus } from 'lucide-react';
import { createMedicine } from '../../utils/api';
import { useTranslation } from '../../i18n';

interface AddMedicineModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (medicine: any) => void;
}

const AddMedicineModal: React.FC<AddMedicineModalProps> = ({ open, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [category, setCategory] = useState('');
  const [dosage, setDosage] = useState('');
  const [unitPrice, setUnitPrice] = useState('0.00');
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [minimumStock, setMinimumStock] = useState<number>(0);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { t } = useTranslation();

  useEffect(() => {
    if (open) {
      setName('');
      setGenericName('');
      setManufacturer('');
      setCategory('');
      setDosage('');
      setUnitPrice('0.00');
      setStockQuantity(0);
      setMinimumStock(0);
      setExpiryDate('');
      setDescription('');
      setError(null);
      setFieldErrors({});
    }
  }, [open]);

  if (!open) return null;

  const validate = () => {
    const fe: Record<string, string> = {};
    if (!name.trim()) fe.name = t('validation.medicine_name_required');
    if (!unitPrice || Number(unitPrice) < 0) fe.unitPrice = t('validation.enter_valid_price');
    if (stockQuantity < 0) fe.stockQuantity = t('validation.stock_cannot_negative');
    if (minimumStock < 0) fe.minimumStock = t('validation.minimum_stock_negative');
    setFieldErrors(fe);
    return Object.keys(fe).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        generic_name: genericName.trim() || undefined,
        manufacturer: manufacturer.trim() || undefined,
        category: category.trim() || undefined,
        dosage: dosage.trim() || undefined,
        unit_price: Number(unitPrice).toFixed(2),
        stock_quantity: Number(stockQuantity),
        minimum_stock: Number(minimumStock),
        expiry_date: expiryDate || undefined,
        description: description.trim() || undefined,
      };

      const created = await createMedicine(payload);
      onCreated(created);
      onClose();
    } catch (err: any) {
      console.error('Create medicine error:', err);
      setError(err?.detail || err?.message || 'Failed to create medicine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0  bg-black/30 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="add-medicine-title">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-y-auto">
        <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 text-green-600" />
            <h3 id="add-medicine-title" className="text-lg font-semibold">{t('modals.add_medicine.title')}</h3>
          </div>
          <button onClick={onClose} disabled={loading} aria-label={t('modals.add_medicine.close')} className="text-gray-600 hover:text-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* global error */}
          {error && <div className="text-sm text-red-700 bg-red-50 p-2 rounded">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('modals.add_medicine.name_label') ?? 'Medicine name'} <span className="text-red-500">*</span></label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Paracetamol 500mg"
              className={`mt-1 block w-full px-3 py-2 border rounded ${fieldErrors.name ? 'border-red-400' : 'border-gray-300'}`}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{t('modals.add_medicine.name_help') ?? 'Provide the full product name used on labels.'}</p>
            {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('modals.add_medicine.generic_label')}</label>
              <input value={genericName} onChange={(e) => setGenericName(e.target.value)} placeholder="e.g., Acetaminophen" className="mt-1 block w-full px-3 py-2 border rounded border-gray-300" />
              <p className="text-xs text-gray-500 mt-1">{t('modals.add_medicine.generic_help')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{t('modals.add_medicine.manufacturer_label')}</label>
              <input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} placeholder="e.g., Pharma Ltd." className="mt-1 block w-full px-3 py-2 border rounded border-gray-300" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{t('modals.add_medicine.category_label')}</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Analgesic" className="mt-1 block w-full px-3 py-2 border rounded border-gray-300" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{t('modals.add_medicine.dosage_label')}</label>
              <input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g., 500 mg" className="mt-1 block w-full px-3 py-2 border rounded border-gray-300" />
            </div>
          </div>

          {/* Pricing & stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('modals.add_medicine.unit_price_label')}</label>
              <input
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="e.g., 12.50"
                className={`mt-1 block w-full px-3 py-2 border rounded ${fieldErrors.unitPrice ? 'border-red-400' : 'border-gray-300'}`}
                inputMode="decimal"
              />
              {fieldErrors.unitPrice && <p className="text-xs text-red-600 mt-1">{fieldErrors.unitPrice}</p>}
              <p className="text-xs text-gray-500 mt-1">{t('modals.add_medicine.price_help') ?? 'Enter numeric price per unit (use dot for decimals).'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{t('modals.add_medicine.stock_quantity_label')}</label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value || 0))}
                min={0}
                className={`mt-1 block w-full px-3 py-2 border rounded ${fieldErrors.stockQuantity ? 'border-red-400' : 'border-gray-300'}`}
              />
              {fieldErrors.stockQuantity && <p className="text-xs text-red-600 mt-1">{fieldErrors.stockQuantity}</p>}
              <p className="text-xs text-gray-500 mt-1">{t('modals.add_medicine.stock_help') ?? 'Current available units in stock.'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{t('modals.add_medicine.minimum_stock_label')}</label>
              <input
                type="number"
                value={minimumStock}
                onChange={(e) => setMinimumStock(Number(e.target.value || 0))}
                min={0}
                className={`mt-1 block w-full px-3 py-2 border rounded ${fieldErrors.minimumStock ? 'border-red-400' : 'border-gray-300'}`}
              />
              {fieldErrors.minimumStock && <p className="text-xs text-red-600 mt-1">{fieldErrors.minimumStock}</p>}
              <p className="text-xs text-gray-500 mt-1">{t('modals.add_medicine.minimum_help') ?? 'Notify when stock this value.'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('modals.add_medicine.expiry_label')}</label>
              <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded border-gray-300" />
              <p className="text-xs text-gray-500 mt-1">{t('modals.add_medicine.expiry_help') ?? 'Leave blank for non-expiring items.'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{t('modals.add_medicine.description_label')}</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Tablet, blister pack of 10" className="mt-1 block w-full px-3 py-2 border rounded border-gray-300" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 border rounded">{t('actions.cancel')}</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('modals.add_medicine.saving')}</> : <>{t('modals.add_medicine.save')}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicineModal;