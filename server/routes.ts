import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { hasPermission, getUserPermissions } from "./adminPermissions";

// Admin authentication middleware

import { insertProgramSchema, insertApplicationSchema, insertFavoriteSchema, insertReviewSchema, insertContactQuerySchema, insertNewsletterSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

// Configure multer for memory storage (for blog images)
const uploadBlog = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  // Helper function to convert Google Drive URLs to proper image URLs
  const convertGoogleDriveUrl = (url: string) => {
    if (!url) return null;
    
    // Check if it's a Google Drive sharing URL
    const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      const fileId = driveMatch[1];
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
    }
    
    return url;
  };

  // Admin authentication middleware function declared here
  const requireAdminSession = (req: any, res: any, next: any) => {
    if (!(req.session as any)?.adminUser) {
      return res.status(401).json({ message: "Admin authentication required" });
    }
    req.adminUser = (req.session as any).adminUser;
    next();
  };

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Add user permissions if admin
      const userWithPermissions = user?.isAdmin ? {
        ...user,
        permissions: getUserPermissions(user)
      } : user;
      
      res.json(userWithPermissions);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Specialty routes
  app.get('/api/specialties', async (req, res) => {
    try {
      const specialties = await storage.getSpecialties();
      res.json(specialties);
    } catch (error) {
      console.error("Error fetching specialties:", error);
      res.status(500).json({ message: "Failed to fetch specialties" });
    }
  });

  // Program routes
  app.get('/api/programs', async (req, res) => {
    try {
      const filters = {
        specialty: req.query.specialty as string,
        location: req.query.location as string,
        type: req.query.type as string,
        minDuration: req.query.minDuration ? parseInt(req.query.minDuration as string) : undefined,
        maxDuration: req.query.maxDuration ? parseInt(req.query.maxDuration as string) : undefined,
        isFree: req.query.isFree === 'true',
        isActive: req.query.isActive !== 'false',
        search: req.query.search as string,
      };
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await storage.getPrograms(filters, page, limit);
      res.json(result);
    } catch (error) {
      console.error("Error fetching programs:", error);
      res.status(500).json({ message: "Failed to fetch programs" });
    }
  });

  app.get('/api/programs/:id', async (req, res) => {
    try {
      const program = await storage.getProgram(req.params.id);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      res.json(program);
    } catch (error) {
      console.error("Error fetching program:", error);
      res.status(500).json({ message: "Failed to fetch program" });
    }
  });

  app.post('/api/programs', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin || !hasPermission(user, 'create_programs')) {
        return res.status(403).json({ message: "Permission denied: Cannot create programs" });
      }

      // Transform the data to match schema expectations
      const transformedData = {
        ...req.body,
        startDate: new Date(req.body.startDate),
        fee: req.body.fee ? parseFloat(req.body.fee) : null,
        duration: parseInt(req.body.duration),
        availableSeats: parseInt(req.body.availableSeats),
        totalSeats: parseInt(req.body.totalSeats),
      };
      
      const validatedData = insertProgramSchema.parse(transformedData);
      const program = await storage.createProgram(validatedData);
      res.status(201).json(program);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating program:", error);
      res.status(500).json({ message: "Failed to create program" });
    }
  });

  app.put('/api/programs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Check if user has modify permission
      if (!hasPermission(user, 'modify_programs')) {
        return res.status(403).json({ message: "Permission denied: Cannot modify programs" });
      }

      const program = await storage.updateProgram(req.params.id, req.body);
      res.json(program);
    } catch (error) {
      console.error("Error updating program:", error);
      res.status(500).json({ message: "Failed to update program" });
    }
  });

  app.delete('/api/programs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Check if user has delete permission
      if (!hasPermission(user, 'delete_programs')) {
        return res.status(403).json({ message: "Permission denied: Cannot delete programs" });
      }

      await storage.deleteProgram(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting program:", error);
      res.status(500).json({ message: "Failed to delete program" });
    }
  });

  // Application routes (admin access)
  app.get('/api/applications', requireAdminSession, async (req: any, res) => {
    try {
      const filters: any = {};
      
      // Admins can filter by userId, programId, status, search, and dateRange
      if (req.query.userId) filters.userId = req.query.userId as string;
      if (req.query.programId) filters.programId = req.query.programId as string;
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.search) filters.search = req.query.search as string;
      if (req.query.dateRange) filters.dateRange = req.query.dateRange as string;
      
      const applications = await storage.getApplications(filters);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Get single application by ID (admin only)
  app.get('/api/applications/:id', requireAdminSession, async (req: any, res) => {
    try {
      const applicationId = req.params.id;
      const applications = await storage.getApplications({});
      const application = applications.find(app => app.id === applicationId);
      
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }

      res.json(application);
    } catch (error) {
      console.error('Error fetching application:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Allow admins to apply to programs for testing purposes
      // In production, you might want to uncomment this restriction
      // if (user?.isAdmin) {
      //   return res.status(403).json({ message: "Admin users cannot apply to programs" });
      // }
      
      const validatedData = insertApplicationSchema.parse({
        ...req.body,
        userId,
      });
      
      const application = await storage.createApplication(validatedData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.put('/api/applications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const application = await storage.getApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Users can only update their own applications, admins can update any
      if (!user?.isAdmin && application.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedApplication = await storage.updateApplication(req.params.id, req.body);
      res.json(updatedApplication);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  // Favorite routes
  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertFavoriteSchema.parse({
        ...req.body,
        userId,
      });
      
      const favorite = await storage.addFavorite(validatedData);
      res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete('/api/favorites/:programId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.removeFavorite(userId, req.params.programId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  app.get('/api/favorites/:programId/check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const isFavorite = await storage.isFavorite(userId, req.params.programId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite:", error);
      res.status(500).json({ message: "Failed to check favorite" });
    }
  });

  // Review routes
  app.get('/api/reviews', async (req, res) => {
    try {
      const programId = req.query.programId as string;
      const reviews = await storage.getReviews(programId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        userId,
      });
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Contact routes
  app.post('/api/contact', async (req, res) => {
    try {
      const validatedData = insertContactQuerySchema.parse(req.body);
      const query = await storage.createContactQuery(validatedData);
      res.status(201).json(query);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating contact query:", error);
      res.status(500).json({ message: "Failed to create contact query" });
    }
  });

  app.get('/api/contact', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const queries = await storage.getContactQueries();
      res.json(queries);
    } catch (error) {
      console.error("Error fetching contact queries:", error);
      res.status(500).json({ message: "Failed to fetch contact queries" });
    }
  });

  // Newsletter routes
  app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
      const validatedData = insertNewsletterSchema.parse(req.body);
      const subscription = await storage.subscribeNewsletter(validatedData);
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  // Analytics routes
  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Admin middleware functions defined above

  // CMS Routes - Pages Management
  app.get('/api/cms/pages', requireAdminSession, async (req: any, res) => {
    try {
      const pages = await storage.getCmsPages();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching CMS pages:", error);
      res.status(500).json({ message: "Failed to fetch CMS pages" });
    }
  });

  app.get('/api/cms/pages/:id', requireAdminSession, async (req: any, res) => {
    try {
      const { id } = req.params;
      const page = await storage.getCmsPageById(id);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error fetching CMS page:", error);
      res.status(500).json({ message: "Failed to fetch CMS page" });
    }
  });

  app.post('/api/cms/pages', requireAdminSession, async (req: any, res) => {
    try {
      const pageData = req.body;
      const page = await storage.createCmsPage(pageData);
      res.json(page);
    } catch (error) {
      console.error("Error creating CMS page:", error);
      res.status(500).json({ message: "Failed to create CMS page" });
    }
  });

  app.put('/api/cms/pages/:id', requireAdminSession, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const page = await storage.updateCmsPage(id, updates);
      res.json(page);
    } catch (error) {
      console.error("Error updating CMS page:", error);
      res.status(500).json({ message: "Failed to update CMS page" });
    }
  });

  // CMS Routes - Content Sections Management
  // Public endpoint for reading CMS content sections (for frontend display)
  app.get('/api/cms/pages/:pageId/sections', async (req: any, res) => {
    try {
      const { pageId } = req.params;
      const sections = await storage.getCmsContentSections(pageId);
      res.json(sections);
    } catch (error) {
      console.error("Error fetching content sections:", error);
      res.status(500).json({ message: "Failed to fetch content sections" });
    }
  });

  // Admin-only endpoint for managing CMS content sections
  app.get('/api/admin/cms/pages/:pageId/sections', requireAdminSession, async (req: any, res) => {
    try {
      const { pageId } = req.params;
      const sections = await storage.getCmsContentSections(pageId);
      res.json(sections);
    } catch (error) {
      console.error("Error fetching content sections:", error);
      res.status(500).json({ message: "Failed to fetch content sections" });
    }
  });

  app.post('/api/cms/content-sections', requireAdminSession, async (req: any, res) => {
    try {
      const sectionData = {
        ...req.body,
        sectionName: req.body.sectionName || 'main',
        sectionTitle: req.body.sectionTitle || 'New Section'
      };
      const section = await storage.createCmsContentSection(sectionData);
      res.status(201).json(section);
    } catch (error) {
      console.error("Error creating content section:", error);
      res.status(500).json({ message: "Failed to create content section" });
    }
  });

  app.put('/api/cms/content-sections/:id', requireAdminSession, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { 
        sectionName, 
        sectionKey, 
        sectionTitle, 
        contentType, 
        content, 
        imageUrl, 
        altText, 
        sortOrder, 
        isActive 
      } = req.body;
      
      // Only allow updating specific fields, exclude timestamps and id
      const updates = {
        ...(sectionName && { sectionName }),
        ...(sectionKey && { sectionKey }),
        ...(sectionTitle && { sectionTitle }),
        ...(contentType && { contentType }),
        ...(content !== undefined && { content }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(altText !== undefined && { altText }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive })
      };
      
      const section = await storage.updateCmsContentSection(id, updates);
      res.json(section);
    } catch (error) {
      console.error("Error updating content section:", error);
      res.status(500).json({ message: "Failed to update content section" });
    }
  });

  app.delete('/api/cms/content-sections/:id', requireAdminSession, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCmsContentSection(id);
      res.json({ message: "Content section deleted successfully" });
    } catch (error) {
      console.error("Error deleting content section:", error);
      res.status(500).json({ message: "Failed to delete content section" });
    }
  });

  // CMS Routes - Media Assets Management
  app.get('/api/cms/media-assets', requireAdminSession, async (req: any, res) => {
    try {
      const assets = await storage.getCmsMediaAssets();
      res.json(assets);
    } catch (error) {
      console.error("Error fetching media assets:", error);
      res.status(500).json({ message: "Failed to fetch media assets" });
    }
  });

  // Upload image route for blog posts
  app.post('/api/cms/upload-image', requireAdminSession, uploadBlog.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads', 'blog');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExt = path.extname(req.file.originalname);
      const fileName = `blog-${uniqueSuffix}${fileExt}`;
      const filePath = path.join(uploadsDir, fileName);

      // Move file to uploads directory
      fs.writeFileSync(filePath, req.file.buffer);

      // Return the URL
      const imageUrl = `/uploads/blog/${fileName}`;
      res.json({ url: imageUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Public Blog Posts API (for public blog page)
  app.get('/api/blog-posts/:category?', async (req: any, res) => {
    try {
      const { category } = req.params;
      const posts = await storage.getBlogPosts({ 
        status: 'published',
        category: category && category !== 'All' ? category : undefined
      });
      res.json(posts || []);
    } catch (error) {
      console.error("Error fetching public blog posts:", error);
      res.json([]); // Return empty array for public endpoint
    }
  });

  // Get single blog post by slug (public)
  app.get('/api/blog-posts/post/:slug', async (req: any, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlug(slug);
      if (!post || post.status !== 'published') {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post by slug:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // CMS Routes - Blog Management
  app.get('/api/cms/blog', requireAdminSession, async (req: any, res) => {
    try {
      const { search, status, category } = req.query;
      const posts = await storage.getBlogPosts({ search, status, category });
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get('/api/cms/blog/stats', requireAdminSession, async (req: any, res) => {
    try {
      const stats = await storage.getBlogStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching blog stats:", error);
      res.status(500).json({ message: "Failed to fetch blog stats" });
    }
  });

  app.get('/api/cms/blog/:id', requireAdminSession, async (req: any, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.post('/api/cms/blog', requireAdminSession, async (req: any, res) => {
    try {
      const postData = {
        ...req.body,
        createdBy: req.adminUser.id,
        authorId: req.adminUser.id,
        publishedAt: req.body.status === 'published' ? new Date() : null
      };
      const post = await storage.createBlogPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  app.put('/api/cms/blog/:id', requireAdminSession, async (req: any, res) => {
    try {
      const updates = {
        ...req.body,
        updatedAt: new Date(),
        publishedAt: req.body.status === 'published' 
          ? (req.body.publishedAt ? new Date(req.body.publishedAt) : new Date())
          : (req.body.publishedAt ? new Date(req.body.publishedAt) : null)
      };
      
      // Ensure dates are properly formatted
      if (updates.createdAt) {
        updates.createdAt = new Date(updates.createdAt);
      }
      
      const post = await storage.updateBlogPost(req.params.id, updates);
      res.json(post);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete('/api/cms/blog/:id', requireAdminSession, async (req: any, res) => {
    try {
      await storage.deleteBlogPost(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // Blog Categories
  app.get('/api/cms/blog-categories', async (req, res) => {
    try {
      const categories = await storage.getBlogCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching blog categories:", error);
      res.status(500).json({ message: "Failed to fetch blog categories" });
    }
  });

  app.post('/api/cms/blog-categories', requireAdminSession, async (req: any, res) => {
    try {
      const category = await storage.createBlogCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating blog category:", error);
      res.status(500).json({ message: "Failed to create blog category" });
    }
  });

  // Initialize CMS with default pages
  async function initializeCmsPages() {
    try {
      const existingPages = await storage.getCmsPages();
      if (existingPages.length === 0) {
        const defaultPages = [
          {
            pageName: 'home' as const,
            displayName: 'Home Page',
            slug: 'home',
            title: 'MEDILY - Medical Rotation Marketplace',
            metaDescription: 'Find and apply to medical rotations, observerships, and clinical training programs worldwide.'
          },
          {
            pageName: 'about' as const,
            displayName: 'About Us',
            slug: 'about',
            title: 'About Us - MEDILY',
            metaDescription: 'Learn about MEDILY\'s mission to connect medical professionals with quality clinical rotation opportunities.'
          },
          {
            pageName: 'courses' as const,
            displayName: 'Courses & Programs',
            slug: 'courses',
            title: 'Medical Courses & Programs - MEDILY',
            metaDescription: 'Explore our comprehensive medical training courses and rotation programs.'
          },
          {
            pageName: 'contact' as const,
            displayName: 'Contact Us',
            slug: 'contact',
            title: 'Contact Us - MEDILY',
            metaDescription: 'Get in touch with MEDILY for questions about medical rotations and programs.'
          },
          {
            pageName: 'join' as const,
            displayName: 'Join Our Platform',
            slug: 'join',
            title: 'Join MEDILY - Medical Professionals',
            metaDescription: 'Join MEDILY as a medical student or healthcare professional to access exclusive rotation opportunities.'
          },
          {
            pageName: 'terms' as const,
            displayName: 'Terms & Conditions',
            slug: 'terms-conditions',
            title: 'Terms & Conditions - MEDILY',
            metaDescription: 'Review MEDILY\'s terms and conditions for using our medical rotation platform.'
          },
          {
            pageName: 'disclaimer' as const,
            displayName: 'Medical Disclaimer',
            slug: 'disclaimer',
            title: 'Medical Disclaimer - MEDILY',
            metaDescription: 'Important medical disclaimer and liability information for MEDILY users.'
          },
          {
            pageName: 'refund' as const,
            displayName: 'Refund Policy',
            slug: 'refund-policy',
            title: 'Refund Policy - MEDILY',
            metaDescription: 'Learn about MEDILY\'s refund policy for medical rotation programs and services.'
          }
        ];

        for (const pageData of defaultPages) {
          await storage.createCmsPage(pageData);
        }
        console.log('CMS pages initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing CMS pages:', error);
    }
  }

  // Initialize CMS pages on startup
  await initializeCmsPages();

  // Configure multer for image uploads
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage_multer = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  });

  const upload = multer({
    storage: storage_multer,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
      }
    }
  });

  // Universal image upload endpoint (supports team members and CMS)
  app.post('/api/upload-image', requireAdminSession, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const originalPath = req.file.path;
      const webpFileName = `${path.parse(req.file.filename).name}.webp`;
      const webpPath = path.join(uploadDir, webpFileName);

      try {
        // Convert to WebP using sharp or ffmpeg (fallback)
        try {
          await execPromise(`ffmpeg -i "${originalPath}" -c:v libwebp -quality 80 "${webpPath}"`);
        } catch (ffmpegError) {
          // If ffmpeg is not available, just copy the file for now
          fs.copyFileSync(originalPath, webpPath);
        }

        // Clean up original file if conversion was successful
        if (fs.existsSync(webpPath)) {
          fs.unlinkSync(originalPath);
        }

        res.json({
          success: true,
          url: `/uploads/${webpFileName}`,
          message: "Image uploaded successfully"
        });
      } catch (conversionError) {
        console.error('Error converting image:', conversionError);
        // Clean up files
        if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
        if (fs.existsSync(webpPath)) fs.unlinkSync(webpPath);
        res.status(500).json({ message: "Error processing image" });
      }
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed", error: (error as Error).message });
    }
  });

  // Save dynamic page content (full DOM editing)
  app.post('/api/cms/save-page-content', requireAdminSession, async (req: any, res) => {
    try {
      const { pageId, elements, fullPageHTML } = req.body;
      
      if (!pageId) {
        return res.status(400).json({ message: "Page ID is required" });
      }

      // Save to a new table for dynamic page content
      const pageContent = await storage.savePageContent({
        pageId,
        elements: JSON.stringify(elements),
        fullPageHTML,
        updatedBy: req.adminUser.id
      });

      res.json({
        success: true,
        message: "Page content saved successfully",
        contentId: pageContent.id
      });
    } catch (error) {
      console.error("Error saving page content:", error);
      res.status(500).json({ 
        message: "Failed to save page content", 
        error: (error as Error).message 
      });
    }
  });

  // Get dynamic page content
  app.get('/api/cms/page-content/:pageId', async (req, res) => {
    try {
      const { pageId } = req.params;
      const pageContent = await storage.getPageContent(pageId);
      
      if (!pageContent) {
        return res.status(404).json({ message: "Page content not found" });
      }

      res.json({
        ...pageContent,
        elements: JSON.parse(pageContent.elements || '[]')
      });
    } catch (error) {
      console.error("Error fetching page content:", error);
      res.status(500).json({ 
        message: "Failed to fetch page content", 
        error: (error as Error).message 
      });
    }
  });

  // CMS specific image upload (legacy support)
  app.post('/api/cms/upload-image', requireAdminSession, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const originalPath = req.file.path;
      const webpFileName = `${path.parse(req.file.filename).name}.webp`;
      const webpPath = path.join(uploadDir, webpFileName);

      try {
        // Convert to WebP using sharp or ffmpeg (fallback)
        try {
          await execPromise(`ffmpeg -i "${originalPath}" -c:v libwebp -quality 80 "${webpPath}"`);
        } catch (ffmpegError) {
          // If ffmpeg is not available, just copy the file for now
          fs.copyFileSync(originalPath, webpPath);
        }

        // Clean up original file if conversion was successful
        if (fs.existsSync(webpPath)) {
          fs.unlinkSync(originalPath);
        }

        // Save to database
        const mediaAsset = await storage.createCmsMediaAsset({
          fileName: webpFileName,
          originalName: req.file.originalname,
          filePath: `/uploads/${webpFileName}`,
          fileUrl: `/uploads/${webpFileName}`,
          fileType: 'image/webp',
          fileSize: req.file.size,
          uploadedBy: req.adminUser.id,
        });

        res.json({
          success: true,
          asset: mediaAsset,
          url: `/uploads/${webpFileName}`,
        });
      } catch (conversionError) {
        console.error('Error converting image:', conversionError);
        // Clean up files
        if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
        if (fs.existsSync(webpPath)) fs.unlinkSync(webpPath);
        res.status(500).json({ message: "Error processing image" });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Serve uploaded images
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    next();
  });
  app.use('/uploads', express.static(uploadDir));

  // Public CMS API for accessing page content by slug
  app.get('/api/cms/pages/:slug/content', async (req, res) => {
    try {
      const { slug } = req.params;
      const page = await storage.getCmsPageBySlug(slug);
      
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }

      const sections = await storage.getCmsContentSections(page.id);
      res.json({ page, sections });
    } catch (error) {
      console.error("Error fetching page content:", error);
      res.status(500).json({ message: "Failed to fetch page content" });
    }
  });



  // Signup route
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, firstName, lastName, role, phoneNumber, medicalSchool, hospitalAffiliation, medicalLicenseNumber } = req.body;
      
      if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({ message: "Required fields are missing" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user based on role
      const userData: any = {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        phoneNumber,
        isActive: true,
      };

      // Add role-specific fields
      if (role === 'admin') {
        userData.isAdmin = true;
        userData.adminRole = 'regular_admin';
      } else if (role === 'preceptor') {
        userData.isPreceptor = true;
        userData.hospitalAffiliation = hospitalAffiliation;
        userData.medicalLicenseNumber = medicalLicenseNumber;
      } else if (role === 'student') {
        userData.medicalSchool = medicalSchool;
      }

      const newUser = await storage.createUser(userData);

      // Set session
      (req.session as any).user = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      };

      req.session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
        }
      });

      res.json({ 
        message: "Account created successfully", 
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
        }
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Get current user
  app.get('/api/auth/current-user', async (req: any, res) => {
    try {
      if ((req.session as any)?.user) {
        const user = await storage.getUser((req.session as any).user.id);
        res.json(user);
      } else {
        res.status(401).json({ message: "Not authenticated" });
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Student-specific routes
  app.get('/api/student/applications', async (req: any, res) => {
    try {
      if (!(req.session as any)?.user || (req.session as any).user.role !== 'student') {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const applications = await storage.getUserApplications((req.session as any).user.id);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching student applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Preceptor-specific routes
  app.get('/api/preceptor/programs', async (req: any, res) => {
    try {
      if (!(req.session as any)?.user || (req.session as any).user.role !== 'preceptor') {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const programs = await storage.getPreceptorPrograms((req.session as any).user.id);
      res.json(programs);
    } catch (error) {
      console.error("Error fetching preceptor programs:", error);
      res.status(500).json({ message: "Failed to fetch programs" });
    }
  });

  app.get('/api/preceptor/applications', async (req: any, res) => {
    try {
      if (!(req.session as any)?.user || (req.session as any).user.role !== 'preceptor') {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const applications = await storage.getPreceptorApplications((req.session as any).user.id);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching preceptor applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.put('/api/preceptor/applications/:id', async (req: any, res) => {
    try {
      if (!(req.session as any)?.user || (req.session as any).user.role !== 'preceptor') {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { status, reviewNotes } = req.body;
      const application = await storage.updateApplication(req.params.id, { status, reviewNotes });
      res.json(application);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  // Admin authentication routes
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !user.isAdmin || !user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const bcrypt = await import('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "Account is deactivated" });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLoginAt: new Date() });

      // Set session - type assertion for session extension
      (req.session as any).adminUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        adminRole: user.adminRole,
      };

      // Save session explicitly
      req.session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
        }
      });

      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName,
          lastName: user.lastName,
          adminRole: user.adminRole 
        } 
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/admin/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // User management routes
  app.get('/api/admin/users', requireAdminSession, async (req: any, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      
      const result = await storage.getAllUsers(page, limit);
      res.json(result);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/users', requireAdminSession, async (req: any, res) => {
    try {
      const { email, password, firstName, lastName, adminRole } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      const user = await storage.createAdminUser({
        email,
        password,
        firstName,
        lastName,
        adminRole: adminRole || 'regular_admin'
      });

      // Remove password from response
      const { password: _, ...userResponse } = user;
      res.status(201).json(userResponse);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put('/api/admin/users/:id/toggle-status', requireAdminSession, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const updatedUser = await storage.toggleUserStatus(userId);
      
      // Remove password from response
      const { password: _, ...userResponse } = updatedUser;
      res.json(userResponse);
    } catch (error) {
      console.error("Error toggling user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  app.delete('/api/admin/users/:id', requireAdminSession, async (req: any, res) => {
    try {
      const userId = req.params.id;
      
      // Prevent deletion of self
      if (userId === req.adminUser.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      await storage.deleteUser(userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.get('/api/admin/current-user', requireAdminSession, (req: any, res) => {
    res.json(req.adminUser);
  });

  // Preceptor Authentication Routes
  app.post('/api/preceptor/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName, hospitalAffiliation, medicalLicenseNumber, phoneNumber } = req.body;
      
      // Check if preceptor already exists
      const existingPreceptor = await storage.getPreceptorByEmail(email);
      if (existingPreceptor) {
        return res.status(400).json({ message: "Preceptor with this email already exists" });
      }

      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create preceptor
      const preceptor = await storage.createPreceptor({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        hospitalAffiliation,
        medicalLicenseNumber,
        phoneNumber,
        isPreceptor: true,
      });

      res.json({ success: true, preceptor: { id: preceptor.id, email: preceptor.email } });
    } catch (error) {
      console.error('Preceptor registration error:', error);
      res.status(500).json({ message: 'Failed to create preceptor account' });
    }
  });

  app.post('/api/preceptor/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      const preceptor = await storage.getPreceptorByEmail(email);
      if (!preceptor || !preceptor.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const bcrypt = await import('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, preceptor.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Set session
      (req.session as any).preceptorUser = {
        id: preceptor.id,
        email: preceptor.email,
        firstName: preceptor.firstName,
        lastName: preceptor.lastName,
      };

      res.json({ 
        success: true, 
        user: {
          id: preceptor.id,
          email: preceptor.email,
          firstName: preceptor.firstName,
          lastName: preceptor.lastName,
        }
      });
    } catch (error) {
      console.error('Preceptor login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  const requirePreceptorSession = (req: any, res: any, next: any) => {
    if (!(req.session as any)?.preceptorUser) {
      return res.status(401).json({ message: "Preceptor authentication required" });
    }
    req.preceptorUser = (req.session as any).preceptorUser;
    next();
  };

  app.get('/api/preceptor/current-user', requirePreceptorSession, async (req: any, res) => {
    try {
      const preceptor = await storage.getPreceptor(req.preceptorUser.id);
      if (!preceptor) {
        return res.status(404).json({ message: "Preceptor not found" });
      }
      res.json(preceptor);
    } catch (error) {
      console.error('Error fetching preceptor:', error);
      res.status(500).json({ message: 'Failed to fetch preceptor' });
    }
  });

  app.get('/api/preceptor/logout', (req, res) => {
    (req.session as any).preceptorUser = null;
    res.redirect('/preceptor-login');
  });

  // Preceptor Program Management Routes
  app.get('/api/preceptor/programs', requirePreceptorSession, async (req: any, res) => {
    try {
      // Only return programs belonging to the authenticated preceptor
      const programs = await storage.getPreceptorPrograms(req.preceptorUser.id);
      res.json(programs);
    } catch (error) {
      console.error('Error fetching preceptor programs:', error);
      res.status(500).json({ message: 'Failed to fetch programs' });
    }
  });

  app.post('/api/preceptor/programs', requirePreceptorSession, async (req: any, res) => {
    try {
      // Ensure preceptorId is set correctly and cannot be overridden
      const programData = {
        ...req.body,
        preceptorId: req.preceptorUser.id, // Always use authenticated preceptor's ID
        isActive: true, // New programs are active by default
        // Don't set createdAt and updatedAt here - let the database handle defaults
      };
      
      // Convert startDate to proper Date object if it's a string
      if (programData.startDate && typeof programData.startDate === 'string') {
        programData.startDate = new Date(programData.startDate);
      }
      
      // Remove any potential security-sensitive fields that shouldn't be set by preceptor
      delete programData.isFeatured;
      delete programData.createdAt;
      delete programData.updatedAt;
      
      const program = await storage.createProgram(programData);
      res.json(program);
    } catch (error) {
      console.error('Error creating program:', error);
      res.status(500).json({ message: 'Failed to create program' });
    }
  });

  app.get('/api/preceptor/applications', requirePreceptorSession, async (req: any, res) => {
    try {
      // Only return applications for programs belonging to the authenticated preceptor
      const applications = await storage.getPreceptorApplications(req.preceptorUser.id);
      res.json(applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({ message: 'Failed to fetch applications' });
    }
  });

  app.put('/api/preceptor/applications/:id', requirePreceptorSession, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, reviewNotes } = req.body;
      
      // First verify that this application belongs to the preceptor's program
      const application = await storage.getApplication(id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      const program = await storage.getProgram(application.programId);
      if (!program || program.preceptorId !== req.preceptorUser.id) {
        return res.status(403).json({ message: 'Access denied: Application does not belong to your program' });
      }
      
      const updatedApplication = await storage.updateApplicationStatus(id, status, reviewNotes, req.preceptorUser.id);
      res.json(updatedApplication);
    } catch (error) {
      console.error('Error updating application:', error);
      res.status(500).json({ message: 'Failed to update application' });
    }
  });

  // Team Member Management Routes
  // Get all team members
  app.get("/api/team-members", async (req, res) => {
    try {
      const members = await storage.getAllTeamMembers();
      res.json(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  // Get team member by ID
  app.get("/api/team-members/:id", async (req, res) => {
    try {
      const member = await storage.getTeamMemberById(req.params.id);
      if (!member) {
        return res.status(404).json({ error: "Team member not found" });
      }
      res.json(member);
    } catch (error) {
      console.error("Error fetching team member:", error);
      res.status(500).json({ error: "Failed to fetch team member" });
    }
  });

  // Create team member (admin only)
  app.post("/api/team-members", requireAdminSession, async (req: any, res) => {
    try {
      console.log("Creating team member with data:", req.body);
      console.log("Admin user:", req.adminUser);
      
      // Process the data with Google Drive URL conversion
      const processedData = {
        ...req.body,
        profileImage: convertGoogleDriveUrl(req.body.profileImage)
      };
      
      const newMember = await storage.createTeamMember(processedData);
      res.status(201).json(newMember);
    } catch (error) {
      console.error("Error creating team member:", error);
      res.status(500).json({ error: "Failed to create team member", details: (error as Error).message });
    }
  });

  // Update team member (admin only)
  app.put("/api/team-members/:id", requireAdminSession, async (req: any, res) => {
    try {
      const { id } = req.params;
      console.log("Updating team member:", id, "with data:", req.body);
      console.log("Admin user:", req.adminUser);
      
      // Validate required fields
      if (!req.body.name || !req.body.title) {
        return res.status(400).json({ 
          error: "Missing required fields", 
          details: "Name and title are required" 
        });
      }
      
      // Ensure proper data types
      const updateData = {
        name: String(req.body.name),
        title: String(req.body.title),
        bio: req.body.bio ? String(req.body.bio) : null,
        profileImage: convertGoogleDriveUrl(req.body.profileImage),
        email: req.body.email ? String(req.body.email) : null,
        linkedinUrl: req.body.linkedinUrl ? String(req.body.linkedinUrl) : null,
        sortOrder: req.body.sortOrder ? parseInt(req.body.sortOrder) : 0,
      };
      
      console.log("Processed update data:", updateData);
      const updatedMember = await storage.updateTeamMember(id, updateData);
      res.json(updatedMember);
    } catch (error) {
      console.error("Error updating team member:", error);
      res.status(500).json({ error: "Failed to update team member", details: (error as Error).message });
    }
  });

  // Delete team member (admin only)
  app.delete("/api/team-members/:id", requireAdminSession, async (req: any, res) => {
    try {
      await storage.deleteTeamMember(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting team member:", error);
      res.status(500).json({ error: "Failed to delete team member" });
    }
  });

  // Reorder team members (admin only)
  app.put("/api/team-members/reorder", requireAdminSession, async (req: any, res) => {
    try {
      const { memberIds } = req.body;
      await storage.reorderTeamMembers(memberIds);
      res.json({ success: true });
    } catch (error) {
      console.error("Error reordering team members:", error);
      res.status(500).json({ error: "Failed to reorder team members" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
