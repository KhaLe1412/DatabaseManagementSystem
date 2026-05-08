import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  Calendar,
  Clock,
  Star,
  Users,
  TrendingUp,
  MapPin,
  Video,
} from "lucide-react";
import { Tutor, Session } from "../types";
import { apiGet } from "../lib/api";
import { AvailabilityTab } from "./tutor/AvailabilityTab";
import { RequestsTab } from "./tutor/RequestsTab";
import { EnhancedTutorProfileTab } from "./tutor/EnhancedTutorProfileTab";
import { LibraryTab } from "./student/LibraryTab";
import { MessagingPanel } from "./MessagingPanel";
import schoolLogo from "figma:asset/5d30621cfc38347904bd973d0c562d26588d6b2f.png";

interface TutorDashboardProps {
  tutor: Tutor;
}

function mapSessionRaw(r: Record<string, unknown>): Session {
  return {
    id: (r.session_id ?? r.id) as string,
    tutorId: (r.tutor_id ?? r.tutorId) as string,
    tutorName: r.tutorName as string | undefined,
    subject: (r.subject ?? "") as string,
    date: (r.date ?? "") as string,
    startTime: (r.start_time ?? r.startTime ?? "") as string,
    endTime: (r.end_time ?? r.endTime ?? "") as string,
    type: (r.type ?? "in-person") as Session["type"],
    status: (r.status ?? "open") as Session["status"],
    location: r.location as string | undefined,
    meetingLink: (r.meeting_link ?? r.meetingLink) as string | undefined,
    notes: r.notes as string | undefined,
    summary: r.summary as string | undefined,
    maxStudents: (r.max_students ?? r.maxStudents ?? 0) as number,
    enrolledStudents: (r.enrolledStudents ?? []) as string[],
    reviews: [],
  };
}

export function TutorDashboard({ tutor }: TutorDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [tutorSessions, setTutorSessions] = useState<Session[]>([]);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});

  const fetchDashboardData = useCallback(async () => {
    try {
      const [sessResp, studResp] = await Promise.all([
        apiGet<{ sessions: Record<string, unknown>[] }>(
          `/sessions?tutorId=${tutor.id}`,
        ),
        apiGet<{ users: { id: string; name: string }[] }>(
          "/users?role=student&limit=200",
        ),
      ]);
      setTutorSessions((sessResp.sessions ?? []).map(mapSessionRaw));
      const nameMap: Record<string, string> = {};
      (studResp.users ?? []).forEach((u) => {
        nameMap[u.id] = u.name;
      });
      setStudentNames(nameMap);
    } catch (err) {
      console.error("Failed to fetch tutor dashboard data:", err);
    }
  }, [tutor.id]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "overview") {
      fetchDashboardData();
    }
  };

  const getStudentDisplayText = (studentIds: string[]) => {
    if (studentIds.length === 0) return "No students enrolled yet";
    const names = studentIds.map((id) => studentNames[id] ?? id);
    if (names.length <= 2) return names.join(", ");
    return `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
  };

  const upcomingSessions = tutorSessions.filter((s) => s.status === "open");
  const completedSessions = tutorSessions.filter(
    (s) => s.status === "completed",
  );
  const uniqueStudents = new Set(
    completedSessions.flatMap((s) => s.enrolledStudents),
  ).size;

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
                <p className="text-gray-600">Tutor Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MessagingPanel userId={tutor.id} userRole="tutor" />
              <div className="text-right">
                <p>{tutor.name}</p>
                <p className="text-sm text-gray-600">{tutor.department}</p>
              </div>
              <Avatar>
                <AvatarImage src={tutor.avatar} />
                <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Total Sessions</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{tutor.totalSessions}</div>
                  <p className="text-xs text-muted-foreground">
                    All-time sessions
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Students Helped</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{uniqueStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    Unique students
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{tutor.rating}</div>
                  <p className="text-xs text-muted-foreground">Out of 5.0</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Upcoming</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{upcomingSessions.length}</div>
                  <p className="text-xs text-muted-foreground">This week</p>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>
                  Your scheduled tutoring sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingSessions.length === 0 ? (
                  <p className="text-gray-500">No upcoming sessions</p>
                ) : (
                  upcomingSessions.map((session) => (
                    <div key={session.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p>{session.subject}</p>
                          <p className="text-sm text-gray-600">
                            {getStudentDisplayText(session.enrolledStudents)}
                          </p>
                        </div>
                        <Badge>{session.type}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{session.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {session.startTime} - {session.endTime}
                          </span>
                        </div>
                        {session.type === "in-person" && session.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{session.location}</span>
                          </div>
                        )}
                        {session.type === "online" && session.meetingLink ? (
                          <div className="flex items-center gap-1">
                            <Video className="h-4 w-4" />
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Join Online
                            </a>
                          </div>
                        ) : session.type === "online" ? (
                          <div className="flex items-center gap-1">
                            <Video className="h-4 w-4" />
                            <span>Online</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability">
            <AvailabilityTab tutor={tutor} />
          </TabsContent>

          <TabsContent value="requests">
            <RequestsTab tutor={tutor} />
          </TabsContent>

          <TabsContent value="library">
            <LibraryTab />
          </TabsContent>

          <TabsContent value="profile">
            <EnhancedTutorProfileTab tutor={tutor} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
