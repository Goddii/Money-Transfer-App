import { LayoutGrid, Users, ScrollText, TrendingUp } from 'lucide-react';

export const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/revenue', label: 'Revenue', icon: TrendingUp },
  { to: '/admin/audit', label: 'Audit Log', icon: ScrollText },
];
