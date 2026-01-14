import { redirect } from 'next/navigation';

export default function AdminDashboardRedirect() {
  // Dashboard page removed — send users to the root where admin home is displayed
  redirect('/');
}
