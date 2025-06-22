import { db } from "./index";
import { 
  users, 
  drivingSchools, 
  services, 
  bookings 
} from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("Seeding database...");

    // Sample users
    const adminUser = await createOrGetUser({
      username: "admin",
      password: "admin123",  // NOTE: In a real app, this would be hashed
      email: "admin@kwakhanya.co.za",
      fullName: "Admin User",
      role: "admin"
    });

    const schoolUser = await createOrGetUser({
      username: "drivepro",
      password: "school123",
      email: "info@drivepro.co.za",
      fullName: "Drive Pro School",
      phoneNumber: "+27 11 234 5678",
      address: "456 Main Road, Sandton, Johannesburg",
      role: "school"
    });

    const studentUser = await createOrGetUser({
      username: "student",
      password: "student123",
      email: "student@example.com",
      fullName: "John Student",
      phoneNumber: "+27 71 234 5678",
      address: "123 Student Ave, Sandton, Johannesburg",
      role: "student"
    });

    // Sample driving school
    const school = await createOrGetSchool({
      userId: schoolUser.id,
      schoolName: "Drive Pro Driving School",
      description: "Professional driving instruction with experienced instructors",
      location: "Sandton, Johannesburg",
      contactEmail: "info@drivepro.co.za",
      contactPhone: "+27 11 234 5678",
      verified: true
    });

    // Sample services
    await seedServices(school.id, [
      {
        name: "Basic Driving Lessons",
        description: "Learn the fundamentals of driving",
        price: "350.00",
        duration: 60
      },
      {
        name: "Highway Driving",
        description: "Advanced highway driving skills",
        price: "450.00",
        duration: 90
      },
      {
        name: "Parking Practice",
        description: "Master parallel and bay parking",
        price: "250.00",
        duration: 45
      }
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Helper functions to avoid duplicate entries
async function createOrGetUser(userData: any) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, userData.username)
  });

  if (existingUser) {
    console.log(`User ${userData.username} already exists`);
    return existingUser;
  }

  const [newUser] = await db.insert(users).values(userData).returning();
  console.log(`Created user: ${newUser.username}`);
  return newUser;
}

async function createOrGetSchool(schoolData: any) {
  const existingSchool = await db.query.drivingSchools.findFirst({
    where: eq(drivingSchools.userId, schoolData.userId)
  });

  if (existingSchool) {
    console.log(`School for user ${schoolData.userId} already exists`);
    return existingSchool;
  }

  const [newSchool] = await db.insert(drivingSchools).values(schoolData).returning();
  console.log(`Created school: ${newSchool.schoolName}`);
  return newSchool;
}

async function seedServices(schoolId: number, servicesData: any[]) {
  for (const serviceData of servicesData) {
    const existingService = await db.query.services.findFirst({
      where: eq(services.name, serviceData.name)
    });

    if (!existingService) {
      await db.insert(services).values({
        ...serviceData,
        schoolId
      });
      console.log(`Created service: ${serviceData.name}`);
    }
  }
}

// Run the seed function
seed().catch(console.error);
