'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Package, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const productItems = [
  { title: 'Add Product', icon: Plus, path: '/products/new' },
  { title: 'Product List', icon: Package, path: '/products' },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-50',
          'w-72 md:w-64 h-screen flex flex-col',
          'bg-white border-r border-slate-200 shadow-xl md:shadow-none',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden ring-2 ring-teal-400 shadow-md">
              <Image
                src="/logo.jpeg"
                alt="ProSmart Logo"
                width={44}
                height={44}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-lg block">ProSmart</span>
              <span className="text-xs text-slate-500">Admin Panel</span>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto bg-white">
          {/* Products Section */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">
              Products
            </p>
            <ul className="space-y-1">
              {productItems.map((item) => {
                const isActive = pathname === item.path || 
                  (item.path === '/products' && pathname?.startsWith('/products') && pathname !== '/products/new');
                
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-white border-2 border-teal-500 text-teal-600 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 border-2 border-transparent hover:border-slate-200'
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Logout placed below product list */}
          <div className="mt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white border-2 border-rose-500 text-rose-600 hover:bg-rose-50 hover:border-rose-600 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Log out</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};
