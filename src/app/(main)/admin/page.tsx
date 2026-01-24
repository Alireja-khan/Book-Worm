import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminIndexPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    // Not authenticated — send to login
    return redirect('/auth/login');
  }

  if (session.user.role !== 'admin') {
    // Not an admin — send to homepage
    return redirect('/');
  }

  // Authenticated admin — send to root where the admin home is shown
  return redirect('/');
}
