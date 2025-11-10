import { useEffect, useState } from 'react';
import { useTranslation } from '../../i18n';
import { Edit, Trash2, ChevronLeft, ChevronRight, Search, Plus } from 'lucide-react';
import SellMedicineModal from '../../components/modals/SellMedicineModal';
import AddMedicineModal from '../../components/modals/AddMedicineModal';
import { getMedicines, updateMedicine, deleteMedicine } from '../../utils/api';
import EditMedicineModal from '../../components/modals/EditMedicineModal';

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

export default function InventoryManager() {
  const { t } = useTranslation();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filtered, setFiltered] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  // simple pagination for nicer UI
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const loadMedicines = async () => {
    setLoading(true);
    try {
      const data = await getMedicines();
      setMedicines(data);
      setFiltered(data);
    } catch (err) {
      console.error('Failed to load medicines', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const handleEdit = (m: Medicine) => {
    setEditingMed(m);
    setEditOpen(true);
  };

  const handleSaveEdit = async (id: number, changes: Partial<Medicine>) => {
    try {
      setMedicines(prev => prev.map(m => m.id === id ? { ...m, ...changes } : m));
      setFiltered(prev => prev.map(m => m.id === id ? { ...m, ...changes } : m));
      await updateMedicine(id, changes);
      await loadMedicines();
    } catch (err) {
      console.error('Failed updating medicine', err);
      await loadMedicines();
      throw err;
    }
  };

  // Filter logic
  useEffect(() => {
    let list = medicines.slice();
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.generic_name || '').toLowerCase().includes(q) ||
          (m.category || '').toLowerCase().includes(q)
      );
    }
    if (showLowStock) {
      list = list.filter((m) => m.is_low_stock || m.stock_quantity <= m.minimum_stock);
    }
    setFiltered(list);
    setPage(1);
  }, [searchQuery, showLowStock, medicines]);

  // onSold implementation (keeps existing behaviour)
  const onSold = async (arg1: any, arg2?: number) => {
    let medId = Number(arg1?.medicine_id ?? arg1?.serverResponse?.medicine_id ?? arg1?.id ?? selectedMed?.id);
    let soldQty = Number(arg2 ?? arg1?.quantity ?? arg1?.serverResponse?.quantity ?? 0);
    if (!medId || !soldQty || soldQty <= 0) {
      setSelectedMed(null);
      setSellOpen(false);
      return;
    }
    setMedicines((prev) =>
      prev.map((m) =>
        m.id === medId
          ? {
              ...m,
              stock_quantity: Math.max(0, m.stock_quantity - soldQty),
              is_low_stock: Math.max(0, m.stock_quantity - soldQty) <= m.minimum_stock,
            }
          : m
      )
    );
    setFiltered((prev) =>
      prev.map((m) =>
        m.id === medId
          ? {
              ...m,
              stock_quantity: Math.max(0, m.stock_quantity - soldQty),
              is_low_stock: Math.max(0, m.stock_quantity - soldQty) <= m.minimum_stock,
            }
          : m
      )
    );

    setSelectedMed(null);
    setSellOpen(false);

    try {
      const med = medicines.find((x) => x.id === medId);
      if (med) {
        const newQty = Math.max(0, med.stock_quantity - soldQty);
        await updateMedicine(medId, { stock_quantity: newQty });
      }
    } catch (err) {
      console.warn('Failed to persist stock change', err);
    }

    (async () => {
      try {
        await loadMedicines();
      } catch (err) {
        console.error('Background refresh failed', err);
      }
    })();
  };

  const handleDelete = async (m: Medicine) => {
    if (!confirm(t('inventory.delete.confirm').replace('{name}', m.name))) return;
    const prevMeds = medicines.slice();
    setMedicines((prev) => prev.filter((x) => x.id !== m.id));
    setFiltered((prev) => prev.filter((x) => x.id !== m.id));
    try {
      await deleteMedicine(m.id);
      await loadMedicines();
    } catch (err: any) {
      console.error('Delete failed, reverting local change', err);
      setMedicines(prevMeds);
      setFiltered(prevMeds);
      alert(t('inventory.delete.failed').replace('{msg}', err instanceof Error ? err.message : String(err)));
    }
  };

  // Pagination slice
  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header: stacks on small screens */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{t('inventory.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('inventory.subtitle')}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('inventory.search.placeholder')}
              className="pl-10 pr-3 py-2 border rounded-md w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>

          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 min-w-[140px]"
            title={t('modals.add_medicine.title')}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('actions.add_medicine')}</span>
            <span className="sm:hidden">{t('actions.add_short')}</span>
          </button>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showLowStock}
              onChange={(e) => setShowLowStock(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-600">{t('filter.low_stock')}</span>
          </label>
        </div>
      </div>

      {/* Desktop / Tablet: table view */}
      <div className="hidden md:block bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('table.header.medicine')}</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('table.header.category')}</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('table.header.price')}</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('table.header.stock')}</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('table.header.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y">
            {pageItems.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{m.name}</div>
                  <div className="text-xs text-gray-500">{m.generic_name}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{m.category}</td>
                <td className="px-6 py-4 text-sm text-gray-800">${parseFloat(m.unit_price).toFixed(2)}</td>
                <td className={`px-6 py-4 text-sm ${m.stock_quantity <= m.minimum_stock ? 'text-orange-600 font-semibold' : 'text-gray-700'}`}>
                  {m.stock_quantity}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => {
                        setSelectedMed(m);
                        setSellOpen(true);
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded-md text-sm"
                    >
                      {t('actions.sell')}
                    </button>

                    <button onClick={() => handleEdit(m)} className="p-2 rounded-md hover:bg-gray-100">
                      <Edit className="w-4 h-4 text-gray-700" />
                    </button>

                    <button onClick={() => handleDelete(m)} className="p-2 rounded-md hover:bg-gray-100">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked card list */}
      <div className="md:hidden space-y-3">
        {pageItems.map((m) => (
          <div key={m.id} className="bg-white shadow rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{m.name}</div>
                <div className="text-xs text-gray-500">{m.generic_name} • {m.category}</div>
                <div className="mt-2 text-sm text-gray-800">Price: ${parseFloat(m.unit_price).toFixed(2)}</div>
                <div className={`mt-1 text-sm ${m.stock_quantity <= m.minimum_stock ? 'text-orange-600 font-semibold' : 'text-gray-700'}`}>
                  Stock: {m.stock_quantity}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => { setSelectedMed(m); setSellOpen(true); }}
                  className="px-3 py-1 bg-green-600 text-white rounded-md text-sm"
                >
                  {t('actions.sell')}
                </button>

                <div className="flex gap-2">
                  <button onClick={() => handleEdit(m)} className="p-2 rounded-md hover:bg-gray-100">
                    <Edit className="w-4 h-4 text-gray-700" />
                  </button>
                  <button onClick={() => handleDelete(m)} className="p-2 rounded-md hover:bg-gray-100">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {pageItems.length === 0 && (
          <div className="bg-white rounded-lg p-6 text-center text-gray-500">
            {loading ? t('inventory.loading') : t('inventory.empty')}
          </div>
        )}
      </div>

      {/* Footer with pagination */}
      <div className="mt-4 px-2 py-3 bg-transparent flex items-center justify-between gap-2">
        <div className="text-sm text-gray-600">
          Showing {start + 1}–{Math.min(start + pageSize, filtered.length)} of {filtered.length}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-2 text-sm">
            Page {page} / {pageCount}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page >= pageCount}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AddMedicineModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={async (medicine) => {
          setMedicines((prev) => [medicine, ...prev]);
          setFiltered((prev) => [medicine, ...prev]);
          setAddOpen(false);
          try { await loadMedicines(); } catch {}
        }}
      />

      <SellMedicineModal
        open={sellOpen}
        onClose={() => {
          setSellOpen(false);
          setSelectedMed(null);
        }}
        medicine={selectedMed}
        onSold={onSold}
      />

      <EditMedicineModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingMed(null);
        }}
        medicine={editingMed}
        onSave={async (id, changes) => {
          await handleSaveEdit(id, changes);
        }}
      />
    </div>
  );
}