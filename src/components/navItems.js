import { LayoutGrid, Users, ScrollText, Settings } from 'lucide-react';

export const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/settings', label: 'Audit Log', icon: ScrollText },
  { to: '/settings', label: 'Settings', icon: Settings },
];
