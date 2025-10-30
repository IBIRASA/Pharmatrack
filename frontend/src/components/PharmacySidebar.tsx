import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function PharmacySidebar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // toggle handler for the header hamburger (same event name used in Header.tsx)
    const handler = () => setOpen(prev => !prev);
    window.addEventListener('toggleSidebar', handler as EventListener);
    return () => window.removeEventListener('toggleSidebar', handler as EventListener);
  }, []);

  return (
    <>
      {/* mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      {/* sidebar panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white z-50 transform transition-transform md:relative md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open && window.innerWidth < 768}
      >
        <div className="flex items-center justify-between p-4 border-b md:hidden">
          <div className="text-lg font-semibold">Menu</div>
          <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <NavLink to="/pharmacy-dashboard" className="block px-4 py-2 rounded hover:bg-gray-100">Overview</NavLink>
          <NavLink to="/pharmacy-dashboard/inventory" className="block px-4 py-2 rounded hover:bg-gray-100">Inventory</NavLink>
          <NavLink to="/pharmacy-dashboard/orders" className="block px-4 py-2 rounded hover:bg-gray-100">Orders</NavLink>
          <NavLink to="/login" className="block px-4 py-2 rounded md:hidden hover:bg-gray-100">Login</NavLink>
          <NavLink to="/register" className="block px-4 py-2 mt-2 rounded bg-green-600 text-white md:hidden text-center hover:bg-green-700">Register</NavLink>
        </nav>
      </aside>
    </>
  );
}
