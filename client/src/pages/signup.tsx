import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, GraduationCap, Stethoscope, Shield, Mail, Lock, User, Phone, Building2, FileText, School, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

// Country codes data
const countryCodes = [
  { code: "+1", country: "USA", flag: "🇺🇸" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+7", country: "Russia", flag: "🇷🇺" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+46", country: "Sweden", flag: "🇸🇪" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+64", country: "New Zealand", flag: "🇳🇿" },
];

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["admin", "preceptor", "student"], {
    required_error: "Please select a role",
  }),
  countryCode: z.string().default("+1"),
  phoneNumber: z.string().optional(),
  medicalSchool: z.string().optional(),
  hospitalAffiliation: z.string().optional(),
  medicalLicenseNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [defaultCountryCode, setDefaultCountryCode] = useState("+1");

  // Detect user's country based on timezone or IP (simplified version)
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes("Asia/Kolkata") || timezone.includes("India")) {
      setDefaultCountryCode("+91");
    } else if (timezone.includes("Europe/London")) {
      setDefaultCountryCode("+44");
    } else if (timezone.includes("Asia/Shanghai") || timezone.includes("China")) {
      setDefaultCountryCode("+86");
    }
    // Default to USA for other cases
  }, []);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      role: undefined,
      countryCode: defaultCountryCode,
      phoneNumber: "",
      medicalSchool: "",
      hospitalAffiliation: "",
      medicalLicenseNumber: "",
    },
  });

  useEffect(() => {
    form.setValue("countryCode", defaultCountryCode);
  }, [defaultCountryCode, form]);

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      // Combine country code and phone number
      const fullPhoneNumber = data.phoneNumber ? `${data.countryCode} ${data.phoneNumber}` : "";
      
      const payload = {
        ...data,
        phoneNumber: fullPhoneNumber,
      };
      
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create account");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Account created successfully! Redirecting to your dashboard...",
      });
      
      // Redirect based on role
      setTimeout(() => {
        switch (data.user.role) {
          case "admin":
            setLocation("/admin-dashboard");
            break;
          case "preceptor":
            setLocation("/preceptor-dashboard");
            break;
          case "student":
            setLocation("/student-dashboard");
            break;
          default:
            setLocation("/");
        }
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignupFormData) => {
    signupMutation.mutate(data);
  };

  const roleIcons = {
    admin: <Shield className="w-5 h-5" />,
    preceptor: <Stethoscope className="w-5 h-5" />,
    student: <GraduationCap className="w-5 h-5" />,
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Home button */}
      <Link href="/">
        <Button 
          variant="outline" 
          className="absolute top-4 left-4 z-20 bg-white/90 hover:bg-white"
        >
          ← Back to Home
        </Button>
      </Link>
      
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgLz48L3N2Zz4=')] opacity-20"></div>
      </div>

      {/* Floating shapes animation */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -50, 50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl z-10"
      >
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <div className="p-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="inline-flex items-center justify-center mb-4"
              >
                <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white text-4xl font-bold px-4 py-2 rounded-lg shadow-lg">
                  MEDILY
                </div>
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
              <p className="text-white/80">Join the medical rotation marketplace</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Role Selection */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Select Your Role</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedRole(value);
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white/20 border-white/30 text-white placeholder:text-white/60">
                            <SelectValue placeholder="Choose your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="student">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-4 h-4" />
                              Student/Trainee
                            </div>
                          </SelectItem>
                          <SelectItem value="preceptor">
                            <div className="flex items-center gap-2">
                              <Stethoscope className="w-4 h-4" />
                              Preceptor
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Admin
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">First Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                            <Input 
                              {...field} 
                              className="bg-white/20 border-white/30 text-white placeholder:text-white/60 pl-10"
                              placeholder="John"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Last Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                            <Input 
                              {...field} 
                              className="bg-white/20 border-white/30 text-white placeholder:text-white/60 pl-10"
                              placeholder="Doe"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                          <Input 
                            {...field} 
                            type="email"
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/60 pl-10"
                            placeholder="john.doe@example.com"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Number with Country Code */}
                <div className="space-y-2">
                  <FormLabel className="text-white">Phone Number (Optional)</FormLabel>
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="countryCode"
                      render={({ field }) => (
                        <FormItem className="w-32">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/20 border-white/30 text-white">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {countryCodes.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                  <div className="flex items-center gap-2">
                                    <span>{country.flag}</span>
                                    <span>{country.code}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                              <Input 
                                {...field} 
                                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 pl-10"
                                placeholder="000-000-0000"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Role-specific fields */}
                {selectedRole === "student" && (
                  <FormField
                    control={form.control}
                    name="medicalSchool"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Medical School</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                            <Input 
                              {...field} 
                              className="bg-white/20 border-white/30 text-white placeholder:text-white/60 pl-10"
                              placeholder="Enter your medical school"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedRole === "preceptor" && (
                  <>
                    <FormField
                      control={form.control}
                      name="hospitalAffiliation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Hospital Affiliation</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                              <Input 
                                {...field} 
                                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 pl-10"
                                placeholder="Enter your hospital"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="medicalLicenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Medical License Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                              <Input 
                                {...field} 
                                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 pl-10"
                                placeholder="Enter license number"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Password Fields */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                          <Input 
                            {...field} 
                            type={showPassword ? "text" : "password"}
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/60 pl-10 pr-10"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                          <Input 
                            {...field} 
                            type={showConfirmPassword ? "text" : "password"}
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/60 pl-10 pr-10"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold py-6 text-lg shadow-lg transform transition hover:scale-105"
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-5 w-5" />
                      Create Account
                    </>
                  )}
                </Button>

                {/* Sign In Link */}
                <p className="text-center text-white/80">
                  Already have an account?{" "}
                  <Link href="/login" className="text-white font-semibold hover:underline">
                    Sign In
                  </Link>
                </p>
              </form>
            </Form>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}