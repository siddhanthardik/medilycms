import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminNavbar } from "@/components/admin-navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  BookOpen, 
  FileText, 
  Settings,
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Building,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  CreditCard,
  Eye,
  Download
} from "lucide-react";

export default function ApplicantDetails() {
  const { id } = useParams<{ id: string }>();
  const { adminUser, isLoading: authLoading, isAuthenticated } = useAdminAuth();

  // Fetch single application with full details
  const { data: application, isLoading, error } = useQuery<any>({
    queryKey: [`/api/applications/${id}`],
    enabled: isAuthenticated && !!id,
    retry: false,
  });

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Admin authentication required.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j}>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Not Found</h1>
            <p className="text-gray-600 mb-6">The requested application could not be found.</p>
            <Button onClick={() => window.location.href = '/admin-dashboard'}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleStatusUpdate = async (newStatus: string, notes?: string) => {
    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          status: newStatus,
          reviewNotes: notes || `Application ${newStatus} by ${adminUser?.firstName} ${adminUser?.lastName}`
        })
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        alert(`Failed to ${newStatus} application`);
      }
    } catch (error) {
      alert(`Error updating application status`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/admin-dashboard'}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Badge 
              variant={
                application.status === 'approved' || application.status === 'accepted' ? 'default' :
                application.status === 'pending' ? 'secondary' :
                application.status === 'rejected' ? 'destructive' :
                'outline'
              }
              className="text-base px-3 py-1"
            >
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Application Details
          </h1>
          <p className="text-gray-600">
            Application ID: {application.id}
          </p>
        </div>

        {/* Action Buttons */}
        {application.status === 'pending' && (
          <div className="mb-8 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Review Actions</h3>
                <p className="text-gray-600">Take action on this application</p>
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => handleStatusUpdate('approved')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Application
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    const notes = prompt('Add rejection reason (optional):');
                    handleStatusUpdate('rejected', notes || undefined);
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Application
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Applicant Information */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <User className="h-6 w-6 mr-3 text-blue-600" />
                Applicant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">First Name</label>
                  <p className="text-base text-gray-900 font-medium">
                    {application.user?.firstName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Name</label>
                  <p className="text-base text-gray-900 font-medium">
                    {application.user?.lastName}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  Email Address
                </label>
                <p className="text-base text-gray-900 font-medium">{application.user?.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  Mobile Number
                </label>
                <p className="text-base text-gray-900 font-medium">
                  {application.user?.phoneNumber || 'Not provided'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Medical School</label>
                <p className="text-base text-gray-900">
                  {application.user?.medicalSchool || 'Not specified'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Graduation Year</label>
                <p className="text-base text-gray-900">
                  {application.user?.graduationYear || 'Not specified'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">User ID</label>
                <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                  {application.userId}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Application Submitted
                </label>
                <p className="text-base text-gray-900">
                  {new Date(application.applicationDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Program Information */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <BookOpen className="h-6 w-6 mr-3 text-green-600" />
                Program Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Program Title</label>
                <p className="text-base text-gray-900 font-semibold">
                  {application.program?.title}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <Badge variant="outline" className="mt-1 capitalize">
                    {application.program?.type}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Duration
                  </label>
                  <p className="text-base text-gray-900 font-medium">
                    {application.program?.duration} weeks
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Location
                </label>
                <p className="text-base text-gray-900">
                  {application.program?.city}, {application.program?.country}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  Hospital/Institution
                </label>
                <p className="text-base text-gray-900">{application.program?.hospitalName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Mentor</label>
                <p className="text-base text-gray-900">{application.program?.mentorName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Program Cost
                </label>
                <p className="text-xl text-green-600 font-bold">
                  ${application.program?.cost}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Application Status */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <FileText className="h-6 w-6 mr-3 text-purple-600" />
                Application Status & Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Current Status</label>
                <div className="mt-2">
                  <Badge 
                    variant={
                      application.status === 'approved' || application.status === 'accepted' ? 'default' :
                      application.status === 'pending' ? 'secondary' :
                      application.status === 'rejected' ? 'destructive' :
                      'outline'
                    }
                    className="text-base px-3 py-1"
                  >
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {application.reviewedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Review Date</label>
                  <p className="text-base text-gray-900">
                    {new Date(application.reviewedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}

              {application.reviewedBy && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Reviewed By</label>
                  <p className="text-base text-gray-900">{application.reviewedBy}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">Review Notes</label>
                <div className="mt-2 bg-gray-50 p-4 rounded-lg min-h-[100px]">
                  <p className="text-gray-900">
                    {application.reviewNotes || 'No review notes available'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Settings className="h-6 w-6 mr-3 text-orange-600" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Program ID</label>
                <p className="text-xs text-gray-900 font-mono bg-gray-50 p-2 rounded break-all">
                  {application.programId}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Visa Status</label>
                <p className="text-base text-gray-900">
                  {application.visaStatus || 'Not specified'}
                </p>
              </div>

              {application.joinDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Expected Join Date</label>
                  <p className="text-base text-gray-900">
                    {new Date(application.joinDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Cover Letter</label>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-base text-gray-900">
                      {application.coverLetter ? 'Submitted' : 'Not provided'}
                    </span>
                    {application.coverLetter && (
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">CV/Resume</label>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-base text-gray-900">
                      {application.cvUrl ? 'Submitted' : 'Not provided'}
                    </span>
                    {application.cvUrl && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Additional Documents</label>
                  <p className="text-base text-gray-900">
                    {application.additionalDocuments?.length || 0} files
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-xs text-gray-500">
                  <p>Created: {new Date(application.createdAt).toLocaleString()}</p>
                  <p>Updated: {new Date(application.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}