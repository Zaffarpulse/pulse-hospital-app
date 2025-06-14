import { useRef, useEffect } from "react";
import { ElectricalChecklist, ACChecklist } from "@shared/schema";

interface PrintTemplateProps {
  systemType: "electrical" | "ac";
  data: ElectricalChecklist | ACChecklist;
  onPrint?: () => void;
}

export function PrintTemplate({ systemType, data, onPrint }: PrintTemplateProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const electricalCheckpoints = [
    "Main Panel Power Supply ON",
    "Breakers and MCBs in Normal State", 
    "No Alarm or Trip Indicators",
    "Indicator Lights Working",
    "Surge Protection Devices Status OK",
    "Earthing Checked",
    "Load Distribution Normal",
    "Manual Override Accessible & Safe",
    "Temperature of Panel Normal",
    "Panel Area Clean and Locked"
  ];

  const acCheckpoints = [
    "All Outdoor Units Operational",
    "Indoor Units Functioning in All Zones",
    "Temperature Set Points Verified",
    "No Abnormal Noise/Vibration in Units",
    "Air Filters Cleaned (Weekly)",
    "Indoor Unit Front Panel Cleaned",
    "Outdoor Unit Fins & Area Clean",
    "Remote/Touch Panel Display Working",
    "Remote Batteries Functional",
    "Remote/Touch Panel Settings Accessible",
    "Drain Pipe Free from Clogging",
    "Gas Pressure Levels Normal",
    "Power Supply Stable (No trip/fault)",
    "Control Wiring & Cabling Secure"
  ];

  const checkpoints = systemType === "electrical" ? electricalCheckpoints : acCheckpoints;

  useEffect(() => {
    if (onPrint) {
      setTimeout(() => {
        window.print();
        onPrint();
      }, 500);
    }
  }, [onPrint]);

  return (
    <div className="print-only fixed inset-0 bg-white z-50" ref={printRef}>
      <div className="print-page w-full max-w-4xl mx-auto p-8 bg-white min-h-screen">
        {/* Print Header */}
        <div className="flex items-center justify-between mb-8">
          <img 
            src="https://pulsehospitaljammu.com/assets/web/images/pls.jpg" 
            alt="Pulse Hospital Logo" 
            className="h-16 w-16 object-contain" 
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-pulse-blue">Pulse Hospital</h1>
            <h2 className="text-lg font-semibold">Utility System Daily Report</h2>
          </div>
          <img 
            src="https://pulsehospitaljammu.com/webassets/images/logo.png" 
            alt="Pulse Hospital Logo" 
            className="h-16 w-16 object-contain" 
          />
        </div>

        {/* Print Content */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {systemType === "electrical" ? "Electrical System" : "AC System"} Daily Checklist
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div><strong>Date:</strong> {data.date}</div>
            <div><strong>Shift:</strong> {data.shift}</div>
            <div><strong>Operator:</strong> {data.operatorName}</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-semibold">Inspection Results:</h4>
          {checkpoints.map((checkpoint, index) => {
            const checkpointKey = `${systemType}_${index + 1}` as keyof typeof data;
            const remarksKey = `${systemType}_${index + 1}_remarks` as keyof typeof data;
            const status = data[checkpointKey] as string || "Not Checked";
            const remarks = data[remarksKey] as string || "";
            
            return (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm">{index + 1}. {checkpoint}</span>
                <div className="flex items-center space-x-4">
                  <span className={`text-sm font-medium ${
                    status === "Yes" ? "text-green-600" : 
                    status === "No" ? "text-red-600" : 
                    "text-gray-600"
                  }`}>
                    {status}
                  </span>
                  {remarks && <span className="text-xs text-gray-600">{remarks}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Print Footer */}
        <div className="mt-8 pt-8 border-t border-gray-300">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="border-t border-gray-400 pt-2 mt-8">
                <p className="text-sm font-medium">Operator Signature</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-400 pt-2 mt-8">
                <p className="text-sm font-medium">Supervisor Signature</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-400 pt-2 mt-8">
                <p className="text-sm font-medium">Manager Signature</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-6 text-xs text-gray-600">
            <p>Generated on {new Date().toLocaleString()} | Pulse Utility System</p>
          </div>
        </div>
      </div>
    </div>
  );
}
