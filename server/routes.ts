import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { hasPermission, getUserPermissions } from "./adminPermissions";
import { insertProgramSchema, insertApplicationSchema, insertFavoriteSchema, insertReviewSchema, insertContactQuerySchema, insertNewsletterSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Application routes
  app.get('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const filters: any = {};
      
      // Regular users can only see their own applications
      if (!user?.isAdmin) {
        filters.userId = userId;
      } else {
        // Admins can filter by userId or programId
        if (req.query.userId) filters.userId = req.query.userId as string;
        if (req.query.programId) filters.programId = req.query.programId as string;
        if (req.query.status) filters.status = req.query.status as string;
      }
      
      const applications = await storage.getApplications(filters);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Prevent admins from applying to programs
      if (user?.isAdmin) {
        return res.status(403).json({ message: "Admin users cannot apply to programs" });
      }
      
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

  // CMS Routes - Blog Posts
  app.get('/api/cms/blog-posts', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.post('/api/cms/blog-posts', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const postData = { ...req.body, createdBy: userId };
      const post = await storage.createBlogPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  // CMS Routes - Courses
  app.get('/api/cms/courses', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.post('/api/cms/courses', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const courseData = { ...req.body, createdBy: userId };
      const course = await storage.createCourse(courseData);
      res.json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  // CMS Routes - Content Pages
  app.get('/api/cms/content-pages', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const pages = await storage.getContentPages();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching content pages:", error);
      res.status(500).json({ message: "Failed to fetch content pages" });
    }
  });

  // CMS Routes - Media Assets
  app.get('/api/cms/media-assets', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const assets = await storage.getMediaAssets();
      res.json(assets);
    } catch (error) {
      console.error("Error fetching media assets:", error);
      res.status(500).json({ message: "Failed to fetch media assets" });
    }
  });

  // Public Blog Posts API (for blog page)
  app.get('/api/blog-posts', async (req, res) => {
    try {
      const { category } = req.query;
      const posts = await storage.getPublishedBlogPosts(category as string);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching published blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  // Enhanced CMS Routes for Comprehensive Content Management

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

  // Image upload with automatic .webp conversion
  app.post('/api/cms/upload-image', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

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
        const mediaAsset = await storage.createMediaAsset({
          fileName: webpFileName,
          originalName: req.file.originalname,
          mimeType: 'image/webp',
          fileSize: req.file.size,
          filePath: `/uploads/${webpFileName}`,
          altText: req.body.altText || '',
          uploadedBy: user.id,
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

  // Blog Posts CMS
  app.put('/api/cms/blog-posts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const post = await storage.updateBlogPost(req.params.id, req.body);
      res.json(post);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete('/api/cms/blog-posts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteBlogPost(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // Courses CMS
  app.put('/api/cms/courses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const course = await storage.updateCourse(req.params.id, req.body);
      res.json(course);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  app.delete('/api/cms/courses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteCourse(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Content Pages CMS
  app.get('/api/cms/content-pages/:pageName', async (req, res) => {
    try {
      const page = await storage.getContentPageByName(req.params.pageName);
      res.json(page);
    } catch (error) {
      console.error("Error fetching content page:", error);
      res.status(500).json({ message: "Failed to fetch content page" });
    }
  });

  app.post('/api/cms/content-pages', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const page = await storage.createContentPage(req.body);
      res.status(201).json(page);
    } catch (error) {
      console.error("Error creating content page:", error);
      res.status(500).json({ message: "Failed to create content page" });
    }
  });

  app.put('/api/cms/content-pages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const page = await storage.updateContentPage(req.params.id, req.body);
      res.json(page);
    } catch (error) {
      console.error("Error updating content page:", error);
      res.status(500).json({ message: "Failed to update content page" });
    }
  });

  // Team Members CMS
  app.get('/api/cms/team-members', async (req, res) => {
    try {
      const members = await storage.getTeamMembers();
      res.json(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.post('/api/cms/team-members', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const member = await storage.createTeamMember(req.body);
      res.status(201).json(member);
    } catch (error) {
      console.error("Error creating team member:", error);
      res.status(500).json({ message: "Failed to create team member" });
    }
  });

  app.put('/api/cms/team-members/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const member = await storage.updateTeamMember(req.params.id, req.body);
      res.json(member);
    } catch (error) {
      console.error("Error updating team member:", error);
      res.status(500).json({ message: "Failed to update team member" });
    }
  });

  app.delete('/api/cms/team-members/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteTeamMember(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting team member:", error);
      res.status(500).json({ message: "Failed to delete team member" });
    }
  });

  // Page Sections CMS
  app.get('/api/cms/page-sections/:pageId', async (req, res) => {
    try {
      const sections = await storage.getPageSections(req.params.pageId);
      res.json(sections);
    } catch (error) {
      console.error("Error fetching page sections:", error);
      res.status(500).json({ message: "Failed to fetch page sections" });
    }
  });

  app.post('/api/cms/page-sections', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const section = await storage.createPageSection(req.body);
      res.status(201).json(section);
    } catch (error) {
      console.error("Error creating page section:", error);
      res.status(500).json({ message: "Failed to create page section" });
    }
  });

  app.put('/api/cms/page-sections/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const section = await storage.updatePageSection(req.params.id, req.body);
      res.json(section);
    } catch (error) {
      console.error("Error updating page section:", error);
      res.status(500).json({ message: "Failed to update page section" });
    }
  });

  app.delete('/api/cms/page-sections/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deletePageSection(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting page section:", error);
      res.status(500).json({ message: "Failed to delete page section" });
    }
  });

  // Menu Items CMS
  app.get('/api/cms/menu-items', async (req, res) => {
    try {
      const items = await storage.getMenuItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.post('/api/cms/menu-items', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const item = await storage.createMenuItem(req.body);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.put('/api/cms/menu-items/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const item = await storage.updateMenuItem(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  app.delete('/api/cms/menu-items/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteMenuItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  // Contact Info CMS
  app.get('/api/cms/contact-info', async (req, res) => {
    try {
      const info = await storage.getContactInfo();
      res.json(info);
    } catch (error) {
      console.error("Error fetching contact info:", error);
      res.status(500).json({ message: "Failed to fetch contact info" });
    }
  });

  app.put('/api/cms/contact-info', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const info = await storage.upsertContactInfo(req.body);
      res.json(info);
    } catch (error) {
      console.error("Error updating contact info:", error);
      res.status(500).json({ message: "Failed to update contact info" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
