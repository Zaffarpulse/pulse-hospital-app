import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, electricalChecklistSchema, acChecklistSchema, otpLoginSchema, otpVerifySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Password-based authentication endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { userId, password, role } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUserIdAndRole(userId, role);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials or role mismatch" });
      }
      
      res.json({ 
        user: { 
          id: user.id, 
          userId: user.userId,
          mobile: user.mobile, 
          name: user.name,
          role: user.role 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Generate OTP endpoint
  app.post("/api/auth/generate-otp", async (req, res) => {
    try {
      const { userId, role } = otpLoginSchema.parse(req.body);
      
      const user = await storage.getUserByUserIdAndRole(userId, role);
      if (!user) {
        return res.status(404).json({ message: "User not found or role mismatch" });
      }
      
      // Generate 4-digit OTP
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      
      await storage.createOtp({
        mobile: user.mobile,
        code: otpCode,
        expiresAt
      });
      
      // In a real implementation, you would send SMS here
      console.log(`OTP for ${user.mobile}: ${otpCode}`);
      
      res.json({ 
        message: "OTP sent successfully",
        // For demo purposes, we return the OTP. In production, never do this!
        otp: otpCode 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Verify OTP endpoint
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { userId, code, role } = otpVerifySchema.parse(req.body);
      
      const user = await storage.getUserByUserIdAndRole(userId, role);
      if (!user) {
        return res.status(404).json({ message: "User not found or role mismatch" });
      }
      
      const isValid = await storage.verifyOtp(user.mobile, code);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid or expired OTP" });
      }
      
      res.json({ 
        user: { 
          id: user.id, 
          userId: user.userId,
          mobile: user.mobile, 
          name: user.name,
          role: user.role 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Submit electrical checklist
  app.post("/api/reports/electrical", async (req, res) => {
    try {
      const checklistData = electricalChecklistSchema.parse(req.body);
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const report = await storage.createReport({
        systemType: "electrical",
        date: checklistData.date,
        shift: checklistData.shift,
        operatorName: checklistData.operatorName,
        submittedBy: parseInt(userId as string),
        checklistData: checklistData as any,
      });

      // Send to Google Sheets
      try {
        await sendToGoogleSheets("electrical", checklistData);
      } catch (sheetsError) {
        console.error("Failed to send to Google Sheets:", sheetsError);
        // Continue with the response even if Google Sheets fails
      }

      res.json(report);
    } catch (error) {
      console.error("Error submitting electrical report:", error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Submit AC checklist
  app.post("/api/reports/ac", async (req, res) => {
    try {
      const checklistData = acChecklistSchema.parse(req.body);
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const report = await storage.createReport({
        systemType: "ac",
        date: checklistData.date,
        shift: checklistData.shift,
        operatorName: checklistData.operatorName,
        submittedBy: parseInt(userId as string),
        checklistData: checklistData as any,
      });

      // Send to Google Sheets
      try {
        await sendToGoogleSheets("ac", checklistData);
      } catch (sheetsError) {
        console.error("Failed to send to Google Sheets:", sheetsError);
        // Continue with the response even if Google Sheets fails
      }

      res.json(report);
    } catch (error) {
      console.error("Error submitting AC report:", error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Get reports
  app.get("/api/reports", async (req, res) => {
    try {
      const { systemType, status, date, userId } = req.query;
      
      let reports;
      if (userId) {
        reports = await storage.getReportsBySubmitter(parseInt(userId as string));
      } else {
        reports = await storage.getReports({
          systemType: systemType as string,
          status: status as string,
          date: date as string,
        });
      }
      
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Update report (for supervisor/manager review)
  app.patch("/api/reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, remarks, reviewedBy, approvedBy } = req.body;
      
      const updatedReport = await storage.updateReport(parseInt(id), {
        status,
        remarks,
        reviewedBy,
        approvedBy,
      });
      
      if (!updatedReport) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      res.json(updatedReport);
    } catch (error) {
      res.status(500).json({ message: "Failed to update report" });
    }
  });

  // Get specific report
  app.get("/api/reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getReportById(parseInt(id));
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Google Sheets integration function
async function sendToGoogleSheets(systemType: string, data: any) {
  const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL || "";
  
  if (!GOOGLE_APPS_SCRIPT_URL) {
    console.warn("Google Apps Script URL not configured");
    return;
  }

  const payload = {
    systemType,
    data,
    timestamp: new Date().toISOString(),
  };

  const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Google Sheets API error: ${response.statusText}`);
  }

  return response.json();
}
