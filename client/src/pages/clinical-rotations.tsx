import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

export default function ClinicalRotations() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Clinical Rotations</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Access our comprehensive clinical rotation marketplace. Please log in to browse 
            and apply to available programs.
          </p>
          <Button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
            Log In to Browse Rotations
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}