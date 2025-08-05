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
  blogPosts,
  courses,
  contentPages,
  mediaAssets,
  teamMembers,
  pageSections,
  menuItems,
  contactInfo,
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
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  createAdminUser(userData: { email: string; password: string; firstName: string; lastName: string; adminRole: string }): Promise<User>;
  getAllUsers(page?: number, limit?: number): Promise<{ users: User[]; totalCount: number; currentPage: number; hasMore: boolean }>;
  deleteUser(id: string): Promise<void>;
  toggleUserStatus(id: string): Promise<User>;
  
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
  getBlogPosts(): Promise<any[]>;
  createBlogPost(blogPost: any): Promise<any>;
  getPublishedBlogPosts(category?: string): Promise<any[]>;
  getCourses(): Promise<any[]>;
  createCourse(course: any): Promise<any>;
  getContentPages(): Promise<any[]>;
  getMediaAssets(): Promise<any[]>;
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
    return await db.select({
      id: programs.id,
      title: programs.title,
      type: programs.type,
      specialtyId: programs.specialtyId,
      specialtyName: specialties.name,
      hospitalName: programs.hospitalName,
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
    .where(eq(programs.preceptorId, preceptorId))
    .orderBy(desc(programs.createdAt));
  }

  async getPreceptorApplications(preceptorId: string): Promise<Application[]> {
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
      },
    })
    .from(applications)
    .innerJoin(programs, eq(applications.programId, programs.id))
    .innerJoin(users, eq(applications.userId, users.id))
    .where(eq(programs.preceptorId, preceptorId))
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
    programs: Program[];
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
    
    // Get paginated programs
    const programsData = await db.select().from(programs)
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
  async getBlogPosts(): Promise<any[]> {
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  async createBlogPost(blogPost: any): Promise<any> {
    const [post] = await db.insert(blogPosts).values({
      ...blogPost,
      publishedAt: blogPost.status === 'published' ? new Date() : null,
    }).returning();
    return post;
  }

  async getPublishedBlogPosts(category?: string): Promise<any[]> {
    const conditions = [eq(blogPosts.status, 'published')];
    if (category && category !== 'All') {
      conditions.push(eq(blogPosts.category, category));
    }
    
    return await db.select().from(blogPosts)
      .where(and(...conditions))
      .orderBy(desc(blogPosts.publishedAt));
  }

  async getCourses(): Promise<any[]> {
    return await db.select().from(courses).orderBy(desc(courses.createdAt));
  }

  async createCourse(course: any): Promise<any> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async getContentPages(): Promise<any[]> {
    return await db.select().from(contentPages).orderBy(asc(contentPages.pageName));
  }

  async getMediaAssets(): Promise<any[]> {
    return await db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt));
  }

  // Enhanced CMS operations for comprehensive content management
  async updateBlogPost(id: string, data: any): Promise<any> {
    const [post] = await db.update(blogPosts).set({
      ...data,
      publishedAt: data.status === 'published' ? new Date() : null,
      updatedAt: new Date(),
    }).where(eq(blogPosts.id, id)).returning();
    return post;
  }

  async deleteBlogPost(id: string): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  async updateCourse(id: string, data: any): Promise<any> {
    const [course] = await db.update(courses).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(courses.id, id)).returning();
    return course;
  }

  async deleteCourse(id: string): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  async getContentPageByName(pageName: string): Promise<any | null> {
    const [page] = await db.select().from(contentPages).where(eq(contentPages.pageName, pageName));
    return page || null;
  }

  async createContentPage(data: any): Promise<any> {
    const [page] = await db.insert(contentPages).values(data).returning();
    return page;
  }

  async updateContentPage(id: string, data: any): Promise<any> {
    const [page] = await db.update(contentPages).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(contentPages.id, id)).returning();
    return page;
  }

  async deleteContentPage(id: string): Promise<void> {
    await db.delete(contentPages).where(eq(contentPages.id, id));
  }

  async createMediaAsset(data: any): Promise<any> {
    const [asset] = await db.insert(mediaAssets).values(data).returning();
    return asset;
  }

  async deleteMediaAsset(id: string): Promise<void> {
    await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
  }

  // Team Members operations
  async getTeamMembers(): Promise<any[]> {
    return await db.select().from(teamMembers)
      .where(eq(teamMembers.isActive, true))
      .orderBy(teamMembers.displayOrder, teamMembers.createdAt);
  }

  async createTeamMember(data: any): Promise<any> {
    const [member] = await db.insert(teamMembers).values(data).returning();
    return member;
  }

  async updateTeamMember(id: string, data: any): Promise<any> {
    const [member] = await db.update(teamMembers).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(teamMembers.id, id)).returning();
    return member;
  }

  async deleteTeamMember(id: string): Promise<void> {
    await db.update(teamMembers).set({ isActive: false }).where(eq(teamMembers.id, id));
  }

  // Page Sections operations
  async getPageSections(pageId: string): Promise<any[]> {
    return await db.select().from(pageSections)
      .where(and(eq(pageSections.pageId, pageId), eq(pageSections.isActive, true)))
      .orderBy(pageSections.displayOrder, pageSections.createdAt);
  }

  async createPageSection(data: any): Promise<any> {
    const [section] = await db.insert(pageSections).values(data).returning();
    return section;
  }

  async updatePageSection(id: string, data: any): Promise<any> {
    const [section] = await db.update(pageSections).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(pageSections.id, id)).returning();
    return section;
  }

  async deletePageSection(id: string): Promise<void> {
    await db.update(pageSections).set({ isActive: false }).where(eq(pageSections.id, id));
  }

  // Menu Items operations
  async getMenuItems(): Promise<any[]> {
    return await db.select().from(menuItems)
      .where(eq(menuItems.isActive, true))
      .orderBy(menuItems.displayOrder, menuItems.createdAt);
  }

  async createMenuItem(data: any): Promise<any> {
    const [item] = await db.insert(menuItems).values(data).returning();
    return item;
  }

  async updateMenuItem(id: string, data: any): Promise<any> {
    const [item] = await db.update(menuItems).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(menuItems.id, id)).returning();
    return item;
  }

  async deleteMenuItem(id: string): Promise<void> {
    await db.update(menuItems).set({ isActive: false }).where(eq(menuItems.id, id));
  }

  // Contact Info operations
  async getContactInfo(): Promise<any | null> {
    const [info] = await db.select().from(contactInfo).limit(1);
    return info || null;
  }

  async upsertContactInfo(data: any): Promise<any> {
    const existing = await this.getContactInfo();
    if (existing) {
      const [updated] = await db.update(contactInfo).set({
        ...data,
        updatedAt: new Date(),
      }).where(eq(contactInfo.id, existing.id)).returning();
      return updated;
    } else {
      const [created] = await db.insert(contactInfo).values(data).returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
