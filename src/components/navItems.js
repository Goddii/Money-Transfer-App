import { LayoutGrid, Users, ScrollText, Settings } from 'lucide-react';

export const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/audit', label: 'Audit Log', icon: ScrollText },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];
