import { useAuth } from "./auth-provider";
import { hasPermission } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut, Calendar } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Layout({ children, currentTab = "electrical", onTabChange }: LayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-pulse-gray">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img 
                src="https://pulsehospitaljammu.com/webassets/images/logo.png" 
                alt="Pulse Hospital" 
                className="h-10 w-10" 
              />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Pulse Utility System</h1>
                <p className="text-sm text-gray-500">
                  {user?.name} - {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)} Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <Button variant="ghost" onClick={logout} className="text-gray-500 hover:text-gray-700">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* System Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => onTabChange?.("electrical")}
                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                  currentTab === "electrical"
                    ? "border-pulse-blue text-pulse-blue"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <i className="fas fa-bolt mr-2"></i>Electrical System
              </button>
              <button
                onClick={() => onTabChange?.("ac")}
                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                  currentTab === "ac"
                    ? "border-pulse-blue text-pulse-blue"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <i className="fas fa-snowflake mr-2"></i>AC System
              </button>
              {hasPermission(user?.role || "", "supervisor") && (
                <button
                  onClick={() => onTabChange?.("reports")}
                  className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                    currentTab === "reports"
                      ? "border-pulse-blue text-pulse-blue"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <i className="fas fa-chart-line mr-2"></i>Reports
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {children}
      </main>
    </div>
  );
}
