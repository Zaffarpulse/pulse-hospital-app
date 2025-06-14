import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  mobile: text("mobile").notNull(),
  password: text("password").notNull(),
  role: text("role").notNull(), // operator, supervisor, manager
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  mobile: text("mobile").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  systemType: text("system_type").notNull(), // electrical, ac
  date: text("date").notNull(),
  shift: text("shift").notNull(),
  operatorName: text("operator_name").notNull(),
  submittedBy: integer("submitted_by").references(() => users.id),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, reviewed, approved, requires_attention
  checklistData: jsonb("checklist_data").notNull(),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  userId: true,
  mobile: true,
  password: true,
  role: true,
  name: true,
});

export const insertOtpSchema = createInsertSchema(otpCodes).pick({
  mobile: true,
  code: true,
  expiresAt: true,
});

export const insertReportSchema = createInsertSchema(reports).pick({
  systemType: true,
  date: true,
  shift: true,
  operatorName: true,
  submittedBy: true,
  checklistData: true,
  remarks: true,
});

export const loginSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  password: z.string().min(1, "Password is required"),
  role: z.string().min(1, "Role is required"),
});

export const otpLoginSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.string().min(1, "Role is required"),
});

export const otpVerifySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  code: z.string().min(4, "OTP is required"),
  role: z.string().min(1, "Role is required"),
});

export const electricalChecklistSchema = z.object({
  date: z.string().min(1, "Date is required"),
  shift: z.string().min(1, "Shift is required"),
  operatorName: z.string().min(1, "Operator name is required"),
  electrical_1: z.string().optional(),
  electrical_1_remarks: z.string().optional(),
  electrical_2: z.string().optional(),
  electrical_2_remarks: z.string().optional(),
  electrical_3: z.string().optional(),
  electrical_3_remarks: z.string().optional(),
  electrical_4: z.string().optional(),
  electrical_4_remarks: z.string().optional(),
  electrical_5: z.string().optional(),
  electrical_5_remarks: z.string().optional(),
  electrical_6: z.string().optional(),
  electrical_6_remarks: z.string().optional(),
  electrical_7: z.string().optional(),
  electrical_7_remarks: z.string().optional(),
  electrical_8: z.string().optional(),
  electrical_8_remarks: z.string().optional(),
  electrical_9: z.string().optional(),
  electrical_9_remarks: z.string().optional(),
  electrical_10: z.string().optional(),
  electrical_10_remarks: z.string().optional(),
});

export const acChecklistSchema = z.object({
  date: z.string().min(1, "Date is required"),
  shift: z.string().min(1, "Shift is required"),
  operatorName: z.string().min(1, "Operator name is required"),
  ac_1: z.string().optional(),
  ac_1_remarks: z.string().optional(),
  ac_2: z.string().optional(),
  ac_2_remarks: z.string().optional(),
  ac_3: z.string().optional(),
  ac_3_remarks: z.string().optional(),
  ac_4: z.string().optional(),
  ac_4_remarks: z.string().optional(),
  ac_5: z.string().optional(),
  ac_5_remarks: z.string().optional(),
  ac_6: z.string().optional(),
  ac_6_remarks: z.string().optional(),
  ac_7: z.string().optional(),
  ac_7_remarks: z.string().optional(),
  ac_8: z.string().optional(),
  ac_8_remarks: z.string().optional(),
  ac_9: z.string().optional(),
  ac_9_remarks: z.string().optional(),
  ac_10: z.string().optional(),
  ac_10_remarks: z.string().optional(),
  ac_11: z.string().optional(),
  ac_11_remarks: z.string().optional(),
  ac_12: z.string().optional(),
  ac_12_remarks: z.string().optional(),
  ac_13: z.string().optional(),
  ac_13_remarks: z.string().optional(),
  ac_14: z.string().optional(),
  ac_14_remarks: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertOtp = z.infer<typeof insertOtpSchema>;
export type OtpCode = typeof otpCodes.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
export type OtpLoginRequest = z.infer<typeof otpLoginSchema>;
export type OtpVerifyRequest = z.infer<typeof otpVerifySchema>;
export type ElectricalChecklist = z.infer<typeof electricalChecklistSchema>;
export type ACChecklist = z.infer<typeof acChecklistSchema>;
