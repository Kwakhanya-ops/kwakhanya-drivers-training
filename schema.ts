import { pgTable, serial, text, integer, timestamp, decimal, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('full_name').notNull(),
  phoneNumber: text('phone_number'),
  address: text('address'),
  role: text('role').notNull().default('student'), // student, school, admin
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Driving schools table
export const drivingSchools = pgTable('driving_schools', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  schoolName: text('school_name').notNull(),
  description: text('description'),
  location: text('location').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone').notNull(),
  photoUrl: text('photo_url'),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Services offered by schools
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => drivingSchools.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  duration: integer('duration').notNull(), // in minutes
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Bookings table
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  schoolId: integer('school_id').references(() => drivingSchools.id).notNull(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  bookingDate: timestamp('booking_date').notNull(),
  status: text('status').notNull().default('pending'), // pending, confirmed, completed, cancelled
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text('payment_status').notNull().default('pending'), // pending, paid, failed
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  drivingSchools: many(drivingSchools),
  bookings: many(bookings),
}));

export const drivingSchoolsRelations = relations(drivingSchools, ({ one, many }) => ({
  user: one(users, { fields: [drivingSchools.userId], references: [users.id] }),
  services: many(services),
  bookings: many(bookings),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  school: one(drivingSchools, { fields: [services.schoolId], references: [drivingSchools.id] }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  school: one(drivingSchools, { fields: [bookings.schoolId], references: [drivingSchools.id] }),
  service: one(services, { fields: [bookings.serviceId], references: [services.id] }),
}));

// Zod schemas
export const usersInsertSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  email: (schema) => schema.email("Must provide a valid email"),
  fullName: (schema) => schema.min(2, "Full name must be at least 2 characters"),
  role: (schema) => schema.refine(val => ['student', 'school', 'admin'].includes(val), {
    message: "Role must be student, school, or admin"
  })
});

export type User = z.infer<typeof createSelectSchema(users)>;
export type InsertUser = z.infer<typeof usersInsertSchema>;

export const drivingSchoolsInsertSchema = createInsertSchema(drivingSchools, {
  schoolName: (schema) => schema.min(2, "School name must be at least 2 characters"),
  location: (schema) => schema.min(5, "Location must be at least 5 characters"),
  contactEmail: (schema) => schema.email("Must provide a valid email"),
  contactPhone: (schema) => schema.min(10, "Phone number must be at least 10 characters")
});

export type DrivingSchool = z.infer<typeof createSelectSchema(drivingSchools)>;
export type InsertDrivingSchool = z.infer<typeof drivingSchoolsInsertSchema>;

export const servicesInsertSchema = createInsertSchema(services, {
  name: (schema) => schema.min(2, "Service name must be at least 2 characters"),
  price: (schema) => schema.refine(val => parseFloat(val) > 0, {
    message: "Price must be greater than 0"
  }),
  duration: (schema) => schema.refine(val => val > 0, {
    message: "Duration must be greater than 0"
  })
});

export type Service = z.infer<typeof createSelectSchema(services)>;
export type InsertService = z.infer<typeof servicesInsertSchema>;

export const bookingsInsertSchema = createInsertSchema(bookings, {
  totalAmount: (schema) => schema.refine(val => parseFloat(val) > 0, {
    message: "Total amount must be greater than 0"
  }),
  status: (schema) => schema.refine(val => ['pending', 'confirmed', 'completed', 'cancelled'].includes(val), {
    message: "Status must be pending, confirmed, completed, or cancelled"
  }),
  paymentStatus: (schema) => schema.refine(val => ['pending', 'paid', 'failed'].includes(val), {
    message: "Payment status must be pending, paid, or failed"
  })
});

export type Booking = z.infer<typeof createSelectSchema(bookings)>;
export type InsertBooking = z.infer<typeof bookingsInsertSchema>;
