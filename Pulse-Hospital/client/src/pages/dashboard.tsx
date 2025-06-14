import { useState } from "react";
import { Layout } from "@/components/layout";
import ElectricalForm from "./electrical-form";
import ACForm from "./ac-form";
import ReportsPage from "./reports";
import { useAuth } from "@/components/auth-provider";
import { hasPermission } from "@/lib/auth";

export default function Dashboard() {
  const [currentTab, setCurrentTab] = useState("electrical");
  const { user } = useAuth();

  const renderContent = () => {
    switch (currentTab) {
      case "electrical":
        return <ElectricalForm />;
      case "ac":
        return <ACForm />;
      case "reports":
        if (hasPermission(user?.role || "", "supervisor")) {
          return <ReportsPage />;
        }
        return <div>Access denied</div>;
      default:
        return <ElectricalForm />;
    }
  };

  return (
    <Layout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderContent()}
    </Layout>
  );
}
