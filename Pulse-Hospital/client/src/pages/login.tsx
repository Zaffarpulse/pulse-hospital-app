import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Lock, Settings, ClipboardCheck, UserRoundCheck, Smartphone, MessageSquare } from "lucide-react";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ mobile: "", password: "" });
  const [otpData, setOtpData] = useState({ mobile: "", code: "" });
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const { login, generateOtp, verifyOtp, isLoading } = useAuth();
  const { toast } = useToast();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
      toast({
        title: "Login Successful",
        description: `Welcome!`,
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const otp = await generateOtp({ mobile: otpData.mobile });
      setGeneratedOtp(otp);
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: `OTP sent to ${otpData.mobile}. Demo OTP: ${otp}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please check mobile number.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyOtp(otpData);
      toast({
        title: "Login Successful",
        description: "Welcome! OTP verified successfully.",
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid or expired OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pulse-blue to-blue-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
        <CardContent className="p-8">
          {/* Hospital Branding Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="w-16 h-16 flex-shrink-0">
              <img 
                src="https://pulsehospitaljammu.com/assets/web/images/pls.jpg" 
                alt="Pulse Hospital Logo" 
                className="w-full h-full object-contain rounded-lg" 
              />
            </div>
            
            <div className="text-center flex-1 mx-4">
              <h1 className="text-2xl font-bold text-pulse-blue">Pulse Utility System</h1>
              <p className="text-gray-600 text-sm mt-1">Hospital Maintenance Management</p>
            </div>
            
            <div className="w-16 h-16 flex-shrink-0">
              <img 
                src="https://pulsehospitaljammu.com/webassets/images/logo.png" 
                alt="Pulse Hospital Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
          </div>

          {/* Login Tabs */}
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password" className="flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                Password
              </TabsTrigger>
              <TabsTrigger value="otp" className="flex items-center">
                <Smartphone className="w-4 h-4 mr-2" />
                OTP
              </TabsTrigger>
            </TabsList>

            {/* Password Login */}
            <TabsContent value="password">
              <form onSubmit={handlePasswordLogin} className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                    <User className="w-4 h-4 mr-2" />
                    Mobile Number
                  </Label>
                  <Input
                    type="tel"
                    value={credentials.mobile}
                    onChange={(e) => setCredentials({ ...credentials, mobile: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-blue focus:border-transparent transition-all"
                    placeholder="Enter mobile number"
                    required
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                    <Lock className="w-4 h-4 mr-2" />
                    Password
                  </Label>
                  <Input
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-blue focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-pulse-blue text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4 mr-2" />
                  )}
                  Login with Password
                </Button>
              </form>
            </TabsContent>

            {/* OTP Login */}
            <TabsContent value="otp">
              {!otpSent ? (
                <form onSubmit={handleGenerateOtp} className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Mobile Number
                    </Label>
                    <Input
                      type="tel"
                      value={otpData.mobile}
                      onChange={(e) => setOtpData({ ...otpData, mobile: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-blue focus:border-transparent transition-all"
                      placeholder="Enter mobile number"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-pulse-blue text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <MessageSquare className="w-4 h-4 mr-2" />
                    )}
                    Send OTP
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Enter OTP
                    </Label>
                    <Input
                      type="text"
                      value={otpData.code}
                      onChange={(e) => setOtpData({ ...otpData, code: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-blue focus:border-transparent transition-all"
                      placeholder="Enter 4-digit OTP"
                      maxLength={4}
                      required
                    />
                    {generatedOtp && (
                      <p className="text-xs text-gray-600 mt-2">
                        Demo OTP: <span className="font-bold text-pulse-blue">{generatedOtp}</span>
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setOtpSent(false)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="flex-1 bg-pulse-blue text-white hover:bg-blue-700"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <MessageSquare className="w-4 h-4 mr-2" />
                      )}
                      Verify OTP
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
          </Tabs>

          {/* User Credentials Info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Test Credentials:</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <UserRoundCheck className="w-3 h-3 mr-1" />
                  Manager - Zaffar
                </span>
                <span>9541941695 / admin123</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <ClipboardCheck className="w-3 h-3 mr-1" />
                  Supervisor - Hilal
                </span>
                <span>9103309765 / 5678</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <Settings className="w-3 h-3 mr-1" />
                  Operator - Sarfraz
                </span>
                <span>6006807212 / 1234</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
