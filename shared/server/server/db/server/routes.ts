import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { drivingSchools, services, instructors, vehicles, bookings, users } from "@shared/schema";
import { eq, and, like, desc, asc } from "drizzle-orm";
import { insertBookingSchema, insertDrivingSchoolSchema, insertServiceSchema, insertInstructorSchema, insertVehicleSchema } from "@shared/schema";
import { RemoteAssistanceServer } from "./remoteAssistance";
import { sendBookingNotification, sendSchoolRegistrationNotification } from "./emailService";
import { generateInvoiceHTML, generateInvoiceNumber, generateDueDate, DEFAULT_BANK_ACCOUNT } from "./invoice";
import path from "path";
import fs from "fs";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Search schools endpoint
  app.get("/api/schools/search", async (req, res) => {
    try {
      const { location, serviceType } = req.query;

      let query = db.query.drivingSchools.findMany({
        where: location ? like(drivingSchools.city, `%${location}%`) : undefined,
        with: {
          services: {
            where: serviceType ? eq(services.type, serviceType as string) : undefined,
          },
          user: true,
        },
        orderBy: desc(drivingSchools.rating),
      });

      const schools = await query;
      res.json(schools);
    } catch (error) {
      console.error("Error searching schools:", error);
      res.status(500).json({ error: "Failed to search schools" });
    }
  });

  // Get school details
  app.get("/api/schools/:id", async (req, res) => {
    try {
      const schoolId = parseInt(req.params.id);
      const school = await db.query.drivingSchools.findFirst({
        where: eq(drivingSchools.id, schoolId),
        with: {
          services: true,
          instructors: true,
          vehicles: true,
        },
      });

      if (!school) {
        return res.status(404).json({ error: "School not found" });
      }

      res.json(school);
    } catch (error) {
      console.error("Error fetching school details:", error);
      res.status(500).json({ error: "Failed to fetch school details" });
    }
  });

  // Create booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      
      // Generate invoice details
      const invoiceNumber = generateInvoiceNumber(0); // Will be updated with actual booking ID
      const invoiceDate = new Date();
      
      const [booking] = await db.insert(bookings).values({
        ...validatedData,
        invoiceNumber,
        invoiceDate,
        status: "pending",
      }).returning();

      // Update invoice number with actual booking ID
      const finalInvoiceNumber = generateInvoiceNumber(booking.id);
      await db.update(bookings)
        .set({ invoiceNumber: finalInvoiceNumber })
        .where(eq(bookings.id, booking.id));

      // Send booking notification
      await sendBookingNotification({ ...booking, invoiceNumber: finalInvoiceNumber });

      res.status(201).json({ ...booking, invoiceNumber: finalInvoiceNumber });
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  // Get user bookings
  app.get("/api/bookings", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const userBookings = await db.query.bookings.findMany({
        where: eq(bookings.userId, req.user.id),
        with: {
          school: true,
          service: true,
          instructor: true,
          vehicle: true,
        },
        orderBy: desc(bookings.createdAt),
      });

      res.json(userBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // School management routes (protected)
  app.get("/api/schools/manage", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "school") {
        return res.status(403).json({ error: "Access denied" });
      }

      const school = await db.query.drivingSchools.findFirst({
        where: eq(drivingSchools.userId, req.user.id),
        with: {
          services: true,
          instructors: true,
          vehicles: true,
          bookings: {
            with: {
              user: true,
              service: true,
            },
            orderBy: desc(bookings.createdAt),
          },
        },
      });

      res.json(school);
    } catch (error) {
      console.error("Error fetching school management data:", error);
      res.status(500).json({ error: "Failed to fetch school data" });
    }
  });

  // File upload endpoint
  app.post("/api/upload", async (req, res) => {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploadedFile = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file;
      const fileName = `${Date.now()}-${uploadedFile.name}`;
      const uploadPath = path.join(process.cwd(), "public", "uploads", fileName);

      // Ensure uploads directory exists
      const uploadsDir = path.dirname(uploadPath);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      await uploadedFile.mv(uploadPath);
      const fileUrl = `/uploads/${fileName}`;

      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
      }

      const [totalUsers] = await db.select({ count: users.id }).from(users);
      const [totalSchools] = await db.select({ count: drivingSchools.id }).from(drivingSchools);
      const [totalBookings] = await db.select({ count: bookings.id }).from(bookings);

      res.json({
        totalUsers: totalUsers.count,
        totalSchools: totalSchools.count,
        totalBookings: totalBookings.count,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);

  // Setup WebSocket for remote assistance
  new RemoteAssistanceServer(httpServer);

  return httpServer;
        }
