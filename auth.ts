import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { db } from "../db/index.js";
import { users, usersInsertSchema } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import { User as DbUser } from "../shared/schema.js";
import connectPgSimple from "connect-pg-simple";
import { pool } from "../db/index.js";

declare global {
  namespace Express {
    interface User extends DbUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const PostgresSessionStore = connectPgSimple(session);

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-session-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    }),
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "username", passwordField: "password" },
      async (username, password, done) => {
        try {
          const user = await db.query.users.findFirst({
            where: eq(users.username, username),
          });

          if (!user) {
            return done(null, false, { message: "Invalid username or password" });
          }

          const isValidPassword = await comparePasswords(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid username or password" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, id),
      });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const userData = usersInsertSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.username, userData.username),
      });

      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check if email already exists
      const existingEmail = await db.query.users.findFirst({
        where: eq(users.email, userData.email),
      });

      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(userData.password);
      const [newUser] = await db.insert(users).values({
        ...userData,
        password: hashedPassword,
      }).returning();

      // Remove password from response
      const { password, ...userResponse } = newUser;

      // Log the user in
      req.login(newUser, (err) => {
        if (err) return next(err);
        res.status(201).json(userResponse);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    if (req.user) {
      const { password, ...userResponse } = req.user;
      res.json(userResponse);
    } else {
      res.status(401).json({ error: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    
    const { password, ...userResponse } = req.user!;
    res.json(userResponse);
  });
}

export { hashPassword };
