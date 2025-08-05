# MEDILY - Clinical Rotation Marketplace

## Overview

MEDILY is a full-stack web application that serves as a clinical rotation marketplace for medical professionals. The platform connects healthcare professionals with short-term clinical experiences including observerships, hands-on training, fellowships, and clerkships. Built with a modern tech stack, it provides a comprehensive solution for browsing, filtering, and applying to medical rotations while offering administrative tools for program management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### August 5, 2025
- Updated navigation menu: Changed "Join" to "Jobs" in landing page navigation
- Created completely new About Us page with authentic content from skillwithmedily.com
- Enhanced About Us page features authentic team information (Mr. Siddhant Hardik - Founder, Dr Jitendra Singh - Growth Mentor, Dr Rajeev Ranjan - Program Mentor)
- Added authentic vision and mission statements from Skill With Medily
- Included "Why Skill With Medily" section with key features: simple content, expert-made courses, real skills focus, affordable pricing
- Enhanced admin dashboard with comprehensive analytics including real-time metrics, charts, and role-based access control
- Fixed TypeScript errors and improved server-side analytics functionality
- Added smooth horizontal carousel on home page (authenticated users only) showcasing medical department programs with continuous right-to-left scrolling effect
- Implemented CSS animations for carousel with 30-second loop, pause on hover functionality, and seamless infinite scroll
- Carousel features Emergency Medicine, IVF Training, Ultrasound Training, Radiology Training, Surgery Training, and Cardiology Training programs
- Carousel only displays to authenticated users on home page, hidden from non-authenticated users on landing page
- Removed "Get Started" and "Log In" buttons from navigation menu for cleaner interface
- Optimized page loading performance with proper authentication caching, reduced unnecessary API requests, and improved query configurations
- Added performance optimizations: reduced auth polling, proper stale time settings, image lazy loading, and font display optimization
- Target loading time reduced to under 1 second through query caching and request reduction
- Updated MEDILY logo consistently across all pages including navbar, landing page, footer, and page title for cohesive branding

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/ui with Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming support
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **API Design**: RESTful API with structured route handlers
- **Authentication**: OpenID Connect (OIDC) with Passport.js integration
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple

### Database Layer
- **Database**: PostgreSQL for relational data storage
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon serverless PostgreSQL with connection pooling

### Key Data Models
- **Users**: Medical professionals and administrators with role-based access
- **Programs**: Clinical rotation listings with detailed metadata
- **Applications**: User applications to programs with status tracking
- **Specialties**: Medical specialties for categorization
- **Reviews**: User feedback system for programs
- **Favorites**: User bookmark functionality

### Authentication & Authorization
- **Provider**: Replit OIDC integration for seamless authentication
- **Session Storage**: PostgreSQL-backed sessions for scalability
- **Role-Based Access**: Differentiated permissions for users, sub-admins, and super-admins
- **Security**: Secure session management with HTTP-only cookies

### UI/UX Design
- **Design System**: Consistent component library with shadcn/ui
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: ARIA-compliant components from Radix UI
- **Theme Support**: CSS custom properties for light/dark mode capability
- **Medical Theme**: Custom color palette optimized for healthcare applications

### Search & Filtering
- **Multi-faceted Search**: Specialty, location, duration, type, and cost filters
- **Real-time Updates**: Dynamic filtering with immediate results
- **Query Optimization**: Efficient database queries with proper indexing

### Application Management
- **Status Tracking**: Comprehensive application lifecycle management
- **Waitlist System**: Automated waitlist handling for full programs
- **Notification System**: Toast notifications for user feedback

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit OIDC service for user authentication
- **Session Storage**: PostgreSQL for distributed session management

### Development & Build Tools
- **Package Manager**: npm with lock file for consistent dependencies
- **Build System**: Vite for frontend bundling and development server
- **TypeScript**: Full-stack type checking and compilation
- **ESBuild**: Backend bundling for production deployment

### UI Component Libraries
- **Radix UI**: Accessible primitive components for complex UI elements
- **Lucide React**: Icon library for consistent iconography
- **TailwindCSS**: Utility-first CSS framework with PostCSS processing

### Data & State Management
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation for type-safe data handling

### Development Experience
- **Hot Module Replacement**: Vite HMR for fast development iteration
- **Error Overlay**: Runtime error modal for development debugging
- **TypeScript Path Mapping**: Organized imports with custom path aliases