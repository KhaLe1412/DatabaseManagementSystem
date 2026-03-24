export type UserRole = 'student' | 'tutor' | 'academic-affairs' | 'student-affairs' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Student extends User {
  role: 'student';
  studentId: string;
  department: string;
  year: number;
  supportNeeds: string[];
  gpa: number;
}

export interface Tutor extends User {
  role: 'tutor';
  tutorId: string;
  department: string;
  expertise: string[];
  rating: number;
  totalSessions: number;
}

export interface Admin extends User {
  role: 'admin';
  adminId: string;
  department: string;
}


export interface StudentReview {
  studentId: string;
  rating: number;
  comment: string;
  submittedAt: string;
}

export interface Session {
  id: string;
  tutorId: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'in-person' | 'online';
  status: 'scheduled' | 'completed' | 'cancelled' | 'open' | 'full';
  location?: string;
  meetingLink?: string;
  notes?: string;
  feedback?: SessionFeedback;
  summary?: string;
  recordingUrl?: string;
  maxStudents: number; // For open sessions
  enrolledStudents: string[]; // For open sessions
  reviews?: StudentReview[]; // Student reviews for completed sessions
}

export interface SessionFeedback {
  id: string;
  sessionId: string;
  studentRating?: number;
  studentComment?: string;
  tutorProgress?: string;
  tutorNotes?: string;
  submittedAt: string;
}

export interface LibraryResource {
  id: string;
  title: string;
  type: 'textbook' | 'document' | 'video' | 'article';
  subject: string;
  author: string;
  url: string;
  thumbnail?: string;
}

export interface MatchRequest {
  id: string;
  studentId: string;
  subjects: string[];
  preferredType: 'in-person' | 'online' | 'both';
  preferredTimes: string[];
  status: 'pending' | 'matched' | 'rejected';
  matchedTutorId?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  type?: 'regular' | 'reschedule-notification' | 'material-request';
  relatedSessionId?: string;
}

export interface RescheduleRequest {
  id: string;
  sessionId: string;
  requesterId: string;
  requesterRole: 'student' | 'tutor';
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}


export interface StudentEvaluation {
  id: string;
  studentId: string;
  tutorId: string;
  sessionId: string;
  skills: {
    understanding: number; // 1-5
    participation: number; // 1-5
    preparation: number; // 1-5
  };
  attitude: number; // 1-5
  testResults?: {
    score: number;
    maxScore: number;
    notes?: string;
  };
  overallProgress: string;
  recommendations: string;
  createdAt: string;
}
