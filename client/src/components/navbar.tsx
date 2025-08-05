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
    ...((user as any)?.isAdmin && (user as any)?.adminRole ? [{ href: "/admin", label: "Admin Panel", active: location === "/admin" }] : []),
  ];

  // Show clinical rotation navigation for all logged-in users
  const navItems = isAuthenticated ? clinicalRotationNavItems : primaryNavItems;

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity">
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
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 transform hover:scale-105 hover:shadow-md border-2 ${
                    item.active
                      ? "text-primary border-primary bg-blue-50"
                      : "text-gray-700 border-transparent hover:text-primary hover:border-primary hover:bg-blue-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Auth Buttons for Non-Authenticated Users */}
            {!isAuthenticated && (
              <div className="hidden md:flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = "/api/login"}
                  className="hover:scale-105 transition-transform duration-200"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button 
                  size="sm"
                  onClick={() => window.location.href = "/api/login"}
                  className="hover:scale-105 transition-transform duration-200"
                >
                  Get Started
                </Button>
              </div>
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

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 border-2 ${
                    item.active
                      ? "text-primary bg-blue-50 border-primary"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-transparent hover:border-gray-300"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
