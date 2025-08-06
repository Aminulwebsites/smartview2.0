# SmartView2.0 - Food Delivery Application

## Overview

SmartView2.0 is a modern food delivery web application built with React and Express. The application allows users to browse restaurants, view menus, add items to cart, and place orders. It features a responsive design with a focus on user experience, implementing a complete food ordering workflow from restaurant discovery to order tracking.

## Recent Updates (August 2025)

- **Instagram Deep Linking Enhancement**: Updated footer Instagram links with native app integration
  - Instagram links now open directly in the Instagram app when installed
  - Automatic fallback to web version if app is not available
  - Enhanced user experience with seamless app-to-app navigation
  - Applied to both developer (@vfxgameofficial) and company (@smart_view_restaurat) accounts
- **Admin User Management Enhancement**: Added password display functionality to admin panel
  - User management section now shows actual user passwords for admin visibility
  - Passwords displayed below phone numbers in user information cards
  - Maintains security within admin-only access while providing password visibility for management
- **Food Category Filters**: Added comprehensive category filtering to main website
  - Implemented 6 food categories: Roll, Chawmin, Pokora, Biriyani, Fried Rice, Momo
  - Category filter dropdown works alongside existing search and sort functionality
  - Enhanced user experience with responsive filter design
- **Footer Instagram Links Update**: Updated social media links in website footer
  - Developer section now links to https://www.instagram.com/vfxgameofficial/
  - Company section now links to https://www.instagram.com/smart_view_restaurat/tagged/
  - Removed developer profile image while maintaining Instagram icon links
- **Logo Enhancement**: Made SmartView2.0 logo much bigger throughout the website
  - Doubled logo size from 40px to 80px (h-10 to h-20) 
  - Increased header height to accommodate larger logo (h-16 to h-24)
  - Applied changes to both main website and admin panel headers
- **Render Deployment Fixes**: Resolved API loading issues for production deployment
  - Added automatic database schema initialization during deployment
  - Created production startup script (start-production.sh) for proper database setup
  - Added CORS headers to fix cross-origin API requests
  - Implemented health check endpoint (/api/health) for monitoring
  - Enhanced error handling and logging for production debugging
  - Updated deployment guide with comprehensive troubleshooting section
- **Application Rebranding**: Changed application name from FoodieHub to SmartView2.0
  - Updated all references in documentation, configuration files, and UI components
  - Updated deployment configurations and database names to reflect new branding
- **Project Cleanup**: Previously removed deployment files, now restored for Render hosting
  - Recreated render.yaml configuration for one-click deployment
  - Added comprehensive DEPLOYMENT.md guide with step-by-step instructions
  - Configured proper environment variables and database setup
- Enhanced admin panel with comprehensive order management features
- Added individual order delete functionality with confirmation dialogs
- Implemented website reset functionality to clear all order data
- Enhanced search capabilities across all admin management sections:
  - Order Management: Search by full/partial order ID, customer name, or phone
  - User Management: Search by user ID, name, email, phone, or full name
  - Food Management: Search by food ID, name, category, description, or price
- All admin sections maintain existing filter dropdowns with improved search functionality
- **Deleted User Login Prevention**: When users are deleted from admin panel, they cannot login again:
  - Added `isDeleted` field to users table for soft delete functionality
  - Login attempts by deleted users show "Your account has been deactivated" message
  - Registration attempts with deleted user emails show appropriate error message
  - Existing sessions of deleted users are automatically invalidated
  - Prevents deleted users from accessing the system while preserving data integrity

## Deployment Configuration

- **Platform**: Ready for Render.com deployment
- **Database**: PostgreSQL with Drizzle ORM
- **Build Process**: Vite for frontend, ESBuild for backend
- **Environment**: Production-ready with proper PORT and host configuration
- **Deployment Files**: render.yaml, DEPLOYMENT.md, and comprehensive deployment guide created
- **Local Development**: Optimized for Replit development environment

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The client-side application is built using React with TypeScript, following a component-based architecture:

- **Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **State Management**: React Query for server state management and React Context for global client state (cart)
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture

The server follows a REST API pattern using Express.js:

- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints for restaurants, menu items, and orders
- **Data Layer**: In-memory storage with interface abstraction for future database integration
- **Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error middleware with proper HTTP status codes

### Component Structure

The application uses a modular component structure:

- **UI Components**: Reusable shadcn/ui components in `/components/ui/`
- **Feature Components**: Business logic components like `RestaurantCard`, `MenuItemCard`, `CartSidebar`
- **Page Components**: Route-level components in `/pages/`
- **Layout Components**: Header, Footer, and other layout elements

### Data Storage

Currently implements in-memory storage with a well-defined interface pattern:

- **Storage Interface**: `IStorage` interface defines contracts for data operations
- **Memory Implementation**: `MemStorage` class provides in-memory data persistence
- **Data Models**: Drizzle ORM schemas define data structure and validation
- **Seeded Data**: Application includes sample restaurants and menu items for demonstration

### Cart Management

Shopping cart functionality is implemented using React Context:

- **Cart Provider**: Global state management for cart items
- **Persistent State**: Cart state maintained across navigation
- **Real-time Updates**: Immediate UI updates for add/remove operations
- **Quantity Management**: Support for item quantity adjustments

### Order Processing

Simple order workflow with mock payment processing:

- **Order Creation**: Validated order data with delivery information
- **Payment Methods**: Support for cash, card, and UPI payment options
- **Order Tracking**: Mock order status progression with visual feedback
- **Order History**: Basic order confirmation and tracking display

### Authentication Management

Comprehensive user management system with mandatory login for purchases:

- **User CRUD Operations**: Full create, read, update, delete functionality for user accounts
- **Role-based Access**: Customer and admin role management with appropriate permissions
- **Password Reset**: Admin capability to reset user passwords with temporary password generation
- **Search & Filter**: Advanced user search by name/email and role-based filtering
- **Delete Protection**: Admin users cannot be deleted to maintain system security
- **Confirmation Dialogs**: Secure delete confirmations with detailed user information
- **Audit Trail**: User creation and modification timestamps for accountability
- **Protected Cart Actions**: Users must login/signup before adding items to cart or proceeding to checkout
- **Authentication Modal**: Integrated login/signup modal triggered when unauthenticated users attempt cart operations
- **Profile Picture Management**: Users can upload and update profile pictures with image preview
- **Profile Editing**: Full profile editing functionality including name, phone, and profile picture updates
- **Logout Functionality**: Secure logout with session cleanup and user feedback

### Admin Panel Architecture

Dedicated administrative interface separate from the main website:

- **Admin Layout**: Custom AdminLayout component with dark header and distinct styling
- **Admin Header**: Specialized header with inverted logo, user info display, and admin-specific navigation
- **Separation of Concerns**: Admin panel completely separated from customer-facing website
- **Clean Customer Interface**: Removed cart, login, and register buttons from main website header for streamlined design
- **Professional Admin Design**: Dark gray header with white text for professional administrative appearance
- **User Context Display**: Admin header shows current user name, role, and logout functionality
- **Profile Picture Display**: Admin user management shows profile pictures with role-based badge overlays
- **Avatar System**: Consistent avatar display throughout admin interface with fallback initials
- **Admin Authentication**: Separate authentication system with hardcoded credentials (username: javascript, password: javascript)
- **Session Management**: Uses sessionStorage for admin authentication state with logout functionality
- **Access Control**: Admin panel is protected and requires authentication before access
- **Food Image Upload**: Direct file upload functionality for food items instead of URL-based images

## External Dependencies

### Database

- **Drizzle ORM**: Database ORM with PostgreSQL dialect configuration
- **Neon Database**: Serverless PostgreSQL database service
- **Schema Management**: Drizzle migrations for database schema versioning

### UI Components

- **shadcn/ui**: Pre-built accessible component library
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library for consistent iconography

### Development Tools

- **TypeScript**: Static type checking throughout the application
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration
- **Replit Integration**: Development environment optimization for Replit platform

### Third-party Services

- **Unsplash**: Image hosting for restaurant and food item photos
- **React Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Date-fns**: Date manipulation utilities

The application is designed with extensibility in mind, particularly around the data storage layer which can be easily swapped from in-memory to a persistent database solution. The component architecture promotes reusability and maintainability, while the API design follows REST principles for predictable endpoint behavior.