import { pgTable, text, serial, integer, boolean, decimal, timestamp, json, date, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Users table (inherited from base schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number"),
  address: text("address"),
  role: text("role").default("student").notNull(), // student, school, admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, { fields: [passwordResetTokens.userId], references: [users.id] }),
}));

// Student registration tokens
export const registrationTokens = pgTable("registration_tokens", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const registrationTokensRelations = relations(registrationTokens, ({ one }) => ({
  booking: one(bookings, { fields: [registrationTokens.bookingId], references: [bookings.id] }),
}));

// Instructor-Student Assignments
export const instructorStudentAssignments = pgTable("instructor_student_assignments", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => drivingSchools.id).notNull(),
  instructorId: integer("instructor_id").references(() => instructors.id).notNull(),
  studentId: integer("student_id").references(() => studentProfiles.id).notNull(),
  assignedDate: timestamp("assigned_date").defaultNow().notNull(),
  assignedBy: integer("assigned_by").references(() => users.id).notNull(), // User ID who made the assignment
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const instructorStudentAssignmentsRelations = relations(instructorStudentAssignments, ({ one }) => ({
  school: one(drivingSchools, { fields: [instructorStudentAssignments.schoolId], references: [drivingSchools.id] }),
  instructor: one(instructors, { fields: [instructorStudentAssignments.instructorId], references: [instructors.id] }),
  student: one(studentProfiles, { fields: [instructorStudentAssignments.studentId], references: [studentProfiles.id] }),
  assignor: one(users, { fields: [instructorStudentAssignments.assignedBy], references: [users.id] }),
}));

// Driving Schools
export const drivingSchools = pgTable("driving_schools", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  contactPerson: text("contact_person").notNull(),
  contactNumber: text("contact_number").notNull(),
  logoUrl: text("logo_url"),
  coverImageUrl: text("cover_image_url"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  googleReviewsUrl: text("google_reviews_url"),
  passRate: integer("pass_rate").default(85),
  mapLocation: json("map_location"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const drivingSchoolsRelations = relations(drivingSchools, ({ one, many }) => ({
  user: one(users, { fields: [drivingSchools.userId], references: [users.id] }),
  services: many(services),
  instructors: many(instructors),
  vehicles: many(vehicles),
  bookings: many(bookings),
}));

// Services offered by driving schools
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => drivingSchools.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // code8, code10, code14
  lessonCount: integer("lesson_count"),
  durationMinutes: integer("duration_minutes"),
  testIncluded: boolean("test_included").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const servicesRelations = relations(services, ({ one, many }) => ({
  school: one(drivingSchools, { fields: [services.schoolId], references: [drivingSchools.id] }),
  bookings: many(bookings),
}));

// Instructors
export const instructors = pgTable("instructors", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => drivingSchools.id).notNull(),
  name: text("name").notNull(),
  licenseNumber: text("license_number").notNull(),
  licenseExpiry: timestamp("license_expiry").notNull(),
  idNumber: text("id_number").notNull(),
  photoUrl: text("photo_url"),
  licensePhotoUrl: text("license_photo_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const instructorsRelations = relations(instructors, ({ one, many }) => ({
  school: one(drivingSchools, { fields: [instructors.schoolId], references: [drivingSchools.id] }),
  bookings: many(bookings),
  studentAssignments: many(instructorStudentAssignments),
}));

// Vehicles
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => drivingSchools.id).notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year"),
  plateNumber: text("plate_number").notNull(),
  transmission: text("transmission").notNull(), // automatic, manual
  photoUrl: text("photo_url"),
  registrationDocUrl: text("registration_doc_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  school: one(drivingSchools, { fields: [vehicles.schoolId], references: [drivingSchools.id] }),
  bookings: many(bookings),
}));

// Bookings
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  schoolId: integer("school_id").references(() => drivingSchools.id).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  instructorId: integer("instructor_id").references(() => instructors.id),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  startDate: timestamp("start_date").notNull(),
  status: text("status").default("pending").notNull(), // pending, confirmed, completed, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }),
  depositPaid: boolean("deposit_paid").default(false),
  fullPaymentDate: timestamp("full_payment_date"),
  notes: text("notes"),
  // Client contact information
  fullName: text("full_name"),
  email: text("email"),
  phoneNumber: text("phone_number"),
  address: text("address"),
  // Payment and invoice information
  paymentMethod: text("payment_method"), // card, eft
  invoiceNumber: text("invoice_number"),
  invoiceDate: timestamp("invoice_date"),
  notificationSent: boolean("notification_sent").default(false),
  // Negotiation fields
  negotiationRequested: boolean("negotiation_requested").default(false),
  negotiationAmount: decimal("negotiation_amount", { precision: 10, scale: 2 }),
  negotiationMessage: text("negotiation_message"),
  negotiationAccepted: boolean("negotiation_accepted"),
  // Rescheduling fields
  originalStartDate: timestamp("original_start_date"), // Store the original date if rescheduled
  lastRescheduleDate: timestamp("last_reschedule_date"), // When the booking was last rescheduled
  rescheduleCount: integer("reschedule_count").default(0), // How many times the booking was rescheduled
  rescheduleReason: text("reschedule_reason"), // Reason for the last reschedule
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  school: one(drivingSchools, { fields: [bookings.schoolId], references: [drivingSchools.id] }),
  service: one(services, { fields:
