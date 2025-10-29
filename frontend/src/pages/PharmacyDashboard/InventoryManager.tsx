// import React, { useEffect, useState } from 'react';
// import {
//   Package as PackageIcon,
//   Plus,
//   Search as SearchIcon,
//   Edit,
//   Trash2,
//   Loader as LoaderIcon,
//   AlertCircle as AlertCircleIcon,
//   X,
//   Info,
// } from 'lucide-react';
// import { getMedicines, createMedicine, updateMedicine, deleteMedicine,sellMedicine } from '../../utils/api';


// interface Medicine {
//   id: number;
//   name: string;
//   generic_name: string;
//   manufacturer: string;
//   category: string;
//   dosage: string;
//   unit_price: string;
//   stock_quantity: number;
//   minimum_stock: number;
//   expiry_date: string;
//   description: string;
//   is_low_stock?: boolean;
// }

// export default function InventoryManager() {
//   const [medicines, setMedicines] = useState<Medicine[]>([]);
//   const [filtered, setFiltered] = useState<Medicine[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [categoryFilter, setCategoryFilter] = useState('');
//   const [showLowStock, setShowLowStock] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [editing, setEditing] = useState<Medicine | null>(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     generic_name: '',
//     manufacturer: '',
//     category: '',
//     dosage: '',
//     unit_price: '',
//     stock_quantity: 0,
//     minimum_stock: 50,
//     expiry_date: '',
//     description: '',
//   });

//   useEffect(() => { loadMedicines(); }, []);

//   useEffect(() => {
//     let f = [...medicines];
//     const q = searchQuery.toLowerCase();
//     if (q) {
//       f = f.filter(m =>
//         m.name.toLowerCase().includes(q) ||
//         m.generic_name.toLowerCase().includes(q) ||
//         m.manufacturer.toLowerCase().includes(q)
//       );
//     }
//     if (categoryFilter) f = f.filter(m => m.category === categoryFilter);
//     if (showLowStock) f = f.filter(m => m.is_low_stock);
//     setFiltered(f);
//   }, [medicines, searchQuery, categoryFilter, showLowStock]);

//   const loadMedicines = async () => {
//     try {
//       setLoading(true);
//       const data = await getMedicines();
//       setMedicines(data);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const categories = Array.from(new Set(medicines.map(m => m.category))).filter(Boolean) as string[];

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       if (editing) {
//         await updateMedicine(editing.id, formData);
//       } else {
//         await createMedicine(formData);
//       }
//       setShowModal(false);
//       setEditing(null);
//       resetForm();
//       await loadMedicines();
//     } catch (error) {
//       console.error('Error saving medicine:', error);
//       alert('Failed to save medicine. Please try again.');
//     }
//   };

//   const handleEdit = (m: Medicine) => {
//     setEditing(m);
//     setFormData({
//       name: m.name,
//       generic_name: m.generic_name,
//       manufacturer: m.manufacturer,
//       category: m.category,
//       dosage: m.dosage,
//       unit_price: m.unit_price,
//       stock_quantity: m.stock_quantity,
//       minimum_stock: m.minimum_stock,
//       expiry_date: m.expiry_date,
//       description: m.description,
//     });
//     setShowModal(true);
//   };

//   const handleDelete = async (id: number) => {
//     if (!confirm('Are you sure you want to delete this medicine?')) return;
//     try {
//       await deleteMedicine(id);
//       await loadMedicines();
//     } catch (error) {
//       console.error('Error deleting medicine:', error);
//       alert('Failed to delete medicine. Please try again.');
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       generic_name: '',
//       manufacturer: '',
//       category: '',
//       dosage: '',
//       unit_price: '',
//       stock_quantity: 0,
//       minimum_stock: 50,
//       expiry_date: '',
//       description: '',
//     });
//   };

//   if (loading) {
//     return (
//       <div className="min-h-[300px] flex items-center justify-center">
//         <LoaderIcon className="w-8 h-8 animate-spin text-green-600" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
//           <p className="text-gray-600 mt-1">Manage your medicine stock</p>
//         </div>
//         <button
//           onClick={() => { setEditing(null); resetForm(); setShowModal(true); }}
//           className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
//         >
//           <Plus className="w-5 h-5" />
//           Add Medicine
//         </button>
//       </div>

//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div className="relative">
//             <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//             <input
//               type="text"
//               placeholder="Search medicines..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//             />
//           </div>
//           <select
//             value={categoryFilter}
//             onChange={(e) => setCategoryFilter(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           >
//             <option value="">All Categories</option>
//             {categories.map((c) => <option key={c} value={c}>{c}</option>)}
//           </select>
//           <button
//             onClick={() => setShowLowStock(!showLowStock)}
//             className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
//               showLowStock ? 'bg-orange-50 border-orange-300 text-orange-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
//             }`}
//           >
//             <AlertCircleIcon className="w-5 h-5" />
//             Low Stock Only
//           </button>
//           <div className="text-sm text-gray-600 flex items-center">
//             <span className="font-semibold">{filtered.length}</span>
//             <span className="ml-1">items</span>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filtered.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
//                     <PackageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
//                     <p className="text-lg font-medium">No medicines found</p>
//                     <p className="text-sm mt-1">Try adjusting your search or filters</p>
//                   </td>
//                 </tr>
//               ) : (
//                 filtered.map((m) => (
//                   <tr key={m.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4">
//                       <div>
//                         <p className="font-semibold text-gray-900">{m.name}</p>
//                         <p className="text-sm text-gray-600">{m.dosage}</p>
//                         <p className="text-xs text-gray-500">{m.manufacturer}</p>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-700">{m.category}</td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2">
//                         <span className={`font-semibold ${m.is_low_stock ? 'text-orange-600' : 'text-gray-900'}`}>
//                           {m.stock_quantity}
//                         </span>
//                         {m.is_low_stock && <AlertCircleIcon className="w-4 h-4 text-orange-500" />}
//                       </div>
//                       <p className="text-xs text-gray-500">Min: {m.minimum_stock}</p>
//                     </td>
//                     <td className="px-6 py-4 text-sm font-semibold text-gray-900">
//                       ${parseFloat(m.unit_price).toFixed(2)}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-700">
//                       {new Date(m.expiry_date).toLocaleDateString()}
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2">
//                         <button 
//                           onClick={() => handleEdit(m)} 
//                           className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                           title="Edit medicine"
//                         >
//                           <Edit className="w-4 h-4" />
//                         </button>
//                         <button 
//                           onClick={() => handleDelete(m.id)} 
//                           className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                           title="Delete medicine"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {showModal && (
//         <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 {editing ? 'Edit Medicine' : 'Add New Medicine'}
//               </h3>
//               <button 
//                 onClick={() => { setShowModal(false); setEditing(null); resetForm(); }}
//                 className="text-gray-600 hover:text-gray-800 transition-colors"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6 space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Medicine Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     placeholder="e.g., Paracetamol"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Generic Name
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="e.g., Acetaminophen"
//                     value={formData.generic_name}
//                     onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Manufacturer <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     placeholder="e.g., Pfizer"
//                     value={formData.manufacturer}
//                     onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Category <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     placeholder="e.g., Pain Relief, Antibiotic"
//                     value={formData.category}
//                     onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Dosage <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     placeholder="e.g., 500mg, 10ml"
//                     value={formData.dosage}
//                     onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Unit Price ($) <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     required
//                     placeholder="e.g., 5.99"
//                     value={formData.unit_price}
//                     onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Current Stock Quantity <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="number"
//                     required
//                     min="0"
//                     placeholder="e.g., 500"
//                     value={formData.stock_quantity}
//                     onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value || '0') })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   />
//                   <div className="flex items-start gap-1 mt-1">
//                     <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
//                     <p className="text-xs text-gray-500">Number of units currently in stock</p>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Minimum Stock Level <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="number"
//                     required
//                     min="0"
//                     placeholder="e.g., 50"
//                     value={formData.minimum_stock}
//                     onChange={(e) => setFormData({ ...formData, minimum_stock: parseInt(e.target.value || '0') })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   />
//                   <div className="flex items-start gap-1 mt-1">
//                     <AlertCircleIcon className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
//                     <p className="text-xs text-gray-500">You'll be alerted when stock falls below this level</p>
//                   </div>
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Expiry Date <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="date"
//                     required
//                     min={new Date().toISOString().split('T')[0]}
//                     value={formData.expiry_date}
//                     onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Description
//                 </label>
//                 <textarea
//                   rows={3}
//                   placeholder="Additional information about the medicine (optional)"
//                   value={formData.description}
//                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                 />
//               </div>

//               <div className="flex items-center justify-end gap-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => { setShowModal(false); setEditing(null); resetForm(); }}
//                   className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
//                 >
//                   {editing ? 'Update Medicine' : 'Add Medicine'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// import React, { useEffect, useState } from 'react';
// import {
//   Package as PackageIcon,
//   Plus,
//   Search as SearchIcon,
//   Edit,
//   Trash2,
//   Loader as LoaderIcon,
//   AlertCircle as AlertCircleIcon,
//   X,
//   Info,
//   ShoppingCart,
// } from 'lucide-react';
// import { getMedicines, createMedicine, updateMedicine, deleteMedicine, sellMedicine } from '../../utils/api';
// import SellMedicine from '../../components/modals/SellMedicineModal';

// interface Medicine {
//   id: number;
//   name: string;
//   generic_name: string;
//   manufacturer: string;
//   category: string;
//   dosage: string;
//   unit_price: string;
//   stock_quantity: number;
//   minimum_stock: number;
//   expiry_date: string;
//   description: string;
//   is_low_stock?: boolean;
// }

// export default function InventoryManager() {
//   const [medicines, setMedicines] = useState<Medicine[]>([]);
//   const [filtered, setFiltered] = useState<Medicine[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [categoryFilter, setCategoryFilter] = useState('');
//   const [showLowStock, setShowLowStock] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [editing, setEditing] = useState<Medicine | null>(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     generic_name: '',
//     manufacturer: '',
//     category: '',
//     dosage: '',
//     unit_price: '',
//     stock_quantity: 0,
//     minimum_stock: 50,
//     expiry_date: '',
//     description: '',
//   });

//   // Sell modal state
//   const [sellOpen, setSellOpen] = useState(false);
//   const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);

//   useEffect(() => { loadMedicines(); }, []);

//   useEffect(() => {
//     let f = [...medicines];
//     const q = searchQuery.toLowerCase();
//     if (q) {
//       f = f.filter(m =>
//         m.name.toLowerCase().includes(q) ||
//         m.generic_name.toLowerCase().includes(q) ||
//         m.manufacturer.toLowerCase().includes(q)
//       );
//     }
//     if (categoryFilter) f = f.filter(m => m.category === categoryFilter);
//     if (showLowStock) f = f.filter(m => m.is_low_stock);
//     setFiltered(f);
//   }, [medicines, searchQuery, categoryFilter, showLowStock]);

//   const loadMedicines = async () => {
//     try {
//       setLoading(true);
//       const data = await getMedicines();
//       setMedicines(data);
//     } catch (err) {
//       console.error('Failed to load medicines', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const categories = Array.from(new Set(medicines.map(m => m.category))).filter(Boolean) as string[];

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       if (editing) {
//         await updateMedicine(editing.id, formData);
//       } else {
//         await createMedicine(formData);
//       }
//       setShowModal(false);
//       setEditing(null);
//       resetForm();
//       await loadMedicines();
//     } catch (error) {
//       console.error('Error saving medicine:', error);
//       alert('Failed to save medicine. Please try again.');
//     }
//   };

//   const handleEdit = (m: Medicine) => {
//     setEditing(m);
//     setFormData({
//       name: m.name,
//       generic_name: m.generic_name,
//       manufacturer: m.manufacturer,
//       category: m.category,
//       dosage: m.dosage,
//       unit_price: m.unit_price,
//       stock_quantity: m.stock_quantity,
//       minimum_stock: m.minimum_stock,
//       expiry_date: m.expiry_date,
//       description: m.description,
//     });
//     setShowModal(true);
//   };

//   const handleDelete = async (id: number) => {
//     if (!confirm('Are you sure you want to delete this medicine?')) return;
//     try {
//       await deleteMedicine(id);
//       await loadMedicines();
//     } catch (error) {
//       console.error('Error deleting medicine:', error);
//       alert('Failed to delete medicine. Please try again.');
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       generic_name: '',
//       manufacturer: '',
//       category: '',
//       dosage: '',
//       unit_price: '',
//       stock_quantity: 0,
//       minimum_stock: 50,
//       expiry_date: '',
//       description: '',
//     });
//   };

//   // Open sell modal
//   const openSell = (m: Medicine) => {
//     setSelectedMed(m);
//     setSellOpen(true);
//   };

//   // Called after successful sale from modal
//   const onSold = (order: any, qty: number) => {
//     if (!selectedMed) return;
//     setMedicines(prev =>
//       prev.map(m => m.id === selectedMed.id ? { ...m, stock_quantity: Math.max(0, m.stock_quantity - qty) } : m)
//     );
//     // Update filtered view as well
//     setFiltered(prev =>
//       prev.map(m => m.id === selectedMed.id ? { ...m, stock_quantity: Math.max(0, m.stock_quantity - qty) } : m)
//     );
//     setSelectedMed(null);
//     setSellOpen(false);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-[300px] flex items-center justify-center">
//         <LoaderIcon className="w-8 h-8 animate-spin text-green-600" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
//           <p className="text-gray-600 mt-1">Manage your medicine stock</p>
//         </div>
//         <button
//           onClick={() => { setEditing(null); resetForm(); setShowModal(true); }}
//           className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
//         >
//           <Plus className="w-5 h-5" />
//           Add Medicine
//         </button>
//       </div>

//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div className="relative">
//             <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//             <input
//               type="text"
//               placeholder="Search medicines..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//             />
//           </div>
//           <select
//             value={categoryFilter}
//             onChange={(e) => setCategoryFilter(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//           >
//             <option value="">All Categories</option>
//             {categories.map((c) => <option key={c} value={c}>{c}</option>)}
//           </select>
//           <button
//             onClick={() => setShowLowStock(!showLowStock)}
//             className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
//               showLowStock ? 'bg-orange-50 border-orange-300 text-orange-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
//             }`}
//           >
//             <AlertCircleIcon className="w-5 h-5" />
//             Low Stock Only
//           </button>
//           <div className="text-sm text-gray-600 flex items-center">
//             <span className="font-semibold">{filtered.length}</span>
//             <span className="ml-1">items</span>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filtered.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
//                     <PackageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
//                     <p className="text-lg font-medium">No medicines found</p>
//                     <p className="text-sm mt-1">Try adjusting your search or filters</p>
//                   </td>
//                 </tr>
//               ) : (
//                 filtered.map((m) => (
//                   <tr key={m.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4">
//                       <div>
//                         <p className="font-semibold text-gray-900">{m.name}</p>
//                         <p className="text-sm text-gray-600">{m.dosage}</p>
//                         <p className="text-xs text-gray-500">{m.manufacturer}</p>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-700">{m.category}</td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2">
//                         <span className={`font-semibold ${m.is_low_stock ? 'text-orange-600' : 'text-gray-900'}`}>
//                           {m.stock_quantity}
//                         </span>
//                         {m.is_low_stock && <AlertCircleIcon className="w-4 h-4 text-orange-500" />}
//                       </div>
//                       <p className="text-xs text-gray-500">Min: {m.minimum_stock}</p>
//                     </td>
//                     <td className="px-6 py-4 text-sm font-semibold text-gray-900">
//                       ${parseFloat(String(m.unit_price)).toFixed(2)}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-700">
//                       {new Date(m.expiry_date).toLocaleDateString()}
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => handleEdit(m)}
//                           className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                           title="Edit medicine"
//                         >
//                           <Edit className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(m.id)}
//                           className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                           title="Delete medicine"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => openSell(m)}
//                           className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-md text-sm hover:bg-emerald-200"
//                           disabled={m.stock_quantity <= 0}
//                           title="Sell medicine"
//                         >
//                            <ShoppingCart className="w-4 h-4" />
//                           <span className="ml-2">Sell</span>
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {showModal && (
//         <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 {editing ? 'Edit Medicine' : 'Add New Medicine'}
//               </h3>
//               <button
//                 onClick={() => { setShowModal(false); setEditing(null); resetForm(); }}
//                 className="text-gray-600 hover:text-gray-800 transition-colors"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6 space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Medicine Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     placeholder="e.g., Paracetamol"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Generic Name
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="e.g., Acetaminophen"
//                     value={formData.generic_name}
//                     onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Manufacturer <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     placeholder="e.g., Pfizer"
//                     value={formData.manufacturer}
//                     onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Category <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     placeholder="e.g., Pain Relief, Antibiotic"
//                     value={formData.category}
//                     onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Dosage <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     placeholder="e.g., 500mg, 10ml"
//                     value={formData.dosage}
//                     onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Unit Price ($) <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     required
//                     placeholder="e.g., 5.99"
//                     value={formData.unit_price}
//                     onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Current Stock Quantity <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="number"
//                     required
//                     min="0"
//                     placeholder="e.g., 500"
//                     value={formData.stock_quantity}
//                     onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value || '0') })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   />
//                   <div className="flex items-start gap-1 mt-1">
//                     <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
//                     <p className="text-xs text-gray-500">Number of units currently in stock</p>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Minimum Stock Level <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="number"
//                     required
//                     min="0"
//                     placeholder="e.g., 50"
//                     value={formData.minimum_stock}
//                     onChange={(e) => setFormData({ ...formData, minimum_stock: parseInt(e.target.value || '0') })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   />
//                   <div className="flex items-start gap-1 mt-1">
//                     <AlertCircleIcon className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
//                     <p className="text-xs text-gray-500">You'll be alerted when stock falls below this level</p>
//                   </div>
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Expiry Date <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="date"
//                     required
//                     min={new Date().toISOString().split('T')[0]}
//                     value={formData.expiry_date}
//                     onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Description
//                 </label>
//                 <textarea
//                   rows={3}
//                   placeholder="Additional information about the medicine (optional)"
//                   value={formData.description}
//                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                 />
//               </div>

//               <div className="flex items-center justify-end gap-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => { setShowModal(false); setEditing(null); resetForm(); }}
//                   className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
//                 >
//                   {editing ? 'Update Medicine' : 'Add Medicine'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       <SellMedicine
//         open={sellOpen}
//         onClose={() => { setSellOpen(false); setSelectedMed(null); }}
//         medicine={selectedMed}
//         onSold={(order: any, qty: number) => onSold(order, qty)}
//       />
//     </div>
//   );
// }

import React, { useEffect, useState } from 'react';
import {
  Package as PackageIcon,
  Plus,
  Search as SearchIcon,
  Edit,
  Trash2,
  Loader as LoaderIcon,
  AlertCircle as AlertCircleIcon,
  X,
  Info,
  ShoppingCart,
} from 'lucide-react';
import { getMedicines, createMedicine, updateMedicine, deleteMedicine } from '../../utils/api';
import SellMedicineModal from '../../components/modals/SellMedicineModal';

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
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filtered, setFiltered] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    manufacturer: '',
    category: '',
    dosage: '',
    unit_price: '',
    stock_quantity: 0,
    minimum_stock: 50,
    expiry_date: '',
    description: '',
  });

  // Sell modal state
  const [sellOpen, setSellOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);

  useEffect(() => { 
    loadMedicines(); 
  }, []);

  useEffect(() => {
    let filteredMedicines = [...medicines];
    const query = searchQuery.toLowerCase();
    
    if (query) {
      filteredMedicines = filteredMedicines.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.generic_name.toLowerCase().includes(query) ||
        m.manufacturer.toLowerCase().includes(query) ||
        m.category.toLowerCase().includes(query)
      );
    }
    
    if (categoryFilter) {
      filteredMedicines = filteredMedicines.filter(m => m.category === categoryFilter);
    }
    
    if (showLowStock) {
      filteredMedicines = filteredMedicines.filter(m => m.is_low_stock);
    }
    
    setFiltered(filteredMedicines);
  }, [medicines, searchQuery, categoryFilter, showLowStock]);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const data = await getMedicines();
      setMedicines(data);
    } catch (err) {
      console.error('Failed to load medicines', err);
      alert('Failed to load medicines. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(medicines.map(m => m.category))).filter(Boolean) as string[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateMedicine(editing.id, formData);
      } else {
        await createMedicine(formData);
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      await loadMedicines();
      alert(editing ? 'Medicine updated successfully!' : 'Medicine added successfully!');
    } catch (error) {
      console.error('Error saving medicine:', error);
      alert('Failed to save medicine. Please try again.');
    }
  };

  const handleEdit = (m: Medicine) => {
    setEditing(m);
    setFormData({
      name: m.name,
      generic_name: m.generic_name,
      manufacturer: m.manufacturer,
      category: m.category,
      dosage: m.dosage,
      unit_price: m.unit_price,
      stock_quantity: m.stock_quantity,
      minimum_stock: m.minimum_stock,
      expiry_date: m.expiry_date,
      description: m.description,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this medicine? This action cannot be undone.')) return;
    try {
      await deleteMedicine(id);
      await loadMedicines();
      alert('Medicine deleted successfully!');
    } catch (error) {
      console.error('Error deleting medicine:', error);
      alert('Failed to delete medicine. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      generic_name: '',
      manufacturer: '',
      category: '',
      dosage: '',
      unit_price: '',
      stock_quantity: 0,
      minimum_stock: 50,
      expiry_date: '',
      description: '',
    });
  };

  // Open sell modal
  const openSell = (m: Medicine) => {
    setSelectedMed(m);
    setSellOpen(true);
  };

  // Called after successful sale from modal
  // const onSold = (order: any, qty: number) => {
  //   if (!selectedMed) return;
  const onSold = async (order: any, qty: number) => {
  if (!selectedMed) return;
  
  console.log(` Updating UI for medicine ${selectedMed.id}, sold ${qty} units`);
    // Update local state immediately for better UX
      setMedicines(prev =>
    prev.map(m => m.id === selectedMed.id ? { 
      ...m, 
      stock_quantity: Math.max(0, m.stock_quantity - qty),
      is_low_stock: (m.stock_quantity - qty) <= m.minimum_stock
    } : m)
  );
  
  // Update filtered view as well
  setFiltered(prev =>
    prev.map(m => m.id === selectedMed.id ? { 
      ...m, 
      stock_quantity: Math.max(0, m.stock_quantity - qty),
      is_low_stock: (m.stock_quantity - qty) <= m.minimum_stock
    } : m)
  );
  
  setSelectedMed(null);
  setSellOpen(false);
  
  // Force refresh patient dashboard data
  await refreshPatientDashboard();
  };
  const refreshPatientDashboard = async () => {
  try {
    // This will trigger a re-fetch in the patient dashboard
    console.log('🔄 Refreshing patient dashboard data...');
    
    // You can also broadcast a custom event that the patient dashboard can listen to
    window.dispatchEvent(new CustomEvent('medicineStockUpdated'));
    
  } catch (error) {
    console.error('Error refreshing patient dashboard:', error);
  }
}

  // Calculate statistics
  const totalItems = medicines.length;
  const lowStockCount = medicines.filter(m => m.is_low_stock).length;
  const outOfStockCount = medicines.filter(m => m.stock_quantity === 0).length;

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <LoaderIcon className="w-12 h-12 animate-spin text-green-600 mb-4" />
        <p className="text-gray-600">Loading medicines...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600 mt-1">Manage your medicine stock and sales</p>
        </div>
        <button
          onClick={() => { setEditing(null); resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Medicine
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Medicines</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
            <PackageIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
            </div>
            <AlertCircleIcon className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
            </div>
            <AlertCircleIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Showing</p>
              <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
            </div>
            <SearchIcon className="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          
          <button
            onClick={() => setShowLowStock(!showLowStock)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showLowStock 
                ? 'bg-orange-50 border-orange-300 text-orange-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <AlertCircleIcon className="w-5 h-5" />
            Low Stock Only
          </button>
          
          <div className="text-sm text-gray-600 flex items-center justify-center">
            <span className="font-semibold">{filtered.length}</span>
            <span className="ml-1">items found</span>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <PackageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium text-gray-500">No medicines found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {medicines.length === 0 
                        ? "Get started by adding your first medicine" 
                        : "Try adjusting your search or filters"
                      }
                    </p>
                    {medicines.length === 0 && (
                      <button
                        onClick={() => { setEditing(null); resetForm(); setShowModal(true); }}
                        className="mt-4 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Add Your First Medicine
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((medicine) => (
                  <tr key={medicine.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                          {medicine.name}
                        </p>
                        <p className="text-sm text-gray-600">{medicine.dosage}</p>
                        <p className="text-xs text-gray-500">{medicine.manufacturer}</p>
                        {medicine.generic_name && (
                          <p className="text-xs text-blue-600 mt-1">Generic: {medicine.generic_name}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {medicine.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${
                          medicine.stock_quantity === 0 
                            ? 'text-red-600' 
                            : medicine.is_low_stock 
                            ? 'text-orange-600' 
                            : 'text-gray-900'
                        }`}>
                          {medicine.stock_quantity}
                        </span>
                        {medicine.stock_quantity === 0 && (
                          <AlertCircleIcon className="w-4 h-4 text-red-500" />
                        )}
                        {medicine.is_low_stock && medicine.stock_quantity > 0 && (
                          <AlertCircleIcon className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Min: {medicine.minimum_stock}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">
                        ${parseFloat(String(medicine.unit_price)).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        {new Date(medicine.expiry_date).toLocaleDateString()}
                        {new Date(medicine.expiry_date) < new Date() && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Expired
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(medicine)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                          title="Edit medicine"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(medicine.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                          title="Delete medicine"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openSell(medicine)}
                          disabled={medicine.stock_quantity <= 0}
                          className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                            medicine.stock_quantity <= 0
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                          title={
                            medicine.stock_quantity <= 0 
                              ? "Out of stock" 
                              : `Sell ${medicine.name}`
                          }
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span className="text-sm font-medium">Sell</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Medicine Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">
                {editing ? 'Edit Medicine' : 'Add New Medicine'}
              </h3>
              <button
                onClick={() => { setShowModal(false); setEditing(null); resetForm(); }}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medicine Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Paracetamol"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Generic Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Acetaminophen"
                    value={formData.generic_name}
                    onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manufacturer <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Pfizer"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Pain Relief, Antibiotic"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dosage <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 500mg, 10ml"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g., 5.99"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g., 500"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value || '0') })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <div className="flex items-start gap-1 mt-1">
                    <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500">Number of units currently in stock</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Stock Level <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g., 50"
                    value={formData.minimum_stock}
                    onChange={(e) => setFormData({ ...formData, minimum_stock: parseInt(e.target.value || '0') })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <div className="flex items-start gap-1 mt-1">
                    <AlertCircleIcon className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500">You'll be alerted when stock falls below this level</p>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Additional information about the medicine (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditing(null); resetForm(); }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  {editing ? 'Update Medicine' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sell Medicine Modal */}
      <SellMedicineModal
        open={sellOpen}
        onClose={() => { setSellOpen(false); setSelectedMed(null); }}
        medicine={selectedMed}
        onSold={(order: any, qty: number) => onSold(order, qty)}
      />
    </div>
  );
}