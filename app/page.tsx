
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LandingPage from "@/components/landing/LandingPage";

export default async function HomePage() {
  const session = await getServerAuthSession();

  if (session) {
    redirect("/dashboard");
  } else {
    // Show landing page for unauthenticated users
    return <LandingPage />;
  }
}
