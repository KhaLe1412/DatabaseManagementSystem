import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Calendar, Clock, Star, Users, TrendingUp } from 'lucide-react';
import { Tutor } from '../types';
import { mockSessions, mockStudents } from '../lib/mock-data';
import { AvailabilityTab } from './tutor/AvailabilityTab';
import { RequestsTab } from './tutor/RequestsTab';
import { StudentProgressTab } from './tutor/StudentProgressTab';
import { EnhancedTutorProfileTab } from './tutor/EnhancedTutorProfileTab';
import { LibraryTab } from './student/LibraryTab';
import { MessagingPanel } from './MessagingPanel';
import schoolLogo from 'figma:asset/5d30621cfc38347904bd973d0c562d26588d6b2f.png';

interface TutorDashboardProps {
  tutor: Tutor;
}

export function TutorDashboard({ tutor }: TutorDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const tutorSessions = mockSessions.filter(s => s.tutorId === tutor.id);
  const upcomingSessions = tutorSessions.filter(s => s.status === 'open');
  const completedSessions = tutorSessions.filter(s => s.status === 'completed');
  
  const uniqueStudents = new Set(completedSessions.map(s => s.enrolledStudents)).size;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={schoolLogo} alt="BK TP.HCM Logo" className="h-12 w-12 object-contain" />
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="progress">Student Progress</TabsTrigger>
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
                  <p className="text-xs text-muted-foreground">All-time sessions</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Students Helped</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{uniqueStudents}</div>
                  <p className="text-xs text-muted-foreground">Unique students</p>
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

            {/* Expertise */}
            <Card>
              <CardHeader>
                <CardTitle>Areas of Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tutor.expertise.map(exp => (
                    <Badge key={exp} variant="secondary">{exp}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>Your scheduled tutoring sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingSessions.length === 0 ? (
                  <p className="text-gray-500">No upcoming sessions</p>
                ) : (
                  upcomingSessions.map(session => {
                    const enrolledStudents = mockStudents.filter(s => session.enrolledStudents.includes(s.id));
                    const displayNames = enrolledStudents.slice(0, 2).map(s => s.name);
                    const hasMore = enrolledStudents.length > 2;
                    const studentsText = hasMore 
                      ? `${displayNames.join(', ')}...` 
                      : displayNames.join(', ');
                    
                    return (
                      <div key={session.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p>{session.subject}</p>
                            <p className="text-sm text-gray-600">
                              {enrolledStudents.length > 0 ? studentsText : 'No students enrolled yet'}
                            </p>
                          </div>
                          <Badge>{session.type}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>{session.date}</span>
                          <span>{session.startTime} - {session.endTime}</span>
                        </div>
                      </div>
                    );
                  })
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

          <TabsContent value="progress">
            <StudentProgressTab tutor={tutor} />
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