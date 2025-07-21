'use client';

import DashboardLayout from './components/DashboardLayout';

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  // For testing/development: Dashboard is freely accessible
  // TODO: Add tier protection before production launch
  return <DashboardLayout>{children}</DashboardLayout>;
}
