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
  cmsPages,
  cmsContentSections,
  cmsMediaAssets,
  teamMembers,
  dynamicPageContent,
  blogPosts,
  blogCategories,
  blogComments,
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
  type CmsPage,
  type CmsContentSection,
  type CmsMediaAsset,
  type TeamMember,
  type DynamicPageContent,
  type BlogPost,
  type BlogCategory,
  type BlogComment,
  type InsertSpecialty,
  type InsertProgram,
  type InsertApplication,
  type InsertFavorite,
  type InsertReview,
  type InsertWaitlist,
  type InsertNewsletterSubscription,
  type InsertContactQuery,
  type InsertCmsPage,
  type InsertCmsContentSection,
  type InsertCmsMediaAsset,
  type InsertTeamMember,
  type InsertDynamicPageContent,
  type InsertBlogPost,
  type InsertBlogCategory,
  type InsertBlogComment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, ilike, sql, count, avg } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  createUser(userData: any): Promise<User>;
  createAdminUser(userData: { email: string; password: string; firstName: string; lastName: string; adminRole: string }): Promise<User>;
  getAllUsers(page?: number, limit?: number): Promise<{ users: User[]; totalCount: number; currentPage: number; hasMore: boolean }>;
  deleteUser(id: string): Promise<void>;
  toggleUserStatus(id: string): Promise<User>;
  getUserApplications(userId: string): Promise<Application[]>;
  
  // Admin operations
  getAdminUser(id: string): Promise<User | undefined>;
  
  // Preceptor operations
  getPreceptor(id: string): Promise<User | undefined>;
  getPreceptorByEmail(email: string): Promise<User | undefined>;
  createPreceptor(userData: any): Promise<User>;
  getPreceptorPrograms(preceptorId: string): Promise<Program[]>;
  getPreceptorApplications(preceptorId: string): Promise<Application[]>;
  updateApplicationStatus(applicationId: string, status: string, reviewNotes?: string, reviewedBy?: string): Promise<Application>;
  
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
  }, page?: number, limit?: number): Promise<{
    programs: Program[];
    totalCount: number;
    hasMore: boolean;
    currentPage: number;
  }>;
  getProgram(id: string): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  updateProgram(id: string, updates: Partial<Program>): Promise<Program>;
  deleteProgram(id: string): Promise<void>;
  
  // Application operations
  getApplications(filters?: { userId?: string; programId?: string; status?: string }): Promise<Application[]>;
  getApplication(id: string): Promise<Application | undefined>;
  getApplicationByUserAndProgram(userId: string, programId: string): Promise<Application | undefined>;
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

  // CMS operations
  getCmsPages(): Promise<CmsPage[]>;
  createCmsPage(page: InsertCmsPage): Promise<CmsPage>;
  updateCmsPage(id: string, updates: Partial<CmsPage>): Promise<CmsPage>;
  getCmsPageBySlug(slug: string): Promise<CmsPage | undefined>;
  
  getCmsContentSections(pageId: string): Promise<CmsContentSection[]>;
  createCmsContentSection(section: InsertCmsContentSection): Promise<CmsContentSection>;
  updateCmsContentSection(id: string, updates: Partial<CmsContentSection>): Promise<CmsContentSection>;
  deleteCmsContentSection(id: string): Promise<void>;
  
  getCmsMediaAssets(): Promise<CmsMediaAsset[]>;
  createCmsMediaAsset(asset: InsertCmsMediaAsset): Promise<CmsMediaAsset>;
  deleteCmsMediaAsset(id: string): Promise<void>;
  
  // Dynamic page content operations (full DOM editing)
  savePageContent(content: InsertDynamicPageContent): Promise<DynamicPageContent>;
  getPageContent(pageId: string): Promise<DynamicPageContent | undefined>;
  
  // Blog operations
  getBlogPosts(filters?: { search?: string; status?: string; category?: string }): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: string): Promise<void>;
  getBlogStats(): Promise<{
    totalPosts: number;
    publishedPosts: number;
    totalViews: number;
    totalEngagement: number;
    viewsGrowth: number;
    avgReadTime: string;
  }>;
  
  // Blog Category operations
  getBlogCategories(): Promise<BlogCategory[]>;
  createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory>;
  updateBlogCategory(id: string, updates: Partial<BlogCategory>): Promise<BlogCategory>;
  deleteBlogCategory(id: string): Promise<void>;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createAdminUser(userData: { email: string; password: string; firstName: string; lastName: string; adminRole: string }): Promise<User> {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isAdmin: true,
        adminRole: userData.adminRole,
        isActive: true,
      })
      .returning();
    return user;
  }

  async getAllUsers(page = 1, limit = 20): Promise<{ users: User[]; totalCount: number; currentPage: number; hasMore: boolean }> {
    const offset = (page - 1) * limit;
    
    const [usersList, totalCountResult] = await Promise.all([
      db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset),
      db.select({ count: count() }).from(users)
    ]);

    const totalCount = totalCountResult[0].count;
    const hasMore = offset + limit < totalCount;

    return {
      users: usersList,
      totalCount,
      currentPage: page,
      hasMore,
    };
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async toggleUserStatus(id: string): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error('User not found');
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        isActive: !user.isActive,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createUser(userData: any): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async getUserApplications(userId: string): Promise<any[]> {
    const result = await db.select()
      .from(applications)
      .leftJoin(programs, eq(applications.programId, programs.id))
      .leftJoin(users, eq(applications.userId, users.id))
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.applicationDate));
    
    return result.map(row => ({
      ...row.applications,
      program: row.programs,
      user: row.users
    }));
  }

  // Admin operations
  async getAdminUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(and(eq(users.id, id), eq(users.isAdmin, true)));
    return user;
  }

  // Preceptor operations
  async getPreceptor(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(and(eq(users.id, id), eq(users.isPreceptor, true)));
    return user;
  }

  async getPreceptorByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(and(eq(users.email, email), eq(users.isPreceptor, true)));
    return user;
  }

  async createPreceptor(userData: any): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        isPreceptor: true,
        isActive: true,
      })
      .returning();
    return user;
  }

  async getPreceptorPrograms(preceptorId: string): Promise<Program[]> {
    // Ensure preceptor can only see their own programs
    return await db.select({
      id: programs.id,
      title: programs.title,
      type: programs.type,
      specialtyId: programs.specialtyId,
      specialtyName: specialties.name,
      hospitalName: programs.hospitalName,
      hospitalImage: programs.hospitalImage,
      mentorName: programs.mentorName,
      mentorTitle: programs.mentorTitle,
      location: programs.location,
      country: programs.country,
      city: programs.city,
      startDate: programs.startDate,
      duration: programs.duration,
      intakeMonths: programs.intakeMonths,
      availableSeats: programs.availableSeats,
      totalSeats: programs.totalSeats,
      fee: programs.fee,
      currency: programs.currency,
      isHandsOn: programs.isHandsOn,
      description: programs.description,
      requirements: programs.requirements,
      isActive: programs.isActive,
      isFeatured: programs.isFeatured,
      preceptorId: programs.preceptorId,
      createdAt: programs.createdAt,
      updatedAt: programs.updatedAt,
    })
    .from(programs)
    .leftJoin(specialties, eq(programs.specialtyId, specialties.id))
    .where(and(
      eq(programs.preceptorId, preceptorId),
      eq(programs.isActive, true) // Only show active programs
    ))
    .orderBy(desc(programs.createdAt));
  }

  async getPreceptorApplications(preceptorId: string): Promise<Application[]> {
    // Ensure preceptor can only see applications for their own programs
    return await db.select({
      id: applications.id,
      userId: applications.userId,
      programId: applications.programId,
      status: applications.status,
      applicationDate: applications.applicationDate,
      coverLetter: applications.coverLetter,
      cvUrl: applications.cvUrl,
      additionalDocuments: applications.additionalDocuments,
      reviewNotes: applications.reviewNotes,
      reviewedAt: applications.reviewedAt,
      reviewedBy: applications.reviewedBy,
      visaStatus: applications.visaStatus,
      joinDate: applications.joinDate,
      actualJoinDate: applications.actualJoinDate,
      createdAt: applications.createdAt,
      updatedAt: applications.updatedAt,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      },
      program: {
        id: programs.id,
        title: programs.title,
        type: programs.type,
        fee: programs.fee,
        currency: programs.currency,
      },
    })
    .from(applications)
    .innerJoin(programs, eq(applications.programId, programs.id))
    .innerJoin(users, eq(applications.userId, users.id))
    .where(and(
      eq(programs.preceptorId, preceptorId),
      eq(programs.isActive, true) // Only applications for active programs
    ))
    .orderBy(desc(applications.applicationDate));
  }

  async updateApplicationStatus(applicationId: string, status: string, reviewNotes?: string, reviewedBy?: string): Promise<Application> {
    const [application] = await db
      .update(applications)
      .set({
        status: status as any,
        reviewNotes,
        reviewedBy,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(applications.id, applicationId))
      .returning();
    return application;
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
  }, page: number = 1, limit: number = 10): Promise<{
    programs: any[];
    totalCount: number;
    hasMore: boolean;
    currentPage: number;
  }> {
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
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get total count
    const [totalResult] = await db.select({ count: count() }).from(programs).where(whereClause);
    const totalCount = totalResult.count;
    
    // Get paginated programs with specialty name
    const programsData = await db.select({
      id: programs.id,
      title: programs.title,
      type: programs.type,
      specialtyId: programs.specialtyId,
      specialty: specialties.name,
      hospitalName: programs.hospitalName,
      hospitalImage: programs.hospitalImage,
      mentorName: programs.mentorName,
      mentorTitle: programs.mentorTitle,
      location: programs.location,
      country: programs.country,
      city: programs.city,
      startDate: programs.startDate,
      duration: programs.duration,
      intakeMonths: programs.intakeMonths,
      availableSeats: programs.availableSeats,
      totalSeats: programs.totalSeats,
      fee: programs.fee,
      currency: programs.currency,
      isHandsOn: programs.isHandsOn,
      description: programs.description,
      requirements: programs.requirements,
      isActive: programs.isActive,
      isFeatured: programs.isFeatured,
      createdAt: programs.createdAt,
      updatedAt: programs.updatedAt,
      preceptorId: programs.preceptorId,
    })
    .from(programs)
    .leftJoin(specialties, eq(programs.specialtyId, specialties.id))
    .where(whereClause)
    .orderBy(desc(programs.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);
    
    return {
      programs: programsData,
      totalCount,
      hasMore: (page * limit) < totalCount,
      currentPage: page,
    };
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

  // Application operations with joins
  async getApplications(filters?: { userId?: string; programId?: string; status?: string; search?: string; dateRange?: string }): Promise<any[]> {
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

    // Add search functionality
    if (filters?.search) {
      conditions.push(
        sql`(${users.firstName} ILIKE ${'%' + filters.search + '%'} OR 
             ${users.lastName} ILIKE ${'%' + filters.search + '%'} OR 
             ${users.email} ILIKE ${'%' + filters.search + '%'} OR 
             ${programs.title} ILIKE ${'%' + filters.search + '%'} OR 
             ${programs.hospitalName} ILIKE ${'%' + filters.search + '%'})`
      );
    }

    // Add date range filtering
    if (filters?.dateRange && filters.dateRange !== 'all') {
      const days = parseInt(filters.dateRange);
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);
      conditions.push(sql`${applications.applicationDate} >= ${dateThreshold}`);
    }
    
    const query = db.select({
      id: applications.id,
      userId: applications.userId,
      programId: applications.programId,
      status: applications.status,
      applicationDate: applications.applicationDate,
      coverLetter: applications.coverLetter,
      cvUrl: applications.cvUrl,
      additionalDocuments: applications.additionalDocuments,
      reviewNotes: applications.reviewNotes,
      reviewedAt: applications.reviewedAt,
      reviewedBy: applications.reviewedBy,
      visaStatus: applications.visaStatus,
      joinDate: applications.joinDate,
      actualJoinDate: applications.actualJoinDate,
      createdAt: applications.createdAt,
      updatedAt: applications.updatedAt,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      },
      program: {
        id: programs.id,
        title: programs.title,
        type: programs.type,
        city: programs.city,
        country: programs.country,
        hospitalName: programs.hospitalName,
        mentorName: programs.mentorName,
        duration: programs.duration,
        cost: programs.fee,
      },
    })
    .from(applications)
    .leftJoin(users, eq(applications.userId, users.id))
    .leftJoin(programs, eq(applications.programId, programs.id))
    .orderBy(desc(applications.createdAt));
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }
    
    return await query;
  }

  async getApplication(id: string): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application;
  }

  async getApplicationByUserAndProgram(userId: string, programId: string): Promise<Application | undefined> {
    const [application] = await db.select()
      .from(applications)
      .where(and(
        eq(applications.userId, userId),
        eq(applications.programId, programId)
      ));
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
  async getAnalytics(): Promise<any> {
    const [totalPrograms] = await db.select({ count: count() }).from(programs);
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [totalApplications] = await db.select({ count: count() }).from(applications);
    const [pendingApplications] = await db.select({ count: count() })
      .from(applications)
      .where(eq(applications.status, 'pending'));
    const [acceptedApplications] = await db.select({ count: count() })
      .from(applications)
      .where(eq(applications.status, 'accepted'));
    const [rejectedApplications] = await db.select({ count: count() })
      .from(applications)
      .where(eq(applications.status, 'rejected'));
    const [waitlistedApplications] = await db.select({ count: count() })
      .from(applications)
      .where(eq(applications.status, 'waitlisted'));

    // Program type distribution
    const programTypeStats = await db
      .select({
        type: programs.type,
        count: count(),
      })
      .from(programs)
      .groupBy(programs.type);

    // Monthly active users (users who applied in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [activeUsers] = await db.select({ count: sql<number>`count(distinct ${applications.userId})` })
      .from(applications)
      .where(sql`${applications.createdAt} >= ${thirtyDaysAgo}`);

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const [newUsersThisMonth] = await db.select({ count: count() })
      .from(users)
      .where(sql`${users.createdAt} >= ${startOfMonth}`);

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

    // Active countries
    const [activeCountries] = await db.select({ count: sql<number>`count(distinct ${programs.country})` }).from(programs);

    // Calculate success rate
    const successRate = totalApplications.count > 0 
      ? Math.round((acceptedApplications.count / totalApplications.count) * 100) 
      : 0;

    // Financial analytics (using realistic mock data for demo)
    const totalRevenue = 245000;
    const monthlyRevenue = 45000;
    const avgTransactionValue = 2500;
    const pendingPayments = 8;

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
      activeUsers: activeUsers.count,
      newUsersThisMonth: newUsersThisMonth.count,
      applicationSuccessRate: successRate,
      activeCountries: activeCountries.count,
      totalRevenue,
      monthlyRevenue,
      avgTransactionValue,
      pendingPayments,
      applicationStats: {
        pending: pendingApplications.count,
        accepted: acceptedApplications.count,
        rejected: rejectedApplications.count,
        waitlisted: waitlistedApplications.count,
      },
      programStats: programTypeStats.reduce((acc, stat) => {
        acc[stat.type] = stat.count;
        return acc;
      }, {} as Record<string, number>),
      popularSpecialties: popularSpecialties.map(s => ({
        name: s.name,
        count: s.count
      })),
      applicationTrends,
    };
  }

  // CMS operations
  async getCmsPages(): Promise<CmsPage[]> {
    return await db.select().from(cmsPages).orderBy(asc(cmsPages.displayName));
  }

  async createCmsPage(page: InsertCmsPage): Promise<CmsPage> {
    const [newPage] = await db.insert(cmsPages).values(page).returning();
    return newPage;
  }

  async updateCmsPage(id: string, updates: Partial<CmsPage>): Promise<CmsPage> {
    const [updatedPage] = await db
      .update(cmsPages)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cmsPages.id, id))
      .returning();
    return updatedPage;
  }

  async getCmsPageBySlug(slug: string): Promise<CmsPage | undefined> {
    const [page] = await db.select().from(cmsPages).where(eq(cmsPages.slug, slug));
    return page;
  }

  async getCmsPageById(id: string): Promise<CmsPage | undefined> {
    const [page] = await db.select().from(cmsPages).where(eq(cmsPages.id, id));
    return page;
  }

  async getCmsContentSections(pageId: string): Promise<CmsContentSection[]> {
    return await db.select()
      .from(cmsContentSections)
      .where(and(eq(cmsContentSections.pageId, pageId), eq(cmsContentSections.isActive, true)))
      .orderBy(asc(cmsContentSections.sortOrder));
  }

  async createCmsContentSection(section: InsertCmsContentSection): Promise<CmsContentSection> {
    const [newSection] = await db.insert(cmsContentSections).values(section).returning();
    return newSection;
  }

  async updateCmsContentSection(id: string, updates: Partial<Omit<CmsContentSection, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CmsContentSection> {
    // Filter out any timestamp fields that might be in the updates
    const { id: _, createdAt: __, updatedAt: ___, ...safeUpdates } = updates as any;
    
    const [updatedSection] = await db
      .update(cmsContentSections)
      .set({ ...safeUpdates, updatedAt: new Date() })
      .where(eq(cmsContentSections.id, id))
      .returning();
    return updatedSection;
  }

  // Team Member Management Methods
  async getAllTeamMembers(): Promise<TeamMember[]> {
    return await db.select().from(teamMembers).where(eq(teamMembers.isActive, true)).orderBy(teamMembers.sortOrder, teamMembers.name);
  }

  async getTeamMemberById(id: string): Promise<TeamMember | undefined> {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return member;
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db.insert(teamMembers).values(member).returning();
    return newMember;
  }

  async updateTeamMember(id: string, updates: Partial<Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TeamMember> {
    try {
      console.log("Storage: Updating team member", id, "with updates:", updates);
      
      // Filter out any timestamp fields that might be in the updates
      const { id: _, createdAt: __, updatedAt: ___, ...safeUpdates } = updates as any;
      
      console.log("Storage: Safe updates after filtering:", safeUpdates);
      
      // Check if team member exists first
      const existingMember = await db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
      if (existingMember.length === 0) {
        throw new Error(`Team member with id ${id} not found`);
      }
      
      const [updatedMember] = await db
        .update(teamMembers)
        .set({ ...safeUpdates, updatedAt: new Date() })
        .where(eq(teamMembers.id, id))
        .returning();
      
      console.log("Storage: Successfully updated team member:", updatedMember);
      return updatedMember;
    } catch (error) {
      console.error("Storage: Error updating team member:", error);
      throw error;
    }
  }

  async deleteTeamMember(id: string): Promise<void> {
    await db.update(teamMembers).set({ isActive: false, updatedAt: new Date() }).where(eq(teamMembers.id, id));
  }

  async reorderTeamMembers(memberIds: string[]): Promise<void> {
    for (let i = 0; i < memberIds.length; i++) {
      await db
        .update(teamMembers)
        .set({ sortOrder: i, updatedAt: new Date() })
        .where(eq(teamMembers.id, memberIds[i]));
    }
  }

  async deleteCmsContentSection(id: string): Promise<void> {
    await db.update(cmsContentSections)
      .set({ isActive: false })
      .where(eq(cmsContentSections.id, id));
  }

  async getCmsMediaAssets(): Promise<CmsMediaAsset[]> {
    return await db.select().from(cmsMediaAssets).orderBy(desc(cmsMediaAssets.createdAt));
  }

  async createCmsMediaAsset(asset: InsertCmsMediaAsset): Promise<CmsMediaAsset> {
    const [newAsset] = await db.insert(cmsMediaAssets).values(asset).returning();
    return newAsset;
  }

  async deleteCmsMediaAsset(id: string): Promise<void> {
    await db.delete(cmsMediaAssets).where(eq(cmsMediaAssets.id, id));
  }

  // Dynamic page content operations (full DOM editing)
  async savePageContent(content: InsertDynamicPageContent): Promise<DynamicPageContent> {
    // Check if content already exists for this page
    const existing = await this.getPageContent(content.pageId);
    
    if (existing) {
      // Update existing content
      const [updatedContent] = await db
        .update(dynamicPageContent)
        .set({ 
          elements: content.elements,
          fullPageHTML: content.fullPageHTML,
          updatedBy: content.updatedBy,
          updatedAt: new Date()
        })
        .where(eq(dynamicPageContent.pageId, content.pageId))
        .returning();
      return updatedContent;
    } else {
      // Create new content
      const [newContent] = await db
        .insert(dynamicPageContent)
        .values(content)
        .returning();
      return newContent;
    }
  }

  async getPageContent(pageId: string): Promise<DynamicPageContent | undefined> {
    const [content] = await db
      .select()
      .from(dynamicPageContent)
      .where(eq(dynamicPageContent.pageId, pageId))
      .orderBy(desc(dynamicPageContent.updatedAt))
      .limit(1);
    return content;
  }

  // Blog operations
  async getBlogPosts(filters?: { search?: string; status?: string; category?: string }): Promise<BlogPost[]> {
    let query = db.select().from(blogPosts);
    
    if (filters) {
      const conditions = [];
      
      if (filters.search) {
        conditions.push(
          sql`${blogPosts.title} ILIKE ${`%${filters.search}%`} OR ${blogPosts.excerpt} ILIKE ${`%${filters.search}%`} OR ${blogPosts.author} ILIKE ${`%${filters.search}%`}`
        );
      }
      
      if (filters.status && filters.status !== 'all') {
        conditions.push(eq(blogPosts.status, filters.status));
      }
      
      if (filters.category && filters.category !== 'all') {
        conditions.push(eq(blogPosts.category, filters.category));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db.insert(blogPosts).values(post).returning();
    return newPost;
  }

  async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    const [updatedPost] = await db
      .update(blogPosts)
      .set(updates)
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedPost;
  }

  async deleteBlogPost(id: string): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  async getBlogStats(): Promise<{
    totalPosts: number;
    publishedPosts: number;
    totalViews: number;
    totalEngagement: number;
    viewsGrowth: number;
    avgReadTime: string;
  }> {
    const posts = await db.select().from(blogPosts);
    const publishedPosts = posts.filter(p => p.status === 'published');
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalEngagement = posts.reduce((sum, p) => sum + (p.likes || 0) + (p.shares || 0), 0);
    
    // Calculate views growth (mock for now, would need historical data)
    const viewsGrowth = 12.5;
    
    // Calculate average read time
    const totalReadTime = posts
      .filter(p => p.readTime)
      .reduce((sum, p) => {
        const time = parseInt(p.readTime || '0');
        return sum + time;
      }, 0);
    const avgReadTime = posts.length > 0 ? Math.round(totalReadTime / posts.length) + ' min' : '5 min';
    
    return {
      totalPosts: posts.length,
      publishedPosts: publishedPosts.length,
      totalViews,
      totalEngagement,
      viewsGrowth,
      avgReadTime
    };
  }

  // Blog Category operations
  async getBlogCategories(): Promise<BlogCategory[]> {
    return await db.select().from(blogCategories).orderBy(blogCategories.sortOrder);
  }

  async createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory> {
    const [newCategory] = await db.insert(blogCategories).values(category).returning();
    return newCategory;
  }

  async updateBlogCategory(id: string, updates: Partial<BlogCategory>): Promise<BlogCategory> {
    const [updatedCategory] = await db
      .update(blogCategories)
      .set(updates)
      .where(eq(blogCategories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteBlogCategory(id: string): Promise<void> {
    await db.delete(blogCategories).where(eq(blogCategories.id, id));
  }
}

export const storage = new DatabaseStorage();
