import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, ChevronDown, Menu, X, User as UserIcon } from "lucide-react";
import medilyLogoSrc from "@assets/medily-website-logo_1754424305557.jpg";

export function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  // Primary navigation items that appear on all pages except when user accesses clinical rotations and authenticates
  const primaryNavItems = [
    { href: "/", label: "Home", active: location === "/" },
    { href: "/about", label: "About us", active: location === "/about" },
    { href: "/courses", label: "Courses", active: location === "/courses" },
    { href: "/clinical-rotations", label: "Clinical Rotations", active: location === "/clinical-rotations" },
    { href: "/join", label: "Jobs", active: location === "/join" },
    { href: "/blog", label: "Blog", active: location === "/blog" },
    { href: "/contact", label: "Contact us", active: location === "/contact" },
  ];

  // Clinical rotation navigation items (when user is logged in)
  const clinicalRotationNavItems = [
    { href: "/", label: "Browse Rotations", active: location === "/" },
    { href: "/dashboard", label: "My Applications", active: location === "/dashboard" },
    { href: "/clinical-rotations", label: "All Programs", active: location === "/clinical-rotations" },
    { href: "/favorites", label: "Favorites", active: location === "/favorites" },
    { href: "/reviews", label: "My Reviews", active: location === "/reviews" },
    // Only show admin panel for authorized Medily representatives (users with adminRole)
    ...((user as any)?.isAdmin && (user as any)?.adminRole ? [
      { href: "/admin", label: "Admin Panel", active: location === "/admin" },
      { href: "/cms-dashboard", label: "CMS Dashboard", active: location === "/cms-dashboard" },
      { href: "/user-management", label: "User Management", active: location === "/user-management" }
    ] : []),
  ];

  // Always show the same navigation design - use primaryNavItems for consistent styling
  // But add additional items for authenticated users
  const additionalAuthItems = isAuthenticated ? [
    { href: "/dashboard", label: "My Applications", active: location === "/dashboard" },
    { href: "/favorites", label: "Favorites", active: location === "/favorites" },
    { href: "/reviews", label: "My Reviews", active: location === "/reviews" },
  ] : [];
  
  const navItems = [...primaryNavItems, ...additionalAuthItems];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center logo-hover">
              <img 
                src={medilyLogoSrc} 
                alt="Medily" 
                className="h-8 w-auto mr-2"
              />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-10 md:flex md:space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`navbar-item nav-item-hover px-4 py-2 text-sm font-bold rounded-md ${
                    item.active
                      ? "text-blue-600 bg-blue-50"
                      : "text-black hover:bg-blue-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Sign In and Sign Up buttons when not authenticated */}
            {!isAuthenticated && (
              <>
                <Link href="/login">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hidden md:flex border-blue-600 text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all duration-200"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button 
                    size="sm" 
                    className="hidden md:flex bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 transition-all duration-200"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:scale-105 transition-transform duration-200">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
            )}

            {/* User Menu */}
            {isAuthenticated && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary hover:scale-105 transition-transform duration-200">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={(user as any).profileImageUrl} 
                        alt={`${(user as any).firstName} ${(user as any).lastName}`}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {((user as any).firstName?.[0] || '') + ((user as any).lastName?.[0] || '')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-gray-700">
                      {(user as any).firstName} {(user as any).lastName}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="w-full">
                      My Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full">
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  {(user as any).isAdmin && (user as any).adminRole && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="w-full">
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/cms" className="w-full">
                          Content Management
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile menu button - fixed clickability */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-black hover:text-black hover:bg-blue-50 transition-all duration-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - enhanced functionality */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`navbar-item nav-item-hover block px-3 py-2 rounded-md text-base font-bold transition-colors duration-200 ${
                    item.active
                      ? "text-blue-600 bg-blue-50"
                      : "text-black hover:bg-blue-50 hover:text-blue-600"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    // Use native navigation for proper routing
                    window.location.href = item.href;
                  }}
                >
                  {item.label}
                </a>
              ))}
              
              {/* Mobile Sign In and Sign Up buttons when not authenticated */}
              {!isAuthenticated && (
                <div className="border-t border-gray-200 pt-2 mt-2 space-y-2">
                  <Link href="/login">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button 
                      size="sm" 
                      className="w-full bg-blue-600 text-white hover:bg-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
              
              {/* Mobile user actions */}
              {isAuthenticated && user && (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <a
                    href="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-black hover:bg-blue-50 hover:text-blue-600"
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      window.location.href = "/dashboard";
                    }}
                  >
                    My Dashboard
                  </a>
                  <a
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-black hover:bg-blue-50 hover:text-blue-600"
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      window.location.href = "/profile";
                    }}
                  >
                    Profile Settings
                  </a>
                  {(user as any).isAdmin && (user as any).adminRole && (
                    <>
                      <a
                        href="/admin"
                        className="block px-3 py-2 rounded-md text-base font-medium text-black hover:bg-blue-50 hover:text-blue-600"
                        onClick={(e) => {
                          e.preventDefault();
                          setMobileMenuOpen(false);
                          window.location.href = "/admin";
                        }}
                      >
                        Admin Dashboard
                      </a>
                      <a
                        href="/cms-editor"
                        className="block px-3 py-2 rounded-md text-base font-medium text-black hover:bg-blue-50 hover:text-blue-600"
                        onClick={(e) => {
                          e.preventDefault();
                          setMobileMenuOpen(false);
                          window.location.href = "/cms-editor";
                        }}
                      >
                        Content Management
                      </a>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    Log Out
                  </button>
                </div>
              )}
              
              {!isAuthenticated && (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <a
                    href="/api/login"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 text-center"
                  >
                    Sign In
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
