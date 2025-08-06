import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { checkDatabaseHealth, startDatabaseHealthMonitor } from "./database-health";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Check for required environment variables in production
    if (process.env.NODE_ENV === 'production') {
      const requiredEnvVars = ['DATABASE_URL'];
      const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingEnvVars.length > 0) {
        console.error('Missing required environment variables for production:', missingEnvVars);
        console.error('Please ensure all required environment variables are set as production secrets');
        process.exit(1);
      }
      
      log('Production environment variables verified');
      log('Running in production mode - serving static files');
    } else {
      log('Running in development mode with Vite');
    }

    log('Checking database connectivity...');
    const dbHealthy = await checkDatabaseHealth();
    if (!dbHealthy) {
      console.warn('Database initial connection failed, but continuing startup...');
    }

    log('Initializing server and registering routes...');
    const server = await registerRoutes(app);
    log('Routes registered successfully');
    
    // Start database monitoring
    startDatabaseHealthMonitor();

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // Don't crash the server on database errors
      if (err.code === 'ECONNRESET' || err.message?.includes('WebSocket')) {
        console.error('Database connection error (handled):', err.message);
        res.status(503).json({ message: "Database temporarily unavailable, please try again" });
        return;
      }

      console.error(`Error ${status}:`, err);
      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development" || process.env.NODE_ENV === "development") {
      log('Setting up development environment with Vite');
      await setupVite(app, server);
    } else {
      log('Setting up production environment with static file serving');
      try {
        serveStatic(app);
        log('Static file serving configured successfully');
      } catch (error) {
        console.error('Failed to configure static file serving:', error);
        console.error('Make sure the client has been built with: npm run build');
        process.exit(1);
      }
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`Server successfully started on port ${port}`);
      log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      log(`Host: 0.0.0.0:${port}`);
      log(`Server ready to accept connections`);
    });

    // Add graceful shutdown handlers
    process.on('SIGTERM', () => {
      log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      log('SIGINT received, shutting down gracefully');
      server.close(() => {
        log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    log(`Server startup failed: ${error instanceof Error ? error.message : String(error)}`);
    
    // Add specific database connection error handling
    if (error instanceof Error && error.message.includes('database')) {
      console.error('Database connection failed. Please check:');
      console.error('1. DATABASE_URL environment variable is set correctly');
      console.error('2. Database is accessible and running');
      console.error('3. Network connectivity to the database');
    }
    
    process.exit(1);
  }
})();
