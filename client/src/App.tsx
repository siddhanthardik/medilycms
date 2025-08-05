import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import AdminDashboard from "@/pages/admin-dashboard";
import UserDashboard from "@/pages/user-dashboard";
import ProgramDetail from "@/pages/program-detail";
import AddProgram from "@/pages/add-program";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Courses from "@/pages/courses";
import Blog from "@/pages/blog";
import Join from "@/pages/join";
import ClinicalRotations from "@/pages/clinical-rotations";
import CMSDashboard from "@/pages/cms-dashboard";
import AdminLogin from "@/pages/admin-login";
import UserManagement from "@/pages/user-management";
import Favorites from "@/pages/favorites";
import Reviews from "@/pages/reviews";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes accessible without authentication */}
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/courses" component={Courses} />
      <Route path="/blog" component={Blog} />
      <Route path="/join" component={Join} />
      <Route path="/clinical-rotations" component={ClinicalRotations} />
      <Route path="/admin-login" component={AdminLogin} />
      
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/add-program" component={AddProgram} />
          <Route path="/dashboard" component={UserDashboard} />
          <Route path="/program/:id" component={ProgramDetail} />
          <Route path="/cms-dashboard" component={CMSDashboard} />
          <Route path="/user-management" component={UserManagement} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/reviews" component={Reviews} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
