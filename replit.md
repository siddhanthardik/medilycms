# MEDILY - Clinical Rotation Marketplace

## Overview
MEDILY is a full-stack web application designed as a clinical rotation marketplace. It connects healthcare professionals with short-term clinical experiences like observerships, hands-on training, fellowships, and clerkships. The platform aims to provide a comprehensive solution for browsing, filtering, and applying to medical rotations, complemented by administrative tools for program management. Its vision is to simplify access to valuable clinical experiences and streamline the management of such programs within the medical field.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript.
- **Routing**: Wouter.
- **State Management**: TanStack Query (React Query) for server state management and caching.
- **UI Framework**: Shadcn/ui with Radix UI primitives.
- **Styling**: Tailwind CSS with CSS variables.
- **Build Tool**: Vite.

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript.
- **API Design**: RESTful API.
- **Authentication**: OpenID Connect (OIDC) with Passport.js.
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple.

### Database Layer
- **Database**: PostgreSQL.
- **ORM**: Drizzle ORM.
- **Schema Management**: Drizzle Kit for migrations.
- **Connection**: Neon serverless PostgreSQL with connection pooling.

### Key Data Models
- Users, Programs, Applications, Specialties, Reviews, Favorites.

### Authentication & Authorization
- **Provider**: Replit OIDC integration.
- **Session Storage**: PostgreSQL-backed sessions.
- **Role-Based Access**: Differentiated permissions for users, sub-admins, and super-admins.
- **Security**: Secure session management with HTTP-only cookies.

### UI/UX Design
- **Design System**: Shadcn/ui.
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints.
- **Accessibility**: ARIA-compliant components from Radix UI.
- **Theme Support**: CSS custom properties for light/dark mode.
- **Medical Theme**: Custom color palette.
- **CMS Editor**: WordPress-style full-page DOM editing with inline visual editing.
- **Blog Editor**: Smooth contentEditable implementation with proper LTR typing, no cursor jumping, and rich text formatting tools.

### Features
- Multi-faceted search and filtering for clinical rotations.
- Comprehensive application management with status tracking and waitlist system.
- Notification system for user feedback.
- Universal Image Upload System supporting local files, Google Drive URLs, and public links.
- Full-featured Blog Management System with rich text editing, SEO optimization, and image uploads.
- Public blog page with search, filtering, and category browsing.

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database.
- **Authentication**: Replit OIDC service.
- **Session Storage**: PostgreSQL.

### Development & Build Tools
- **Package Manager**: npm.
- **Build System**: Vite.
- **TypeScript**: Full-stack type checking.
- **ESBuild**: Backend bundling.

### UI Component Libraries
- **Radix UI**: Accessible primitive components.
- **Lucide React**: Icon library.
- **TailwindCSS**: Utility-first CSS framework.

### Data & State Management
- **TanStack Query**: Server state management.
- **React Hook Form**: Form handling with validation.
- **Zod**: Schema validation.