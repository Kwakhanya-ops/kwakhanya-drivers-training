import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "../db";
import { 
  users, 
  drivingSchools, 
  services, 
  bookings,
  usersInsertSchema,
  drivingSchoolsInsertSchema,
  servicesInsertSchema,
  bookingsInsertSchema
} from "../shared/schema";
import { eq, and, like, desc } from "drizzle-orm";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  // Setup authentication
  setupAuth(app);

  // Search schools endpoint
  app.get("/api/schools", async (req, res) => {
    try {
      const { location, service } = req.query;
      
      let query = db.query.drivingSchools.findMany({
        with: {
          services: true
        },
        where: eq(drivingSchools.verified, true)
      });

      const schools = await query;
      
      // Filter by location if provided
      let filteredSchools = schools;
      if (location && typeof location === 'string') {
        filteredSchools = schools.filter(school => 
          school.location.toLowerCase().includes(location.toLowerCase())
        );
      }
      
      // Filter by service if provided
      if (service && typeof service === 'string') {
        filteredSchools = filteredSchools.filter(school =>
          school.services.some(s => 
            s.name.toLowerCase().includes(service.toLowerCase())
          )
        );
      }

      res.json(filteredSchools);
    } catch (error) {
      console.error('Error fetching schools:', error);
      res.status(500).json({ error: 'Failed to fetch schools' });
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
          user: true
        }
      });

      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }

      res.json(school);
    } catch (error) {
      console.error('Error fetching school:', error);
      res.status(500).json({ error: 'Failed to fetch school' });
    }
  });

  // Create booking
  app.post("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const bookingData = bookingsInsertSchema.parse({
        ...req.body,
        userId: req.user!.id
      });

      const [newBooking] = await db.insert(bookings).values(bookingData).returning();

      // Fetch the complete booking with relations
      const completeBooking = await db.query.bookings.findFirst({
        where: eq(bookings.id, newBooking.id),
        with: {
          user: true,
          school: true,
          service: true
        }
      });

      res.status(201).json(completeBooking);
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  });

  // Get user bookings
  app.get("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const userBookings = await db.query.bookings.findMany({
        where: eq(bookings.userId, req.user!.id),
        with: {
          school: true,
          service: true
        },
        orderBy: desc(bookings.createdAt)
      });

      res.json(userBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });

  // Get services for a school
  app.get("/api/schools/:schoolId/services", async (req, res) => {
    try {
      const schoolId = parseInt(req.params.schoolId);
      
      const schoolServices = await db.query.services.findMany({
        where: eq(services.schoolId, schoolId)
      });

      res.json(schoolServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  });

  // School dashboard - get school bookings
  app.get("/api/school/bookings", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'school') {
      return res.status(403).json({ error: 'School access required' });
    }

    try {
      const school = await db.query.drivingSchools.findFirst({
        where: eq(drivingSchools.userId, req.user!.id)
      });

      if (!school) {
        return res.status(404).json({ error: 'School profile not found' });
      }

      const schoolBookings = await db.query.bookings.findMany({
        where: eq(bookings.schoolId, school.id),
        with: {
          user: true,
          service: true
        },
        orderBy: desc(bookings.createdAt)
      });

      res.json(schoolBookings);
    } catch (error) {
      console.error('Error fetching school bookings:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
