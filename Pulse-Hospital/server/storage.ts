import { users, reports, otpCodes, type User, type InsertUser, type Report, type InsertReport, type OtpCode, type InsertOtp } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUserId(userId: string): Promise<User | undefined>;
  getUserByUserIdAndRole(userId: string, role: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createOtp(otp: InsertOtp): Promise<OtpCode>;
  verifyOtp(mobile: string, code: string): Promise<boolean>;
  createReport(report: InsertReport): Promise<Report>;
  getReports(filters?: { systemType?: string; status?: string; date?: string }): Promise<Report[]>;
  getReportById(id: number): Promise<Report | undefined>;
  updateReport(id: number, updates: Partial<Report>): Promise<Report | undefined>;
  getReportsBySubmitter(userId: number): Promise<Report[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private reports: Map<number, Report>;
  private otpCodes: Map<string, OtpCode>;
  private currentUserId: number;
  private currentReportId: number;
  private currentOtpId: number;

  constructor() {
    this.users = new Map();
    this.reports = new Map();
    this.otpCodes = new Map();
    this.currentUserId = 1;
    this.currentReportId = 1;
    this.currentOtpId = 1;

    // Initialize default users with the provided credentials
    this.createUser({ userId: "zaffar", mobile: "9541941695", password: "admin123", role: "manager", name: "Zaffar" });
    this.createUser({ userId: "sarfraz", mobile: "6006807212", password: "1234", role: "operator", name: "Sarfraz" });
    this.createUser({ userId: "hilal", mobile: "9103309765", password: "5678", role: "supervisor", name: "Hilal" });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUserId(userId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.userId === userId,
    );
  }

  async getUserByUserIdAndRole(userId: string, role: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.userId === userId && user.role === role,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async createOtp(insertOtp: InsertOtp): Promise<OtpCode> {
    const id = this.currentOtpId++;
    const otp: OtpCode = {
      ...insertOtp,
      id,
      verified: false,
      createdAt: new Date()
    };
    this.otpCodes.set(`${insertOtp.mobile}_${insertOtp.code}`, otp);
    return otp;
  }

  async verifyOtp(mobile: string, code: string): Promise<boolean> {
    const key = `${mobile}_${code}`;
    const otp = this.otpCodes.get(key);
    
    if (!otp) return false;
    if (otp.verified) return false;
    if (new Date() > otp.expiresAt) return false;
    
    // Mark as verified
    otp.verified = true;
    this.otpCodes.set(key, otp);
    return true;
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = this.currentReportId++;
    const report: Report = {
      ...insertReport,
      id,
      status: "pending",
      reviewedBy: null,
      approvedBy: null,
      submittedBy: insertReport.submittedBy || null,
      remarks: insertReport.remarks || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.reports.set(id, report);
    return report;
  }

  async getReports(filters?: { systemType?: string; status?: string; date?: string }): Promise<Report[]> {
    let reports = Array.from(this.reports.values());
    
    if (filters?.systemType) {
      reports = reports.filter(r => r.systemType === filters.systemType);
    }
    
    if (filters?.status) {
      reports = reports.filter(r => r.status === filters.status);
    }
    
    if (filters?.date) {
      reports = reports.filter(r => r.date === filters.date);
    }
    
    return reports.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getReportById(id: number): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async updateReport(id: number, updates: Partial<Report>): Promise<Report | undefined> {
    const report = this.reports.get(id);
    if (!report) return undefined;
    
    const updatedReport: Report = {
      ...report,
      ...updates,
      updatedAt: new Date()
    };
    
    this.reports.set(id, updatedReport);
    return updatedReport;
  }

  async getReportsBySubmitter(userId: number): Promise<Report[]> {
    return Array.from(this.reports.values())
      .filter(r => r.submittedBy === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }
}

export const storage = new MemStorage();
