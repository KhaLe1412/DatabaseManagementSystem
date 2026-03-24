import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Star,
  BookOpen,
  Search,
  User,
} from "lucide-react";
import {
  mockTutors,
  mockSessions,
  mockLibraryResources,
} from "../lib/mock-data";
import { EnhancedMySessionsTab } from "./student/EnhancedMySessionsTab";
import { LibraryTab } from "./student/LibraryTab";
import { EnhancedProfileTab } from "./student/EnhancedProfileTab";
import { JoinTab } from "./student/JoinTab";
import { MessagingPanel } from "./MessagingPanel";
import { Student, Session } from "../types";
import { apiGet } from "../lib/api";
import schoolLogo from "figma:asset/5d30621cfc38347904bd973d0c562d26588d6b2f.png";

interface StudentDashboardProps {
  student: Student;
}

export function StudentDashboard({ student }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const [sessions, setSessions] = useState<Session[]>([]);

  const fetchSessions = async () => {
    try {
      const data = await apiGet<any[]>("/sessions");
      setSessions(data.map((item) => item.session));
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [student.id]);

  const upcomingSessions = mockSessions.filter(
    (s) => s.enrolledStudents.includes(student.id) && s.status === "open",
  );

  const completedSessions = mockSessions.filter(
    (s) => s.enrolledStudents.includes(student.id) && s.status === "completed",
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={schoolLogo}
                alt="BK TP.HCM Logo"
                className="h-12 w-12 object-contain"
              />
              <div>
                <h1>HCMUT Tutoring System</h1>
                <p className="text-gray-600">Student Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MessagingPanel userId={student.id} userRole="student" />
              <div className="text-right">
                <p>{student.name}</p>
                <p className="text-sm text-gray-600">{student.studentId}</p>
              </div>
              <Avatar>
                <AvatarImage src={student.avatar} />
                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="join">Join</TabsTrigger>
            <TabsTrigger value="sessions">My Sessions</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl">{upcomingSessions.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Completed Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl">{completedSessions.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Current GPA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl">{student.gpa.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Next Sessions</CardTitle>
                <CardDescription>
                  Your scheduled tutoring sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingSessions.length === 0 ? (
                  <p className="text-gray-500">No upcoming sessions</p>
                ) : (
                  upcomingSessions.map((session) => {
                    const tutor = mockTutors.find(
                      (t) => t.id === session.tutorId,
                    );
                    return (
                      <div
                        key={session.id}
                        className="flex items-start gap-4 p-4 border rounded-lg"
                      >
                        <Avatar>
                          <AvatarImage src={tutor?.avatar} />
                          <AvatarFallback>
                            {tutor?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p>{session.subject}</p>
                              <p className="text-sm text-gray-600">
                                with {tutor?.name}
                              </p>
                            </div>
                            <Badge>{session.type}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {session.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {session.startTime} - {session.endTime}
                            </div>
                            {session.type === "in-person" &&
                              session.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {session.location}
                                </div>
                              )}
                            {session.type === "online" &&
                              session.meetingLink && (
                                <div className="flex items-center gap-1">
                                  <Video className="h-4 w-4" />
                                  Online Meeting
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Support Needs */}
            <Card>
              <CardHeader>
                <CardTitle>Your Support Needs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {student.supportNeeds.map((need) => (
                    <Badge key={need} variant="secondary">
                      {need}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="join">
            <JoinTab
              student={student}
              sessions={sessions}
              onJoinSuccess={fetchSessions}
            />
          </TabsContent>

          <TabsContent value="sessions">
            <EnhancedMySessionsTab student={student} />
          </TabsContent>

          <TabsContent value="library">
            <LibraryTab />
          </TabsContent>

          <TabsContent value="profile">
            <EnhancedProfileTab student={student} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
