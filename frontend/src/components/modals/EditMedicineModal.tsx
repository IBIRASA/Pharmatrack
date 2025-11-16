import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface MedicinePatch {
  name?: string;
  generic_name?: string;
  manufacturer?: string;
  category?: string;
  dosage?: string;
  unit_price?: string;
  stock_quantity?: number;
  minimum_stock?: number;
  expiry_date?: string;
  description?: string;
}

interface EditMedicineModalProps {
  open: boolean;
  onClose: () => void;
  medicine: (MedicinePatch & { id?: number }) | null;
  onSave: (id: number, changes: Partial<MedicinePatch>) => Promise<void>;
}

const EditMedicineModal: React.FC<EditMedicineModalProps> = ({ open, onClose, medicine, onSave }) => {
  const [form, setForm] = useState<MedicinePatch>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (open && medicine) {
      setForm({
        name: medicine.name ?? '',
        generic_name: medicine.generic_name ?? '',
        manufacturer: medicine.manufacturer ?? '',
        category: medicine.category ?? '',
        dosage: medicine.dosage ?? '',
        unit_price: medicine.unit_price ?? '0.00',
        stock_quantity: medicine.stock_quantity ?? 0,
        minimum_stock: medicine.minimum_stock ?? 0,
        expiry_date: medicine.expiry_date ?? '',
        description: medicine.description ?? '',
      });
      setError(null);
    }
  }, [open, medicine]);

  if (!open || !medicine) return null;

  const handleChange = (k: keyof MedicinePatch, v: any) => {
    setForm((s) => ({ ...s, [k]: v }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!medicine?.id) return;
    if (!form.name || String(form.name).trim() === '') {
      setError(t('validation.medicine_name_required'));
      return;
    }

    setLoading(true);
    try {
      const changes: Partial<MedicinePatch> = {
        name: String(form.name).trim(),
        generic_name: form.generic_name ? String(form.generic_name).trim() : undefined,
        manufacturer: form.manufacturer ? String(form.manufacturer).trim() : undefined,
        category: form.category ? String(form.category).trim() : undefined,
        dosage: form.dosage ? String(form.dosage).trim() : undefined,
        unit_price: form.unit_price ? String(form.unit_price) : undefined,
        stock_quantity: typeof form.stock_quantity === 'number' ? form.stock_quantity : undefined,
        minimum_stock: typeof form.minimum_stock === 'number' ? form.minimum_stock : undefined,
        expiry_date: form.expiry_date || undefined,
        description: form.description ? String(form.description).trim() : undefined,
      };

      await onSave(Number(medicine.id), changes);
      onClose();
    } catch (err: any) {
      console.error('Edit save failed', err);
      setError(err?.message || 'Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0  bg-black/30 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold">{t('modals.edit_medicine.title')}</h3>
          <button onClick={onClose} disabled={loading} className="text-gray-600 hover:text-gray-800" aria-label={t('modals.edit_medicine.close') ?? undefined}>
            <X className="w-5 h-5" />
          </button>
        </div>

  <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 72px)' }}>
          {error && <div className="text-sm text-red-700 bg-red-50 p-2 rounded">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('modals.edit_medicine.name_label') ?? 'Name'}</label>
            <input value={form.name as string} onChange={(e) => handleChange('name', e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder={t('modals.add_medicine.generic_label')} value={form.generic_name as string} onChange={(e) => handleChange('generic_name', e.target.value)} className="px-3 py-2 border rounded" />
            <input placeholder={t('modals.add_medicine.manufacturer_label')} value={form.manufacturer as string} onChange={(e) => handleChange('manufacturer', e.target.value)} className="px-3 py-2 border rounded" />
            <input placeholder={t('modals.add_medicine.category_label')} value={form.category as string} onChange={(e) => handleChange('category', e.target.value)} className="px-3 py-2 border rounded" />
            <input placeholder={t('modals.add_medicine.dosage_label')} value={form.dosage as string} onChange={(e) => handleChange('dosage', e.target.value)} className="px-3 py-2 border rounded" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input placeholder={t('modals.add_medicine.unit_price_label')} value={form.unit_price as string} onChange={(e) => handleChange('unit_price', e.target.value)} className="px-3 py-2 border rounded" />
            <input type="number" placeholder={t('modals.add_medicine.stock_quantity_label')} value={String(form.stock_quantity)} onChange={(e) => handleChange('stock_quantity', Number(e.target.value || 0))} className="px-3 py-2 border rounded" />
            <input type="number" placeholder={t('modals.add_medicine.minimum_stock_label')} value={String(form.minimum_stock)} onChange={(e) => handleChange('minimum_stock', Number(e.target.value || 0))} className="px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('modals.add_medicine.expiry_label')}</label>
            <input type="date" value={form.expiry_date as string} onChange={(e) => handleChange('expiry_date', e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('modals.add_medicine.description_label')}</label>
            <textarea value={form.description as string} onChange={(e) => handleChange('description', e.target.value)} rows={3} className="w-full px-3 py-2 border rounded" />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 border rounded">{t('actions.cancel')}</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('modals.edit_medicine.saving') ?? 'Saving...'}</> : <>{t('modals.edit_medicine.save')}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMedicineModal;