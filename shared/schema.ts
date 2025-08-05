import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  medicalSchool: varchar("medical_school"),
  graduationYear: integer("graduation_year"),
  specialtyOfInterest: varchar("specialty_of_interest"),
  phoneNumber: varchar("phone_number"),
  isAdmin: boolean("is_admin").default(false),
  adminRole: varchar("admin_role"), // 'super_admin', 'regular_admin'
  adminPermissions: jsonb("admin_permissions").$type<string[]>(), // array of permissions
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Program types enum
export const programTypeEnum = pgEnum('program_type', ['observership', 'hands_on', 'fellowship', 'clerkship']);
export const applicationStatusEnum = pgEnum('application_status', ['pending', 'accepted', 'rejected', 'waitlisted']);
export const reviewStatusEnum = pgEnum('review_status', ['pending', 'approved', 'rejected']);

// Specialties table
export const specialties = pgTable("specialties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Programs table
export const programs = pgTable("programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  type: programTypeEnum("type").notNull(),
  specialtyId: varchar("specialty_id").references(() => specialties.id),
  hospitalName: varchar("hospital_name").notNull(),
  mentorName: varchar("mentor_name").notNull(),
  mentorTitle: varchar("mentor_title"),
  location: varchar("location").notNull(), // City, Country
  country: varchar("country").notNull(),
  city: varchar("city").notNull(),
  startDate: timestamp("start_date").notNull(),
  duration: integer("duration").notNull(), // in weeks
  intakeMonths: text("intake_months").array(), // ['January', 'March', 'June']
  availableSeats: integer("available_seats").notNull(),
  totalSeats: integer("total_seats").notNull(),
  fee: decimal("fee", { precision: 10, scale: 2 }), // null for free programs
  currency: varchar("currency").default('USD'),
  isHandsOn: boolean("is_hands_on").default(false),
  description: text("description").notNull(),
  requirements: text("requirements").array(),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Applications table
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  programId: varchar("program_id").references(() => programs.id).notNull(),
  status: applicationStatusEnum("status").default('pending'),
  applicationDate: timestamp("application_date").defaultNow(),
  coverLetter: text("cover_letter"),
  cvUrl: varchar("cv_url"),
  additionalDocuments: text("additional_documents").array(),
  reviewNotes: text("review_notes"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Favorites table
export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  programId: varchar("program_id").references(() => programs.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  programId: varchar("program_id").references(() => programs.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title"),
  content: text("content").notNull(),
  status: reviewStatusEnum("status").default('pending'),
  isAnonymous: boolean("is_anonymous").default(false),
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Waitlist table
export const waitlist = pgTable("waitlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  programId: varchar("program_id").references(() => programs.id).notNull(),
  position: integer("position"),
  notified: boolean("notified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Newsletter subscriptions
export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contact queries
export const contactQueries = pgTable("contact_queries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  status: varchar("status").default('new'), // 'new', 'in_progress', 'resolved'
  response: text("response"),
  respondedBy: varchar("responded_by").references(() => users.id),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  applications: many(applications),
  favorites: many(favorites),
  reviews: many(reviews),
  waitlistEntries: many(waitlist),
}));

export const specialtiesRelations = relations(specialties, ({ many }) => ({
  programs: many(programs),
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
  specialty: one(specialties, {
    fields: [programs.specialtyId],
    references: [specialties.id],
  }),
  applications: many(applications),
  favorites: many(favorites),
  reviews: many(reviews),
  waitlistEntries: many(waitlist),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
  program: one(programs, {
    fields: [applications.programId],
    references: [programs.id],
  }),
  reviewer: one(users, {
    fields: [applications.reviewedBy],
    references: [users.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  program: one(programs, {
    fields: [favorites.programId],
    references: [programs.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  program: one(programs, {
    fields: [reviews.programId],
    references: [programs.id],
  }),
}));

export const waitlistRelations = relations(waitlist, ({ one }) => ({
  user: one(users, {
    fields: [waitlist.userId],
    references: [users.id],
  }),
  program: one(programs, {
    fields: [waitlist.programId],
    references: [programs.id],
  }),
}));

// Zod schemas
export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertSpecialtySchema = createInsertSchema(specialties).omit({
  id: true,
  createdAt: true,
});

export const insertProgramSchema = createInsertSchema(programs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  applicationDate: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWaitlistSchema = createInsertSchema(waitlist).omit({
  id: true,
  createdAt: true,
});

export const insertNewsletterSchema = createInsertSchema(newsletterSubscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertContactQuerySchema = createInsertSchema(contactQueries).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Specialty = typeof specialties.$inferSelect;
export type Program = typeof programs.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Waitlist = typeof waitlist.$inferSelect;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type ContactQuery = typeof contactQueries.$inferSelect;

export type InsertSpecialty = z.infer<typeof insertSpecialtySchema>;
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSchema>;
export type InsertContactQuery = z.infer<typeof insertContactQuerySchema>;

// Blog Posts table for CMS
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  author: varchar("author").notNull(),
  category: varchar("category").notNull(),
  tags: text("tags").array(),
  featuredImage: varchar("featured_image"),
  readTime: varchar("read_time"),
  status: varchar("status").notNull().default("draft"), // draft, published, archived
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

// Courses table for CMS
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  fullDescription: text("full_description"),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("USD"),
  category: varchar("category"),
  difficulty: varchar("difficulty"), // beginner, intermediate, advanced
  duration: varchar("duration"), // e.g., "6 weeks", "3 months"
  featuredImage: varchar("featured_image"),
  videoUrl: varchar("video_url"),
  syllabus: jsonb("syllabus"),
  prerequisites: text("prerequisites").array(),
  learningOutcomes: text("learning_outcomes").array(),
  instructor: varchar("instructor"),
  instructorBio: text("instructor_bio"),
  instructorImage: varchar("instructor_image"),
  status: varchar("status").notNull().default("draft"), // draft, published, archived
  enrollmentCount: integer("enrollment_count").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

// Content Pages table for CMS (for managing static pages like About, Contact, etc.)
export const contentPages = pgTable("content_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageName: varchar("page_name").notNull().unique(), // about, contact, home-hero, etc.
  title: varchar("title"),
  content: jsonb("content"), // flexible content structure
  seoTitle: varchar("seo_title"),
  seoDescription: text("seo_description"),
  status: varchar("status").notNull().default("published"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by").references(() => users.id),
});

// Media/Assets table for CMS
export const mediaAssets = pgTable("media_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: varchar("file_name").notNull(),
  originalName: varchar("original_name").notNull(),
  mimeType: varchar("mime_type"),
  fileSize: integer("file_size"),
  filePath: varchar("file_path").notNull(),
  altText: varchar("alt_text"),
  caption: text("caption"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
});

// CMS Zod schemas
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentPageSchema = createInsertSchema(contentPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMediaAssetSchema = createInsertSchema(mediaAssets).omit({
  id: true,
  createdAt: true,
});

// Export CMS types
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type ContentPage = typeof contentPages.$inferSelect;
export type InsertContentPage = z.infer<typeof insertContentPageSchema>;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type InsertMediaAsset = z.infer<typeof insertMediaAssetSchema>;
