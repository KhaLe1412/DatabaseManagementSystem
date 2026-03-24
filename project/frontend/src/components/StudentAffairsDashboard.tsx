import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Award,
  TrendingUp,
  Users,
  Trophy,
  Download,
  Search,
} from "lucide-react";
import { mockStudents, mockSessions } from "../lib/mock-data";
import { useState } from "react";
import { toast } from "sonner@2.0.3";
import schoolLogo from "figma:asset/5d30621cfc38347904bd973d0c562d26588d6b2f.png";

export function StudentAffairsDashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for student achievements
  const studentAchievements = mockStudents.map((student) => {
    const studentSessions = mockSessions.filter(
      (s) => s.enrolledStudents.includes(student.id),
    );
    const completedSessions = studentSessions.filter(
      (s) => s.status === "completed",
    ).length;
    const trainingCredits = completedSessions * 1.5; // Mock credits calculation
    const participationScore = Math.min(
      100,
      completedSessions * 8,
    );

    return {
      ...student,
      completedSessions,
      trainingCredits,
      participationScore,
      scholarshipEligible: trainingCredits >= 15,
    };
  });

  const filteredStudents = studentAchievements.filter(
    (student) =>
      student.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      student.studentId.includes(searchQuery),
  );

  const handleExportData = () => {
    toast.success("Student data exported successfully");
  };

  const handleAwardCredits = (
    studentId: string,
    studentName: string,
  ) => {
    toast.success(`Training credits awarded to ${studentName}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <img
              src={schoolLogo}
              alt="BK TP.HCM Logo"
              className="h-12 w-12 object-contain"
            />
            <div>
              <h1>HCMUT Tutoring System</h1>
              <p className="text-gray-600">
                Office of Student Affairs - Student Development
                Portal
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="credits">
              Training Credits
            </TabsTrigger>
            <TabsTrigger value="scholarships">
              Scholarships
            </TabsTrigger>
            <TabsTrigger value="participation">
              Participation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">
                    Active Participants
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">
                    {mockStudents.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enrolled students
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">
                    Total Credits Awarded
                  </CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">245</div>
                  <p className="text-xs text-muted-foreground">
                    Training credits
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">
                    Scholarship Eligible
                  </CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">
                    {
                      studentAchievements.filter(
                        (s) => s.scholarshipEligible,
                      ).length
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Students qualified
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">
                    Avg Participation
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">78%</div>
                  <p className="text-xs text-muted-foreground">
                    Engagement rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>
                  Students with exceptional participation and
                  improvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentAchievements
                    .sort(
                      (a, b) =>
                        b.trainingCredits - a.trainingCredits,
                    )
                    .slice(0, 5)
                    .map((student, index) => (
                      <div
                        key={student.id}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                          <span>#{index + 1}</span>
                        </div>
                        <Avatar>
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback>
                            {student.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p>{student.name}</p>
                          <p className="text-sm text-gray-600">
                            {student.studentId} •{" "}
                            {student.department}
                          </p>
                        </div>
                        <div className="text-right">
                          <p>
                            {student.trainingCredits} Credits
                          </p>
                          <p className="text-sm text-gray-600">
                            {student.completedSessions} Sessions
                          </p>
                        </div>
                        {student.scholarshipEligible && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Trophy className="h-3 w-3 mr-1" />
                            Scholarship Eligible
                          </Badge>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credits" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      Training Credits Management
                    </CardTitle>
                    <CardDescription>
                      Award and track student training credits
                    </CardDescription>
                  </div>
                  <Button onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    className="pl-10"
                  />
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={student.avatar}
                              />
                              <AvatarFallback>
                                {student.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{student.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {student.studentId}
                        </TableCell>
                        <TableCell>
                          {student.department}
                        </TableCell>
                        <TableCell>
                          {student.completedSessions}
                        </TableCell>
                        <TableCell>
                          {student.trainingCredits.toFixed(1)}
                        </TableCell>
                        <TableCell>
                          {student.scholarshipEligible ? (
                            <Badge className="bg-green-100 text-green-800">
                              Qualified
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              In Progress
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleAwardCredits(
                                student.id,
                                student.name,
                              )
                            }
                          >
                            Award Credits
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="py-6">
                <p className="mb-2">
                  Credit Calculation Policy
                </p>
                <p className="text-sm text-gray-600">
                  Students earn 1.5 training credits per
                  completed tutoring session. A minimum of 20
                  credits per semester is required for official
                  recognition and certificate of participation.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="scholarships"
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  Scholarship Eligibility Assessment
                </CardTitle>
                <CardDescription>
                  Students qualifying for academic support
                  scholarships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentAchievements
                    .filter((s) => s.scholarshipEligible)
                    .map((student) => (
                      <Card key={student.id}>
                        <CardHeader>
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={student.avatar}
                              />
                              <AvatarFallback>
                                {student.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <CardTitle className="text-base">
                                {student.name}
                              </CardTitle>
                              <CardDescription>
                                {student.studentId} •{" "}
                                {student.department}
                              </CardDescription>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Trophy className="h-3 w-3 mr-1" />
                              Eligible
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">
                                Current GPA
                              </p>
                              <p>{student.gpa.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Training Credits
                              </p>
                              <p>
                                {student.trainingCredits.toFixed(
                                  1,
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Sessions Completed
                              </p>
                              <p>{student.completedSessions}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Participation Score
                              </p>
                              <p>
                                {student.participationScore}%
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>

                {studentAchievements.filter(
                  (s) => s.scholarshipEligible,
                ).length === 0 && (
                  <p className="text-center text-gray-500 py-12">
                    No students currently meet scholarship
                    eligibility criteria
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="participation"
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  Student Participation Overview
                </CardTitle>
                <CardDescription>
                  Track engagement and program outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        High Engagement
                      </p>
                      <div className="text-2xl mb-1">
                        {
                          studentAchievements.filter(
                            (s) => s.participationScore >= 70,
                          ).length
                        }
                      </div>
                      <p className="text-sm text-gray-600">
                        Students (≥70% participation)
                      </p>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        Moderate Engagement
                      </p>
                      <div className="text-2xl mb-1">
                        {
                          studentAchievements.filter(
                            (s) =>
                              s.participationScore >= 40 &&
                              s.participationScore < 70,
                          ).length
                        }
                      </div>
                      <p className="text-sm text-gray-600">
                        Students (40-69% participation)
                      </p>
                    </div>

                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        Needs Encouragement
                      </p>
                      <div className="text-2xl mb-1">
                        {
                          studentAchievements.filter(
                            (s) => s.participationScore < 40,
                          ).length
                        }
                      </div>
                      <p className="text-sm text-gray-600">
                        Students {"(<40% participation)"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4">
                      Department Participation Breakdown
                    </h3>
                    <div className="space-y-3">
                      {[
                        "Computer Science",
                        "Electrical Engineering",
                        "Mathematics",
                      ].map((dept) => {
                        const deptStudents =
                          studentAchievements.filter(
                            (s) => s.department === dept,
                          );
                        const avgParticipation =
                          deptStudents.length > 0
                            ? deptStudents.reduce(
                                (sum, s) =>
                                  sum + s.participationScore,
                                0,
                              ) / deptStudents.length
                            : 0;

                        return (
                          <div key={dept} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>{dept}</span>
                              <span>
                                {avgParticipation.toFixed(0)}%
                                avg
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{
                                  width: `${avgParticipation}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="py-6">
                <p className="mb-2">
                  Impact on Student Development
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  The tutoring program has shown positive
                  correlation with academic performance and
                  student retention rates. Active participants
                  demonstrate 23% better average GPA improvement
                  compared to non-participants.
                </p>
                <Button onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Impact Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}