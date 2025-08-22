
import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EnhancedBillingModule } from "@/components/modules/billing/enhanced-billing-module";

export default async function FacturacionPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return <EnhancedBillingModule />;
}
