import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { electricalChecklistSchema, ElectricalChecklist } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PrintTemplate } from "@/components/print-template";
import { Zap, Save, RotateCcw } from "lucide-react";

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

export default function ElectricalForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPrint, setShowPrint] = useState(false);
  const [printData, setPrintData] = useState<ElectricalChecklist | null>(null);

  const form = useForm<ElectricalChecklist>({
    resolver: zodResolver(electricalChecklistSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      shift: "",
      operatorName: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ElectricalChecklist) => {
      const response = await apiRequest("POST", `/api/reports/electrical?userId=${user?.id}`, data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      toast({
        title: "Success",
        description: "Electrical checklist submitted successfully!",
      });
      
      // Show print template
      setPrintData(variables);
      setShowPrint(true);
      
      // Reset form for operators
      if (user?.role === 'operator') {
        form.reset({
          date: new Date().toISOString().split('T')[0],
          shift: "",
          operatorName: "",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit checklist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ElectricalChecklist) => {
    submitMutation.mutate(data);
  };

  const resetForm = () => {
    form.reset({
      date: new Date().toISOString().split('T')[0],
      shift: "",
      operatorName: "",
    });
  };

  if (showPrint && printData) {
    return (
      <PrintTemplate
        systemType="electrical"
        data={printData}
        onPrint={() => setShowPrint(false)}
      />
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
          <Zap className="text-yellow-500 mr-2" />
          Electrical System Daily Checklist
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">Complete daily electrical maintenance verification</p>
      </CardHeader>
      
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Form Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="shift"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Shift" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Morning">Morning (6:00 AM - 2:00 PM)</SelectItem>
                        <SelectItem value="Evening">Evening (2:00 PM - 10:00 PM)</SelectItem>
                        <SelectItem value="Night">Night (10:00 PM - 6:00 AM)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="operatorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operator Name</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Checklist Items */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900 mb-4">Electrical System Checkpoints</h3>
              
              {electricalCheckpoints.map((checkpoint, index) => {
                const checkpointKey = `electrical_${index + 1}` as keyof ElectricalChecklist;
                const remarksKey = `electrical_${index + 1}_remarks` as keyof ElectricalChecklist;
                
                return (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-gray-700">
                          {index + 1}. {checkpoint}
                        </Label>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name={checkpointKey}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex space-x-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Yes" id={`${checkpointKey}_yes`} />
                                  <Label htmlFor={`${checkpointKey}_yes`} className="text-sm">Yes</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="No" id={`${checkpointKey}_no`} />
                                  <Label htmlFor={`${checkpointKey}_no`} className="text-sm">No</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={remarksKey}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Remarks (if any)" 
                                className="text-sm"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline"
                onClick={resetForm}
                className="px-4 py-2"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Form
              </Button>
              <Button 
                type="submit" 
                disabled={submitMutation.isPending}
                className="px-6 py-2 bg-pulse-blue hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {submitMutation.isPending ? "Submitting..." : "Submit & Print"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
