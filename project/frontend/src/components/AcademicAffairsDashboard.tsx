import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, BookOpen, Award, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { mockSessions, mockTutors, mockStudents } from '../lib/mock-data';
import { toast } from 'sonner@2.0.3';
import schoolLogo from 'figma:asset/5d30621cfc38347904bd973d0c562d26588d6b2f.png';

export function AcademicAffairsDashboard() {
  // Mock analytics data
  const subjectPerformance = [
    { subject: 'Data Structures', sessions: 45, avgImprovement: 25 },
    { subject: 'Algorithms', sessions: 38, avgImprovement: 22 },
    { subject: 'Database Systems', sessions: 32, avgImprovement: 28 },
    { subject: 'Circuit Analysis', sessions: 28, avgImprovement: 20 },
    { subject: 'Digital Electronics', sessions: 25, avgImprovement: 18 }
  ];

  const monthlyTrend = [
    { month: 'Jun', sessions: 45, students: 28 },
    { month: 'Jul', sessions: 52, students: 32 },
    { month: 'Aug', sessions: 48, students: 30 },
    { month: 'Sep', sessions: 65, students: 38 },
    { month: 'Oct', sessions: 58, students: 35 }
  ];

  const departmentData = [
    { name: 'Computer Science', value: 45 },
    { name: 'Electrical Engineering', value: 30 },
    { name: 'Mathematics', value: 15 },
    { name: 'Others', value: 10 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const handleExportReport = () => {
    toast.success('Report exported successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <img src={schoolLogo} alt="BK TP.HCM Logo" className="h-12 w-12 object-contain" />
            <div>
              <h1>HCMUT Tutoring System</h1>
              <p className="text-gray-600">Office of Academic Affairs - Analytics Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Course Analysis</TabsTrigger>
            <TabsTrigger value="resources">Resource Allocation</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Total Sessions</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">328</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Active Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">163</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Active Tutors</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{mockTutors.length}</div>
                  <p className="text-xs text-muted-foreground">All departments</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Avg Improvement</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">+23%</div>
                  <p className="text-xs text-muted-foreground">Student performance</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trend</CardTitle>
                  <CardDescription>Sessions and student participation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="sessions" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="students" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribution by Department</CardTitle>
                  <CardDescription>Student enrollment across departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Course-Specific Performance Analysis</CardTitle>
                    <CardDescription>
                      Track student improvements and tutoring effectiveness by course
                    </CardDescription>
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="cs">Computer Science</SelectItem>
                      <SelectItem value="ee">Electrical Engineering</SelectItem>
                      <SelectItem value="math">Mathematics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={subjectPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="sessions" fill="#3b82f6" name="Total Sessions" />
                    <Bar yAxisId="right" dataKey="avgImprovement" fill="#10b981" name="Avg Improvement %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjectPerformance.map(subject => (
                <Card key={subject.subject}>
                  <CardHeader>
                    <CardTitle className="text-base">{subject.subject}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Sessions</span>
                      <Badge>{subject.sessions}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg Improvement</span>
                      <Badge className="bg-green-100 text-green-800">+{subject.avgImprovement}%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Success Rate</span>
                      <Badge variant="outline">85%</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Allocation Optimization</CardTitle>
                <CardDescription>
                  Analyze tutoring demand and optimize tutor assignments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">High Demand Subjects</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Data Structures</span>
                        <Badge variant="destructive">Critical</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Algorithms</span>
                        <Badge className="bg-orange-100 text-orange-800">High</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Tutor Availability</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Available Hours</span>
                        <span>248/week</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Utilization Rate</span>
                        <span>72%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Recommendations</p>
                    <ul className="text-sm space-y-1">
                      <li>• Hire 2 CS tutors</li>
                      <li>• Expand online sessions</li>
                      <li>• Add weekend slots</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4">Tutor Workload Distribution</h3>
                  <div className="space-y-3">
                    {mockTutors.map(tutor => {
                      const workload = Math.floor(Math.random() * 30) + 50;
                      return (
                        <div key={tutor.id} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>{tutor.name}</span>
                            <span>{workload}% capacity</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${workload > 80 ? 'bg-red-500' : workload > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${workload}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Reports</CardTitle>
                <CardDescription>
                  Generate comprehensive reports for stakeholders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Monthly Performance Report</CardTitle>
                      <CardDescription>Detailed analysis of tutoring outcomes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" onClick={handleExportReport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Department Analytics</CardTitle>
                      <CardDescription>Performance breakdown by department</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" onClick={handleExportReport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Excel
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Resource Utilization</CardTitle>
                      <CardDescription>Tutor workload and availability analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" onClick={handleExportReport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Student Progress Summary</CardTitle>
                      <CardDescription>Aggregate student improvement metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" onClick={handleExportReport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Excel
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}