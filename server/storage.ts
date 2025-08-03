import {
  users,
  specialties,
  programs,
  applications,
  favorites,
  reviews,
  waitlist,
  newsletterSubscriptions,
  contactQueries,
  type User,
  type UpsertUser,
  type Specialty,
  type Program,
  type Application,
  type Favorite,
  type Review,
  type Waitlist,
  type NewsletterSubscription,
  type ContactQuery,
  type InsertSpecialty,
  type InsertProgram,
  type InsertApplication,
  type InsertFavorite,
  type InsertReview,
  type InsertWaitlist,
  type InsertNewsletterSubscription,
  type InsertContactQuery,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, ilike, sql, count, avg } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Specialty operations
  getSpecialties(): Promise<Specialty[]>;
  createSpecialty(specialty: InsertSpecialty): Promise<Specialty>;
  
  // Program operations
  getPrograms(filters?: {
    specialty?: string;
    location?: string;
    type?: string;
    minDuration?: number;
    maxDuration?: number;
    isFree?: boolean;
    isActive?: boolean;
    search?: string;
  }): Promise<Program[]>;
  getProgram(id: string): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  updateProgram(id: string, updates: Partial<Program>): Promise<Program>;
  deleteProgram(id: string): Promise<void>;
  
  // Application operations
  getApplications(filters?: { userId?: string; programId?: string; status?: string }): Promise<Application[]>;
  getApplication(id: string): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: string, updates: Partial<Application>): Promise<Application>;
  
  // Favorite operations
  getFavorites(userId: string): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, programId: string): Promise<void>;
  isFavorite(userId: string, programId: string): Promise<boolean>;
  
  // Review operations
  getReviews(programId?: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, updates: Partial<Review>): Promise<Review>;
  
  // Waitlist operations
  addToWaitlist(waitlistEntry: InsertWaitlist): Promise<Waitlist>;
  getWaitlist(programId: string): Promise<Waitlist[]>;
  removeFromWaitlist(userId: string, programId: string): Promise<void>;
  
  // Newsletter operations
  subscribeNewsletter(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  unsubscribeNewsletter(email: string): Promise<void>;
  
  // Contact operations
  createContactQuery(query: InsertContactQuery): Promise<ContactQuery>;
  getContactQueries(): Promise<ContactQuery[]>;
  updateContactQuery(id: string, updates: Partial<ContactQuery>): Promise<ContactQuery>;
  
  // Analytics operations
  getAnalytics(): Promise<{
    totalPrograms: number;
    totalUsers: number;
    totalApplications: number;
    pendingApplications: number;
    monthlyRevenue: number;
    popularSpecialties: Array<{ name: string; count: number }>;
    applicationTrends: Array<{ month: string; count: number }>;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Specialty operations
  async getSpecialties(): Promise<Specialty[]> {
    return await db.select().from(specialties).orderBy(asc(specialties.name));
  }

  async createSpecialty(specialty: InsertSpecialty): Promise<Specialty> {
    const [newSpecialty] = await db.insert(specialties).values(specialty).returning();
    return newSpecialty;
  }

  // Program operations
  async getPrograms(filters?: {
    specialty?: string;
    location?: string;
    type?: string;
    minDuration?: number;
    maxDuration?: number;
    isFree?: boolean;
    isActive?: boolean;
    search?: string;
  }): Promise<Program[]> {
    const conditions = [];
    
    if (filters?.specialty) {
      conditions.push(eq(programs.specialtyId, filters.specialty));
    }
    
    if (filters?.location) {
      conditions.push(ilike(programs.location, `%${filters.location}%`));
    }
    
    if (filters?.type) {
      conditions.push(eq(programs.type, filters.type as any));
    }
    
    if (filters?.minDuration) {
      conditions.push(sql`${programs.duration} >= ${filters.minDuration}`);
    }
    
    if (filters?.maxDuration) {
      conditions.push(sql`${programs.duration} <= ${filters.maxDuration}`);
    }
    
    if (filters?.isFree !== undefined) {
      if (filters.isFree) {
        conditions.push(sql`${programs.fee} IS NULL OR ${programs.fee} = 0`);
      } else {
        conditions.push(sql`${programs.fee} > 0`);
      }
    }
    
    if (filters?.isActive !== undefined) {
      conditions.push(eq(programs.isActive, filters.isActive));
    }
    
    if (filters?.search) {
      conditions.push(
        sql`(${programs.title} ILIKE ${'%' + filters.search + '%'} OR ${programs.hospitalName} ILIKE ${'%' + filters.search + '%'} OR ${programs.description} ILIKE ${'%' + filters.search + '%'})`
      );
    }
    
    if (conditions.length > 0) {
      return await db.select().from(programs).where(and(...conditions)).orderBy(desc(programs.createdAt));
    }
    
    return await db.select().from(programs).orderBy(desc(programs.createdAt));
  }

  async getProgram(id: string): Promise<Program | undefined> {
    const [program] = await db.select().from(programs).where(eq(programs.id, id));
    return program;
  }

  async createProgram(program: InsertProgram): Promise<Program> {
    const [newProgram] = await db.insert(programs).values(program).returning();
    return newProgram;
  }

  async updateProgram(id: string, updates: Partial<Program>): Promise<Program> {
    const [program] = await db
      .update(programs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(programs.id, id))
      .returning();
    return program;
  }

  async deleteProgram(id: string): Promise<void> {
    await db.delete(programs).where(eq(programs.id, id));
  }

  // Application operations
  async getApplications(filters?: { userId?: string; programId?: string; status?: string }): Promise<Application[]> {
    const conditions = [];
    
    if (filters?.userId) {
      conditions.push(eq(applications.userId, filters.userId));
    }
    
    if (filters?.programId) {
      conditions.push(eq(applications.programId, filters.programId));
    }
    
    if (filters?.status) {
      conditions.push(eq(applications.status, filters.status as any));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(applications).where(and(...conditions)).orderBy(desc(applications.createdAt));
    }
    
    return await db.select().from(applications).orderBy(desc(applications.createdAt));
  }

  async getApplication(id: string): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application;
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db.insert(applications).values(application).returning();
    return newApplication;
  }

  async updateApplication(id: string, updates: Partial<Application>): Promise<Application> {
    const [application] = await db
      .update(applications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return application;
  }

  // Favorite operations
  async getFavorites(userId: string): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db.insert(favorites).values(favorite).returning();
    return newFavorite;
  }

  async removeFavorite(userId: string, programId: string): Promise<void> {
    await db.delete(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.programId, programId))
    );
  }

  async isFavorite(userId: string, programId: string): Promise<boolean> {
    const [favorite] = await db.select().from(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.programId, programId))
    );
    return !!favorite;
  }

  // Review operations
  async getReviews(programId?: string): Promise<Review[]> {
    if (programId) {
      return await db.select().from(reviews).where(eq(reviews.programId, programId)).orderBy(desc(reviews.createdAt));
    }
    
    return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review> {
    const [review] = await db
      .update(reviews)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    return review;
  }

  // Waitlist operations
  async addToWaitlist(waitlistEntry: InsertWaitlist): Promise<Waitlist> {
    const [newEntry] = await db.insert(waitlist).values(waitlistEntry).returning();
    return newEntry;
  }

  async getWaitlist(programId: string): Promise<Waitlist[]> {
    return await db.select().from(waitlist)
      .where(eq(waitlist.programId, programId))
      .orderBy(asc(waitlist.createdAt));
  }

  async removeFromWaitlist(userId: string, programId: string): Promise<void> {
    await db.delete(waitlist).where(
      and(eq(waitlist.userId, userId), eq(waitlist.programId, programId))
    );
  }

  // Newsletter operations
  async subscribeNewsletter(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const [newSubscription] = await db.insert(newsletterSubscriptions).values(subscription).returning();
    return newSubscription;
  }

  async unsubscribeNewsletter(email: string): Promise<void> {
    await db.update(newsletterSubscriptions)
      .set({ isActive: false })
      .where(eq(newsletterSubscriptions.email, email));
  }

  // Contact operations
  async createContactQuery(query: InsertContactQuery): Promise<ContactQuery> {
    const [newQuery] = await db.insert(contactQueries).values(query).returning();
    return newQuery;
  }

  async getContactQueries(): Promise<ContactQuery[]> {
    return await db.select().from(contactQueries).orderBy(desc(contactQueries.createdAt));
  }

  async updateContactQuery(id: string, updates: Partial<ContactQuery>): Promise<ContactQuery> {
    const [query] = await db
      .update(contactQueries)
      .set(updates)
      .where(eq(contactQueries.id, id))
      .returning();
    return query;
  }

  // Analytics operations
  async getAnalytics(): Promise<{
    totalPrograms: number;
    totalUsers: number;
    totalApplications: number;
    pendingApplications: number;
    monthlyRevenue: number;
    popularSpecialties: Array<{ name: string; count: number }>;
    applicationTrends: Array<{ month: string; count: number }>;
  }> {
    const [totalPrograms] = await db.select({ count: count() }).from(programs);
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [totalApplications] = await db.select({ count: count() }).from(applications);
    const [pendingApplications] = await db.select({ count: count() })
      .from(applications)
      .where(eq(applications.status, 'pending'));

    // Calculate monthly revenue (mock for now)
    const monthlyRevenue = 124000;

    // Get popular specialties
    const popularSpecialties = await db
      .select({
        name: specialties.name,
        count: count(programs.id),
      })
      .from(specialties)
      .leftJoin(programs, eq(specialties.id, programs.specialtyId))
      .groupBy(specialties.id, specialties.name)
      .orderBy(desc(count(programs.id)))
      .limit(5);

    // Get application trends (mock data for now)
    const applicationTrends = [
      { month: 'Jan', count: 45 },
      { month: 'Feb', count: 52 },
      { month: 'Mar', count: 48 },
      { month: 'Apr', count: 61 },
      { month: 'May', count: 55 },
      { month: 'Jun', count: 67 },
    ];

    return {
      totalPrograms: totalPrograms.count,
      totalUsers: totalUsers.count,
      totalApplications: totalApplications.count,
      pendingApplications: pendingApplications.count,
      monthlyRevenue,
      popularSpecialties,
      applicationTrends,
    };
  }
}

export const storage = new DatabaseStorage();
