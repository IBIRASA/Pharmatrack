import React, { useState } from "react";
import { sellMedicine } from "../../utils/api";

type Props = {
  open: boolean;
  onClose: () => void;
  medicine: any | null;
  onSold?: (order: any, qty: number) => void;
};

export default function SellMedicineModal({ open, onClose, medicine, onSold }: Props) {
  const [quantity, setQuantity] = useState<number>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || !medicine) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const order = await sellMedicine(medicine.id, quantity, { name: name || undefined, phone: phone || undefined });
      setLoading(false);
      setQuantity(1);
      setName("");
      setPhone("");
      onSold && onSold(order, quantity);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err?.response?.data?.detail || err?.message || "Sale failed");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Sell: {medicine.name}</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Quantity</label>
            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value || "1"))} required />
          </div>
          <div>
            <label>Customer name (optional)</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>Customer phone (optional)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          {error && <div className="error">{error}</div>}
          <div style={{ marginTop: 8 }}>
            <button type="button" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" disabled={loading} style={{ marginLeft: 8 }}>
              {loading ? "Processing..." : `Sell (${medicine.unit_price} each)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}