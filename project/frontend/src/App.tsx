import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { UserRole, Student, Tutor, Admin } from "./types";
import { mockStudents, mockTutors, mockAdmins } from "./lib/mock-data";
import { StudentDashboard } from "./components/StudentDashboard";
import { TutorDashboard } from "./components/TutorDashboard";
import { AcademicAffairsDashboard } from "./components/AcademicAffairsDashboard";
import { StudentAffairsDashboard } from "./components/StudentAffairsDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { LoginPage } from "./components/LoginPage";
import { Toaster } from "./components/ui/sonner";
import { Users, GraduationCap, BarChart, Award, Shield } from "lucide-react";
import schoolLogo from "figma:asset/5d30621cfc38347904bd973d0c562d26588d6b2f.png";
import { apiGet } from "./lib/api";

export default function App() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // State để lưu data từ API
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentTutor, setCurrentTutor] = useState<Tutor | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (role: UserRole, userId: string) => {
    setSelectedRole(role);
    setSelectedUserId(userId);
    setIsLoggedIn(true);
  };

  const handleRoleSelect = (role: UserRole, userId?: string) => {
    setSelectedRole(role);
    if (userId) {
      setSelectedUserId(userId);
    } else if (role === "student") {
      setSelectedUserId(mockStudents[0].id);
    } else if (role === "tutor") {
      setSelectedUserId(mockTutors[0].id);
    } else if (role === "admin") {
      setSelectedUserId(mockAdmins[0].id);
    }
  };

  const handleLogout = () => {
    setSelectedRole(null);
    setSelectedUserId(null);
    setIsLoggedIn(false);
    setCurrentStudent(null);
    setCurrentTutor(null);
    setCurrentAdmin(null);
  };

  // Function để fetch user data từ API
  const fetchUserData = async () => {
    if (!selectedUserId || !selectedRole) return;

    setIsLoading(true);
    try {
      if (selectedRole === "student") {
        const raw = await apiGet<Record<string, unknown>>(
          `/users/${selectedUserId}`,
        );
        setCurrentStudent({
          id: selectedUserId,
          name: (raw.name as string) ?? "",
          email: (raw.email as string) ?? "",
          role: "student",
          avatar: raw.avatar as string | undefined,
          studentId: (raw.studentId as string) ?? "",
          department: (raw.department as string) ?? "",
          year: (raw.year as number) ?? 1,
          gpa: (raw.gpa as number) ?? 0,
          supportNeeds: (raw.supportNeeds as string[]) ?? [],
        });
      } else if (selectedRole === "tutor") {
        const raw = await apiGet<Record<string, unknown>>(
          `/users/${selectedUserId}`,
        );
        setCurrentTutor({
          id: selectedUserId,
          name: (raw.name as string) ?? "",
          email: (raw.email as string) ?? "",
          role: "tutor",
          avatar: raw.avatar as string | undefined,
          tutorId: (raw.tutorId as string) ?? "",
          department: (raw.department as string) ?? "",
          expertise: (raw.expertise as string[]) ?? [],
          rating: (raw.rating as number) ?? 0,
          totalSessions: (raw.totalSessions as number) ?? 0,
        });
      } else if (selectedRole === "admin") {
        // Admin vẫn dùng mock data vì chưa có API endpoint
        const admin = mockAdmins.find((a) => a.id === selectedUserId);
        if (admin) {
          setCurrentAdmin(admin);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Fallback to mock data nếu API fail
      if (selectedRole === "student") {
        const student = mockStudents.find((s) => s.id === selectedUserId);
        if (student) setCurrentStudent(student);
      } else if (selectedRole === "tutor") {
        const tutor = mockTutors.find((t) => t.id === selectedUserId);
        if (tutor) setCurrentTutor(tutor);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user data từ API khi selectedUserId thay đổi
  useEffect(() => {
    fetchUserData();
  }, [selectedUserId, selectedRole]);

  // Listen for profile update events để refresh data
  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchUserData();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, [selectedUserId, selectedRole]);

  // Show login page first if not logged in
  if (!isLoggedIn) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  // Render based on selected role
  if (selectedRole === "student" && selectedUserId) {
    if (isLoading) {
      return (
        <>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          </div>
          <Toaster />
        </>
      );
    }

    if (currentStudent) {
      return (
        <>
          <StudentDashboard student={currentStudent} />
          <div className="fixed bottom-4 right-4">
            <Button onClick={handleLogout} variant="outline">
              Đăng xuất
            </Button>
          </div>
          <Toaster />
        </>
      );
    }
  }

  if (selectedRole === "tutor" && selectedUserId) {
    if (isLoading) {
      return (
        <>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          </div>
          <Toaster />
        </>
      );
    }

    if (currentTutor) {
      return (
        <>
          <TutorDashboard tutor={currentTutor} />
          <div className="fixed bottom-4 right-4">
            <Button onClick={handleLogout} variant="outline">
              Đăng xuất
            </Button>
          </div>
          <Toaster />
        </>
      );
    }
  }

  if (selectedRole === "academic-affairs") {
    return (
      <>
        <AcademicAffairsDashboard />
        <div className="fixed bottom-4 right-4">
          <Button onClick={handleLogout} variant="outline">
            Đăng xuất
          </Button>
        </div>
        <Toaster />
      </>
    );
  }

  if (selectedRole === "student-affairs") {
    return (
      <>
        <StudentAffairsDashboard />
        <div className="fixed bottom-4 right-4">
          <Button onClick={handleLogout} variant="outline">
            Đăng xuất
          </Button>
        </div>
        <Toaster />
      </>
    );
  }

  if (selectedRole === "admin" && selectedUserId) {
    if (isLoading) {
      return (
        <>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          </div>
          <Toaster />
        </>
      );
    }

    if (currentAdmin) {
      return (
        <>
          <AdminDashboard admin={currentAdmin} />
          <div className="fixed bottom-4 right-4">
            <Button onClick={handleLogout} variant="outline">
              Đăng xuất
            </Button>
          </div>
          <Toaster />
        </>
      );
    }
  }

  // Landing page - role selection
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Toaster />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img
              src={schoolLogo}
              alt="BK TP.HCM Logo"
              className="h-24 w-24 object-contain"
            />
          </div>
          <h1 className="mb-4">HCMUT Tutoring Management System</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive platform for managing tutor-student relationships,
            scheduling sessions, tracking progress, and optimizing academic
            support resources
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="mb-12">
          <h2 className="text-center mb-8">Select Your Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Student Card */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-fit">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Student</CardTitle>
                <CardDescription>
                  Find tutors, schedule sessions, access resources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600 mb-4">Demo accounts:</p>
                {mockStudents.map((student) => (
                  <Button
                    key={student.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleRoleSelect("student", student.id)}
                  >
                    <div className="text-left">
                      <div>{student.name}</div>
                      <div className="text-xs text-gray-500">
                        {student.department}
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Tutor Card */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-500">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-fit">
                  <GraduationCap className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Tutor</CardTitle>
                <CardDescription>
                  Manage availability, conduct sessions, track progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600 mb-4">Demo accounts:</p>
                {mockTutors.map((tutor) => (
                  <Button
                    key={tutor.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleRoleSelect("tutor", tutor.id)}
                  >
                    <div className="text-left">
                      <div>{tutor.name}</div>
                      <div className="text-xs text-gray-500">
                        {tutor.department}
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Academic Affairs Card */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-500">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-purple-100 rounded-full w-fit">
                  <BarChart className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Academic Affairs</CardTitle>
                <CardDescription>
                  Analytics, reports, resource optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => handleRoleSelect("academic-affairs")}
                >
                  Access Dashboard
                </Button>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Course Analysis</span>
                    <Badge variant="secondary">Available</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Resource Allocation</span>
                    <Badge variant="secondary">Available</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Affairs Card */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-orange-500">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-orange-100 rounded-full w-fit">
                  <Award className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle>Student Affairs</CardTitle>
                <CardDescription>
                  Credits, scholarships, participation tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => handleRoleSelect("student-affairs")}
                >
                  Access Dashboard
                </Button>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Training Credits</span>
                    <Badge variant="secondary">245 awarded</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Scholarships</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      2 eligible
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Card */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-red-500">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-red-100 rounded-full w-fit">
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle>Administrator</CardTitle>
                <CardDescription>
                  Manage accounts, system configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600 mb-4">Demo account:</p>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleRoleSelect("admin", mockAdmins[0].id)}
                >
                  <div className="text-left">
                    <div>{mockAdmins[0].name}</div>
                    <div className="text-xs text-gray-500">
                      System Administrator
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Overview */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle>System Features</CardTitle>
            <CardDescription>
              Comprehensive tutoring management solution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="mb-3">For Students</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Search and select tutors by expertise</li>
                  <li>• Automated tutor matching</li>
                  <li>• Session scheduling & management</li>
                  <li>• In-person and online sessions</li>
                  <li>• Feedback and ratings</li>
                  <li>• HCMUT Library integration</li>
                  <li>• Track training credits</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3">For Tutors</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Set availability schedules</li>
                  <li>• Manage session bookings</li>
                  <li>• Record student progress</li>
                  <li>• Track session history</li>
                  <li>• Automatic notifications</li>
                  <li>• Performance analytics</li>
                  <li>• Resource sharing</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3">For Administration</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Course performance analysis</li>
                  <li>• Resource allocation optimization</li>
                  <li>• Training credit management</li>
                  <li>• Scholarship eligibility tracking</li>
                  <li>• Comprehensive reporting</li>
                  <li>• Participation monitoring</li>
                  <li>• Data export capabilities</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Library Integration Note */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="mb-2">HCMUT Library Integration</p>
                <p className="text-sm text-gray-600">
                  This system connects with the university's central library
                  database, enabling students and tutors to access textbooks,
                  documents, and learning resources synchronized with the
                  official HCMUT_LIBRARY system.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
