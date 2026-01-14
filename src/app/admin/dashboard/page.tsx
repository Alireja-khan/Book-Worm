import { redirect } from 'next/navigation';

export default function AdminDashboardRedirect() {
  // Admin dashboard is now integrated into the root page (/)
  // Redirect to root where the enhanced admin dashboard is displayed
  redirect('/');
}