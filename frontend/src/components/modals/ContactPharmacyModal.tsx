type Pharmacy = {
  mobile: string | null | undefined;
  tel: string | null | undefined;
  phone_number: string | null | undefined;
  contact_phone: string | null | undefined;
  id?: number;
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  pharmacy?: Pharmacy | null;
};

export default function ContactPharmacyModal({ open, onClose, pharmacy }: Props) {
  if (!open || !pharmacy) return null;

  const email = pharmacy.email || 'Not provided';
  const phone = pharmacy.phone || pharmacy.contact_phone || pharmacy.phone_number || pharmacy.tel || pharmacy.mobile || 'Not provided';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-medium">
            Contact {pharmacy.name || 'Pharmacy'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <div className="text-sm text-gray-500">Email</div>
            <div className="text-sm">
              {pharmacy.email ? (
                <a
                  href={`mailto:${pharmacy.email}`}
                  className="text-blue-600 hover:underline break-words"
                >
                  {pharmacy.email}
                </a>
              ) : (
                <span className="text-gray-600">{email}</span>
              )}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Phone</div>
            <div className="text-sm">
              {pharmacy.phone ? (
                <a href={`tel:${pharmacy.phone}`} className="text-blue-600 hover:underline">
                  {pharmacy.phone}
                </a>
              ) : (
                <span className="text-gray-600">{phone}</span>
              )}
            </div>
          </div>

          {pharmacy.address ? (
            <div>
              <div className="text-sm text-gray-500">Address</div>
              <div className="text-sm text-gray-700">{pharmacy.address}</div>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-250"
          >
            Close
          </button>
          {pharmacy.email ? (
            <a
              href={`mailto:${pharmacy.email}`}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={onClose}
            >
              Send Email
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}