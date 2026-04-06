// FIX: Loại bỏ SessionRequest và MaterialAccessRequest khỏi import
import { Student, Tutor, Admin, Session, LibraryResource, MatchRequest, Message, RescheduleRequest, StudentEvaluation } from '../types';

export const mockStudents: Student[] = [
  {
    id: 's1',
    name: 'Nguyen Van An',
    email: 'an.nguyen@hcmut.edu.vn',
    role: 'student',
    studentId: '2021001',
    department: 'Computer Science',
    year: 3,
    supportNeeds: ['Data Structures', 'Algorithms', 'Database Systems'],
    gpa: 3.5,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=An'
  },
  {
    id: 's2',
    name: 'Tran Thi Binh',
    email: 'binh.tran@hcmut.edu.vn',
    role: 'student',
    studentId: '2021002',
    department: 'Electrical Engineering',
    year: 2,
    supportNeeds: ['Circuit Analysis', 'Digital Electronics'],
    gpa: 3.8,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Binh'
  },
  {
    id: 's3',
    name: 'Le Van Cuong',
    email: 'cuong.le@hcmut.edu.vn',
    role: 'student',
    studentId: '2022003',
    department: 'Computer Science',
    year: 2,
    supportNeeds: ['Programming', 'Web Development', 'Data Structures'],
    gpa: 3.2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cuong'
  },
  {
    id: 's4',
    name: 'Pham Thi Diem',
    email: 'diem.pham@hcmut.edu.vn',
    role: 'student',
    studentId: '2021004',
    department: 'Mathematics',
    year: 3,
    supportNeeds: ['Calculus', 'Linear Algebra', 'Statistics'],
    gpa: 3.9,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diem'
  },
  {
    id: 's5',
    name: 'Vo Van Em',
    email: 'em.vo@hcmut.edu.vn',
    role: 'student',
    studentId: '2022005',
    department: 'Electrical Engineering',
    year: 2,
    supportNeeds: ['Signal Processing', 'Circuit Analysis', 'Control Systems'],
    gpa: 3.4,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Em'
  },
  {
    id: 's6',
    name: 'Hoang Thi Fiona',
    email: 'fiona.hoang@hcmut.edu.vn',
    role: 'student',
    studentId: '2023006',
    department: 'Computer Science',
    year: 1,
    supportNeeds: ['Programming', 'Discrete Mathematics', 'Data Structures'],
    gpa: 3.7,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fiona'
  },
  {
    id: 's7',
    name: 'Dang Van Gia',
    email: 'gia.dang@hcmut.edu.vn',
    role: 'student',
    studentId: '2021007',
    department: 'Mechanical Engineering',
    year: 3,
    supportNeeds: ['Calculus', 'Physics', 'Engineering Mechanics'],
    gpa: 3.3,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gia'
  },
  {
    id: 's8',
    name: 'Bui Thi Hanh',
    email: 'hanh.bui@hcmut.edu.vn',
    role: 'student',
    studentId: '2022008',
    department: 'Mathematics',
    year: 2,
    supportNeeds: ['Linear Algebra', 'Discrete Mathematics', 'Statistics'],
    gpa: 3.6,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hanh'
  },
  {
    id: 's9',
    name: 'Truong Van Ivy',
    email: 'ivy.truong@hcmut.edu.vn',
    role: 'student',
    studentId: '2023009',
    department: 'Computer Science',
    year: 1,
    supportNeeds: ['Programming', 'Algorithms'],
    gpa: 3.1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivy'
  },
  {
    id: 's10',
    name: 'Ngo Thi Khanh',
    email: 'khanh.ngo@hcmut.edu.vn',
    role: 'student',
    studentId: '2021010',
    department: 'Electrical Engineering',
    year: 3,
    supportNeeds: ['Digital Electronics', 'Control Systems', 'Microprocessors'],
    gpa: 3.75,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khanh'
  }
];

// Demo Admin Account
export const mockAdmins: Admin[] = [
  {
    id: 'admin1',
    name: 'Nguyen Van Admin',
    email: 'admin@hcmut.edu.vn',
    role: 'admin',
    adminId: 'ADM001',
    department: 'Administration',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
  }
];

export const mockTutors: Tutor[] = [
  {
    id: 't1',
    name: 'Dr. Le Minh Chau',
    email: 'chau.le@hcmut.edu.vn',
    role: 'tutor',
    tutorId: 'T001',
    department: 'Computer Science',
    expertise: ['Data Structures', 'Algorithms', 'Programming', 'Database Systems'],
    rating: 4.8,
    totalSessions: 156,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chau',
  },
  {
    id: 't2',
    name: 'Dr. Pham Hoang Dung',
    email: 'dung.pham@hcmut.edu.vn',
    role: 'tutor',
    tutorId: 'T002',
    department: 'Electrical Engineering',
    expertise: ['Circuit Analysis', 'Digital Electronics', 'Signal Processing'],
    rating: 4.9,
    totalSessions: 203,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dung',
  },
  {
    id: 't3',
    name: 'Ms. Vo Thi Hoa',
    email: 'hoa.vo@hcmut.edu.vn',
    role: 'tutor',
    tutorId: 'T003',
    department: 'Mathematics',
    expertise: ['Calculus', 'Linear Algebra', 'Discrete Mathematics'],
    rating: 4.7,
    totalSessions: 89,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hoa',
  },
  {
    id: 't4',
    name: 'Dr. Nguyen Quoc Khanh',
    email: 'khanh.nguyen@hcmut.edu.vn',
    role: 'tutor',
    tutorId: 'T004',
    department: 'Computer Science',
    expertise: ['Web Development', 'Programming', 'Software Engineering'],
    rating: 4.6,
    totalSessions: 124,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KhanhT',
  },
  {
    id: 't5',
    name: 'Prof. Tran Mai Linh',
    email: 'linh.tran@hcmut.edu.vn',
    role: 'tutor',
    tutorId: 'T005',
    department: 'Mathematics',
    expertise: ['Statistics', 'Probability', 'Linear Algebra'],
    rating: 4.9,
    totalSessions: 278,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Linh',
  },
  {
    id: 't6',
    name: 'Dr. Do Van Minh',
    email: 'minh.do@hcmut.edu.vn',
    role: 'tutor',
    tutorId: 'T006',
    department: 'Electrical Engineering',
    expertise: ['Control Systems', 'Microprocessors', 'Circuit Analysis'],
    rating: 4.7,
    totalSessions: 167,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Minh',
  },
  {
    id: 't7',
    name: 'Ms. Hoang Thi Ngan',
    email: 'ngan.hoang@hcmut.edu.vn',
    role: 'tutor',
    tutorId: 'T007',
    department: 'Mechanical Engineering',
    expertise: ['Engineering Mechanics', 'Physics', 'Calculus'],
    rating: 4.5,
    totalSessions: 95,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ngan',
  }
];

export const mockSessions: Session[] = [
  {
    id: 'ses1',
    tutorId: 't1',
    subject: 'Data Structures',
    date: '2025-11-17',
    startTime: '14:00',
    endTime: '15:30',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    notes: 'Review tree traversal algorithms',
    maxStudents: 20,
    enrolledStudents: ['s1', 's3']
  },
  {
    id: 'ses2',
    tutorId: 't1',
    subject: 'Algorithms',
    date: '2025-10-20',
    startTime: '14:00',
    endTime: '15:30',
    type: 'in-person',
    status: 'completed',
    location: 'Building H6, Room 501',
    summary: 'Covered dynamic programming concepts including memoization and tabulation. Student demonstrated good understanding of the basic principles.',
    recordingUrl: 'https://example.com/recordings/session-ses2.mp4',
    feedback: {
      id: 'fb1',
      sessionId: 'ses2',
      studentRating: 5,
      studentComment: 'Very helpful session! Understood dynamic programming much better.',
      tutorProgress: 'Student shows good improvement in problem-solving approach',
      tutorNotes: 'Recommend more practice on optimization problems',
      submittedAt: '2025-10-20T16:00:00Z'
    },
    maxStudents: 15,
    enrolledStudents: ['s4', 's5'],
    reviews: [
      {
        studentId: 's4',
        rating: 5,
        comment: 'Very helpful session! Understood dynamic programming much better.',
        submittedAt: '2025-10-20T16:00:00Z'
      },
      {
        studentId: 's5',
        rating: 4,
        comment: 'Good session, but would like more practice problems.',
        submittedAt: '2025-10-20T16:30:00Z'
      }
    ]
  },
  {
    id: 'ses3',
    tutorId: 't2',
    // FIX: Xóa 'studentId: s2'
    subject: 'Circuit Analysis',
    date: '2025-11-15',
    startTime: '09:00',
    endTime: '10:30',
    type: 'in-person',
    status: 'open',
    location: 'Building H2, Lab 203',
    notes: 'Kirchhoff\'s laws and mesh analysis',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 13,
    enrolledStudents: ['s2']
  },
  {
    id: 'ses4',
    tutorId: 't1',
    // FIX: Xóa 'studentId: s1'
    subject: 'Database Systems',
    date: '2025-10-15',
    startTime: '15:00',
    endTime: '16:30',
    type: 'online',
    status: 'completed',
    meetingLink: 'https://meet.google.com/db-session',
    notes: 'Covered SQL joins and normalization',
    summary: 'Reviewed SQL JOIN operations (INNER, LEFT, RIGHT, FULL) and database normalization up to 3NF. Student practiced writing complex queries.',
    recordingUrl: 'https://example.com/recordings/session-ses4.mp4',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 12,
    enrolledStudents: ['s1'],
    reviews: [
      // {
      //   studentId: 's1',
      //   rating: 5,
      //   comment: 'Excellent session! The SQL join examples were very clear and practical.',
      //   submittedAt: '2025-10-15T17:00:00Z'
      // }
    ]
  },
  {
    id: 'ses5',
    tutorId: 't2',
    // FIX: Xóa 'studentId: s2'
    subject: 'Digital Electronics',
    date: '2025-10-18',
    startTime: '10:00',
    endTime: '11:30',
    type: 'online',
    status: 'completed',
    meetingLink: 'https://meet.google.com/digital-elec',
    summary: 'Covered boolean algebra and logic gates. Student completed practical exercises on Karnaugh maps.',
    recordingUrl: 'https://example.com/recordings/session-ses5.mp4',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 11,
    enrolledStudents: ['s2'],
    reviews: [
      {
        studentId: 's2',
        rating: 5,
        comment: 'Great hands-on session! The Karnaugh map exercises really helped me understand.',
        submittedAt: '2025-10-18T12:00:00Z'
      }
    ]
  },
  {
    id: 'ses6',
    tutorId: 't1',
    subject: 'Programming Workshop',
    date: '2025-11-18',
    startTime: '10:00',
    endTime: '12:00',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/prog-workshop',
    maxStudents: 15,
    enrolledStudents: ['s1'],
    notes: 'Group workshop on advanced programming concepts'
  },
  {
    id: 'ses7',
    tutorId: 't1',
    subject: 'Graph Algorithms',
    date: '2025-11-19',
    startTime: '14:00',
    endTime: '16:00',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/graph-algo',
    maxStudents: 10,
    enrolledStudents: [],
    notes: 'Deep dive into graph algorithms and applications'
  },
  // Additional sessions for diverse testing
  {
    id: 'ses8',
    tutorId: 't3',
    // FIX: Xóa 'studentId: s4'
    subject: 'Calculus',
    date: '2025-11-18',
    startTime: '10:00',
    endTime: '11:30',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/calc-session',
    notes: 'Integration techniques and applications',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s4']
  },
  {
    id: 'ses9',
    tutorId: 't4',
    // FIX: Xóa 'studentId: s3'
    subject: 'Web Development',
    date: '2025-11-20',
    startTime: '14:00',
    endTime: '16:00',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/web-dev',
    notes: 'React fundamentals and hooks',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s3']
  },
  {
    id: 'ses10',
    tutorId: 't5',
    // FIX: Xóa 'studentId: s4'
    subject: 'Statistics',
    date: '2025-10-25',
    startTime: '09:00',
    endTime: '10:30',
    type: 'in-person',
    status: 'completed',
    location: 'Building H3, Room 305',
    summary: 'Hypothesis testing and confidence intervals. Student performed well on practice problems.',
    feedback: {
      id: 'fb2',
      sessionId: 'ses10',
      studentRating: 5,
      studentComment: 'Excellent explanations! Now I understand statistical tests better.',
      tutorProgress: 'Student has strong grasp of statistical concepts',
      tutorNotes: 'Ready for regression analysis',
      submittedAt: '2025-10-25T11:00:00Z'
    },
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s4'],
    reviews: [
      {
        studentId: 's4',
        rating: 5,
        comment: 'Excellent explanations! Now I understand statistical tests better.',
        submittedAt: '2025-10-25T11:00:00Z'
      }
    ]
  },
  {
    id: 'ses11',
    tutorId: 't6',
    // FIX: Xóa 'studentId: s5'
    subject: 'Control Systems',
    date: '2025-11-16',
    startTime: '13:00',
    endTime: '14:30',
    type: 'in-person',
    status: 'open',
    location: 'Building H2, Lab 105',
    notes: 'Transfer functions and stability analysis',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s5']
  },
  {
    id: 'ses12',
    tutorId: 't2',
    // FIX: Xóa 'studentId: s10'
    subject: 'Microprocessors',
    date: '2025-11-17',
    startTime: '14:00',
    endTime: '15:30',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/micro-session',
    notes: '8051 architecture and assembly language',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s10']
  },
  {
    id: 'ses13',
    tutorId: 't7',
    // FIX: Xóa 'studentId: s7'
    subject: 'Engineering Mechanics',
    date: '2025-10-22',
    startTime: '10:00',
    endTime: '11:30',
    type: 'in-person',
    status: 'completed',
    location: 'Building H1, Room 402',
    summary: 'Covered statics and dynamics principles. Student worked through several beam analysis problems.',
    recordingUrl: 'https://example.com/recordings/session-ses13.mp4',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s7'],
    reviews: [
      {
        studentId: 's7',
        rating: 4,
        comment: 'Good session with practical examples. Would appreciate more problem-solving practice.',
        submittedAt: '2025-10-22T12:00:00Z'
      }
    ]
  },
  {
    id: 'ses14',
    tutorId: 't4',
    // FIX: Xóa 'studentId: s6'
    subject: 'Programming',
    date: '2025-11-19',
    startTime: '10:00',
    endTime: '11:30',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/prog-basics',
    notes: 'Introduction to object-oriented programming',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s6']
  },
  {
    id: 'ses15',
    tutorId: 't3',
    // FIX: Xóa 'studentId: s8'
    subject: 'Linear Algebra',
    date: '2025-10-28',
    startTime: '14:00',
    endTime: '15:30',
    type: 'online',
    status: 'completed',
    meetingLink: 'https://meet.google.com/linalg',
    summary: 'Matrix operations, eigenvalues and eigenvectors. Strong understanding demonstrated.',
    recordingUrl: 'https://example.com/recordings/session-ses15.mp4',
    feedback: {
      id: 'fb3',
      sessionId: 'ses15',
      studentRating: 4,
      studentComment: 'Good session, would like more practice problems.',
      tutorProgress: 'Steady improvement in linear algebra',
      tutorNotes: 'Assign additional eigenvalue problems',
      submittedAt: '2025-10-28T16:00:00Z'
    },
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s8'],
    reviews: [
      {
        studentId: 's8',
        rating: 4,
        comment: 'Good session, would like more practice problems.',
        submittedAt: '2025-10-28T16:00:00Z'
      }
    ]
  },
  {
    id: 'ses16',
    tutorId: 't1',
    // FIX: Xóa 'studentId: s3'
    subject: 'Data Structures',
    date: '2025-11-18',
    startTime: '14:00',
    endTime: '15:30',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/ds-trees',
    notes: 'Binary search trees and AVL trees',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s3']
  },
  {
    id: 'ses17',
    tutorId: 't5',
    // FIX: Xóa 'studentId: s8'
    subject: 'Statistics',
    date: '2025-11-21',
    startTime: '09:00',
    endTime: '10:30',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/stats-session',
    notes: 'Descriptive statistics and data visualization',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s8']
  },
  {
    id: 'ses18',
    tutorId: 't1',
    // FIX: Xóa 'studentId: s9'
    subject: 'Algorithms',
    date: '2025-10-30',
    startTime: '14:00',
    endTime: '15:30',
    type: 'online',
    status: 'completed',
    meetingLink: 'https://meet.google.com/algo-intro',
    summary: 'Introduction to sorting algorithms. Covered bubble sort, insertion sort, and merge sort.',
    recordingUrl: 'https://example.com/recordings/session-ses18.mp4',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s9'],
    reviews: [
      {
        studentId: 's9',
        rating: 5,
        comment: 'Very clear explanations of sorting algorithms. The visualizations were extremely helpful!',
        submittedAt: '2025-10-30T16:00:00Z'
      }
    ]
  },
  {
    id: 'ses19',
    tutorId: 't6',
    // FIX: Xóa 'studentId: s10'
    subject: 'Circuit Analysis',
    date: '2025-10-26',
    startTime: '13:00',
    endTime: '14:30',
    type: 'in-person',
    status: 'completed',
    location: 'Building H2, Lab 201',
    summary: 'AC circuit analysis using phasor diagrams. Student showed good understanding.',
    feedback: {
      id: 'fb4',
      sessionId: 'ses19',
      studentRating: 5,
      studentComment: 'Great hands-on session with lab work.',
      tutorProgress: 'Excellent lab skills',
      tutorNotes: 'Ready for power systems',
      submittedAt: '2025-10-26T15:00:00Z'
    },
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s10'],
    reviews: [
      {
        studentId: 's10',
        rating: 5,
        comment: 'Great hands-on session with lab work. Really helped with understanding AC circuits.',
        submittedAt: '2025-10-26T15:00:00Z'
      }
    ]
  },
  {
    id: 'ses20',
    tutorId: 't4',
    // FIX: Xóa 'studentId: s3'
    subject: 'Programming',
    date: '2025-10-24',
    startTime: '14:00',
    endTime: '15:30',
    type: 'online',
    status: 'completed',
    meetingLink: 'https://meet.google.com/prog-oop',
    summary: 'Object-oriented programming concepts: classes, inheritance, polymorphism.',
    recordingUrl: 'https://example.com/recordings/session-ses20.mp4',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s3'],
    reviews: [
      {
        studentId: 's3',
        rating: 5,
        comment: 'Excellent introduction to OOP! The examples with real code made everything clear.',
        submittedAt: '2025-10-24T16:00:00Z'
      }
    ]
  },
  // Multiple sessions on same day for calendar testing
  {
    id: 'ses21',
    tutorId: 't1',
    // FIX: Xóa 'studentId: s1'
    subject: 'Algorithms',
    date: '2025-11-18',
    startTime: '16:00',
    endTime: '17:30',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/algo-advanced',
    notes: 'Advanced algorithmic techniques',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s1']
  },
  {
    id: 'ses22',
    tutorId: 't3',
    // FIX: Xóa 'studentId: s4'
    subject: 'Linear Algebra',
    date: '2025-11-20',
    startTime: '14:00',
    endTime: '15:30',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/linalg-2',
    notes: 'Vector spaces and transformations',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s4']
  },
  {
    id: 'ses23',
    tutorId: 't2',
    // FIX: Xóa 'studentId: s5'
    subject: 'Signal Processing',
    date: '2025-11-21',
    startTime: '13:00',
    endTime: '14:30',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/signal-proc',
    notes: 'Digital filters and FFT',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s5']
  },
  {
    id: 'ses24',
    tutorId: 't7',
    // FIX: Xóa 'studentId: s7'
    subject: 'Physics',
    date: '2025-11-22',
    startTime: '10:00',
    endTime: '11:30',
    type: 'in-person',
    status: 'open',
    location: 'Building H1, Room 301',
    notes: 'Thermodynamics fundamentals',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s7']
  },
  {
    id: 'ses25',
    tutorId: 't5',
    // FIX: Xóa 'studentId: s4'
    subject: 'Probability',
    date: '2025-11-23',
    startTime: '09:00',
    endTime: '10:30',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/prob-session',
    notes: 'Random variables and probability distributions',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s4']
  },
  // Cancelled session
  {
    id: 'ses26',
    tutorId: 't1',
    // FIX: Xóa 'studentId: s1'
    subject: 'Database Systems',
    date: '2025-10-12',
    startTime: '14:00',
    endTime: '15:30',
    type: 'online',
    status: 'cancelled',
    meetingLink: 'https://meet.google.com/db-cancelled',
    notes: 'Cancelled due to tutor illness',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s1']
  },
  // More sessions with enrolled students for testing
  {
    id: 'ses27',
    tutorId: 't3',
    // FIX: Xóa 'studentId: s8'
    subject: 'Discrete Mathematics',
    date: '2025-11-25',
    startTime: '10:00',
    endTime: '11:30',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/discrete-math',
    notes: 'Graph theory and combinatorics',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s8']
  },
  {
    id: 'ses28',
    tutorId: 't4',
    // FIX: Xóa 'studentId: s6'
    subject: 'Web Development',
    date: '2025-11-26',
    startTime: '14:00',
    endTime: '16:00',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/web-advanced',
    notes: 'Advanced React patterns and state management',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s6']
  },
  {
    id: 'ses29',
    tutorId: 't5',
    // FIX: Xóa 'studentId: s8'
    subject: 'Probability',
    date: '2025-11-27',
    startTime: '09:00',
    endTime: '10:30',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/probability',
    notes: 'Conditional probability and Bayes theorem',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s8']
  },
  {
    id: 'ses30',
    tutorId: 't6',
    // FIX: Xóa 'studentId: s10'
    subject: 'Microprocessors',
    date: '2025-11-28',
    startTime: '13:00',
    endTime: '14:30',
    type: 'in-person',
    status: 'open',
    location: 'Building H2, Lab 305',
    notes: 'ARM architecture and assembly programming with hands-on exercises',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s10']
  },
  // Additional completed sessions for history
  {
    id: 'ses31',
    tutorId: 't3',
    // FIX: Xóa 'studentId: s4'
    subject: 'Calculus',
    date: '2025-10-29',
    startTime: '10:00',
    endTime: '11:30',
    type: 'online',
    status: 'completed',
    meetingLink: 'https://meet.google.com/calc-limits',
    summary: 'Limits and continuity. Covered epsilon-delta definition and limit theorems.',
    recordingUrl: 'https://example.com/recordings/session-ses31.mp4',
    feedback: {
      id: 'fb5',
      sessionId: 'ses31',
      studentRating: 5,
      studentComment: 'Crystal clear explanations! Finally understood limits.',
      tutorProgress: 'Excellent grasp of fundamental concepts',
      tutorNotes: 'Ready for derivatives',
      submittedAt: '2025-10-29T12:00:00Z'
    },
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s4'],
    reviews: [
      {
        studentId: 's4',
        rating: 5,
        comment: 'Crystal clear explanations! Finally understood limits.',
        submittedAt: '2025-10-29T12:00:00Z'
      }
    ]
  },
  {
    id: 'ses32',
    tutorId: 't4',
    // FIX: Xóa 'studentId: s3'
    subject: 'Software Engineering',
    date: '2025-10-31',
    startTime: '14:00',
    endTime: '15:30',
    type: 'online',
    status: 'completed',
    meetingLink: 'https://meet.google.com/software-eng',
    summary: 'Design patterns: Singleton, Factory, Observer. Practical examples in JavaScript.',
    recordingUrl: 'https://example.com/recordings/session-ses32.mp4',
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s3'],
    reviews: [
      {
        studentId: 's3',
        rating: 5,
        comment: 'Design patterns finally make sense! The JavaScript examples were perfect.',
        submittedAt: '2025-10-31T16:00:00Z'
      }
    ]
  },
  {
    id: 'ses33',
    tutorId: 't2',
    // FIX: Xóa 'studentId: s5'
    subject: 'Circuit Analysis',
    date: '2025-11-01',
    startTime: '09:00',
    endTime: '10:30',
    type: 'in-person',
    status: 'completed',
    location: 'Building H2, Lab 203',
    summary: 'Thevenin and Norton equivalent circuits. Solved several network problems.',
    feedback: {
      id: 'fb6',
      sessionId: 'ses33',
      studentRating: 4,
      studentComment: 'Good session, but need more practice problems.',
      tutorProgress: 'Making steady progress',
      tutorNotes: 'Provide additional practice worksheets',
      submittedAt: '2025-11-01T11:00:00Z'
    },
    // FIX: Thêm maxStudents và enrolledStudents
    maxStudents: 10,
    enrolledStudents: ['s5'],
    reviews: [
      {
        studentId: 's5',
        rating: 4,
        comment: 'Good session, but need more practice problems.',
        submittedAt: '2025-11-01T11:00:00Z'
      }
    ]
  },
  // Additional completed sessions for comprehensive profile testing
  {
    id: 'ses34',
    tutorId: 't1',
    subject: 'Data Structures',
    date: '2025-09-15',
    startTime: '14:00',
    endTime: '15:30',
    type: 'online',
    status: 'completed',
    meetingLink: 'https://meet.google.com/ds-bst',
    summary: 'Binary Search Trees and AVL Trees. Covered insertion, deletion, and rotation operations.',
    recordingUrl: 'https://example.com/recordings/session-ses34.mp4',
    feedback: {
      id: 'fb7',
      sessionId: 'ses34',
      studentRating: 5,
      studentComment: 'Great explanation of tree rotations!',
      tutorProgress: 'Excellent understanding of tree structures',
      tutorNotes: 'Ready for more advanced tree algorithms',
      submittedAt: '2025-09-15T16:00:00Z'
    },
    maxStudents: 12,
    enrolledStudents: ['s1', 's3'],
    reviews: [
      {
        studentId: 's1',
        rating: 5,
        comment: 'Great explanation of tree rotations!',
        submittedAt: '2025-09-15T16:00:00Z'
      },
      {
        studentId: 's3',
        rating: 4,
        comment: 'Good session, need more practice on AVL trees.',
        submittedAt: '2025-09-15T16:15:00Z'
      }
    ]
  },
  {
    id: 'ses35',
    tutorId: 't2',
    subject: 'Digital Electronics',
    date: '2025-09-20',
    startTime: '09:00',
    endTime: '10:30',
    type: 'in-person',
    status: 'completed',
    location: 'Building H2, Lab 205',
    summary: 'Flip-flops and sequential circuits. Covered D, JK, and T flip-flops with practical examples.',
    recordingUrl: 'https://example.com/recordings/session-ses35.mp4',
    feedback: {
      id: 'fb8',
      sessionId: 'ses35',
      studentRating: 4,
      studentComment: 'Clear explanations, but need more examples.',
      tutorProgress: 'Good progress on sequential logic',
      tutorNotes: 'Provide additional practice problems',
      submittedAt: '2025-09-20T11:00:00Z'
    },
    maxStudents: 10,
    enrolledStudents: ['s2', 's5'],
    reviews: [
      {
        studentId: 's2',
        rating: 4,
        comment: 'Clear explanations, but need more examples.',
        submittedAt: '2025-09-20T11:00:00Z'
      },
      {
        studentId: 's5',
        rating: 5,
        comment: 'Very helpful! Understood flip-flops much better now.',
        submittedAt: '2025-09-20T11:10:00Z'
      }
    ]
  },
  {
    id: 'ses36',
    tutorId: 't3',
    subject: 'Linear Algebra',
    date: '2025-09-25',
    startTime: '10:00',
    endTime: '11:30',
    type: 'online',
    status: 'completed',
    meetingLink: 'https://meet.google.com/linalg-systems',
    summary: 'Systems of linear equations and Gaussian elimination. Matrix row operations and reduced row echelon form.',
    recordingUrl: 'https://example.com/recordings/session-ses36.mp4',
    feedback: {
      id: 'fb9',
      sessionId: 'ses36',
      studentRating: 5,
      studentComment: 'Perfect explanation of Gaussian elimination!',
      tutorProgress: 'Strong grasp of matrix operations',
      tutorNotes: 'Ready for matrix inverses and determinants',
      submittedAt: '2025-09-25T12:00:00Z'
    },
    maxStudents: 15,
    enrolledStudents: ['s4', 's8'],
    reviews: [
      {
        studentId: 's4',
        rating: 5,
        comment: 'Perfect explanation of Gaussian elimination!',
        submittedAt: '2025-09-25T12:00:00Z'
      },
      {
        studentId: 's8',
        rating: 5,
        comment: 'Excellent session! Everything is clear now.',
        submittedAt: '2025-09-25T12:05:00Z'
      }
    ]
  },
  {
    id: 'ses37',
    tutorId: 't4',
    subject: 'Web Development',
    date: '2025-09-28',
    startTime: '14:00',
    endTime: '16:00',
    type: 'online',
    status: 'completed',
    meetingLink: 'https://meet.google.com/web-react',
    summary: 'React hooks and state management. Built a todo app using useState and useEffect hooks.',
    recordingUrl: 'https://example.com/recordings/session-ses37.mp4',
    feedback: {
      id: 'fb10',
      sessionId: 'ses37',
      studentRating: 5,
      studentComment: 'Amazing hands-on session! The todo app example was perfect.',
      tutorProgress: 'Excellent progress with React concepts',
      tutorNotes: 'Continue building more complex projects',
      submittedAt: '2025-09-28T17:00:00Z'
    },
    maxStudents: 12,
    enrolledStudents: ['s3', 's6'],
    reviews: [
      {
        studentId: 's3',
        rating: 5,
        comment: 'Amazing hands-on session! The todo app example was perfect.',
        submittedAt: '2025-09-28T17:00:00Z'
      },
      {
        studentId: 's6',
        rating: 4,
        comment: 'Good session, but would like more advanced examples.',
        submittedAt: '2025-09-28T17:15:00Z'
      }
    ]
  },
  {
    id: 'ses38',
    tutorId: 't5',
    subject: 'Statistics',
    date: '2025-10-05',
    startTime: '10:00',
    endTime: '11:30',
    type: 'online',
    status: 'completed',
    meetingLink: 'https://meet.google.com/stats-dist',
    summary: 'Probability distributions: Normal, Binomial, and Poisson. Solved various problems using distribution tables.',
    recordingUrl: 'https://example.com/recordings/session-ses38.mp4',
    feedback: {
      id: 'fb11',
      sessionId: 'ses38',
      studentRating: 4,
      studentComment: 'Good session, need more practice problems.',
      tutorProgress: 'Understanding distributions well',
      tutorNotes: 'Provide more real-world examples',
      submittedAt: '2025-10-05T12:00:00Z'
    },
    maxStudents: 10,
    enrolledStudents: ['s4', 's8'],
    reviews: [
      {
        studentId: 's4',
        rating: 4,
        comment: 'Good session, need more practice problems.',
        submittedAt: '2025-10-05T12:00:00Z'
      },
      {
        studentId: 's8',
        rating: 5,
        comment: 'Very clear explanations of probability distributions!',
        submittedAt: '2025-10-05T12:10:00Z'
      }
    ]
  },
  {
    id: 'ses39',
    tutorId: 't6',
    subject: 'Control Systems',
    date: '2025-10-10',
    startTime: '13:00',
    endTime: '14:30',
    type: 'in-person',
    status: 'completed',
    location: 'Building H2, Lab 301',
    summary: 'PID controllers and system stability. Analyzed root locus plots and Bode diagrams.',
    recordingUrl: 'https://example.com/recordings/session-ses39.mp4',
    feedback: {
      id: 'fb12',
      sessionId: 'ses39',
      studentRating: 5,
      studentComment: 'Excellent explanation of PID tuning!',
      tutorProgress: 'Strong understanding of control theory',
      tutorNotes: 'Ready for advanced control design',
      submittedAt: '2025-10-10T15:00:00Z'
    },
    maxStudents: 8,
    enrolledStudents: ['s2', 's5', 's10'],
    reviews: [
      {
        studentId: 's2',
        rating: 5,
        comment: 'Excellent explanation of PID tuning!',
        submittedAt: '2025-10-10T15:00:00Z'
      },
      {
        studentId: 's5',
        rating: 4,
        comment: 'Good session, but need more examples.',
        submittedAt: '2025-10-10T15:10:00Z'
      },
      {
        studentId: 's10',
        rating: 5,
        comment: 'Very helpful! Understood control systems much better.',
        submittedAt: '2025-10-10T15:15:00Z'
      }
    ]
  },
  {
    id: 'ses40',
    tutorId: 't7',
    subject: 'Physics',
    date: '2025-10-12',
    startTime: '14:00',
    endTime: '15:30',
    type: 'in-person',
    status: 'completed',
    location: 'Building H1, Room 301',
    summary: 'Mechanics: Newton\'s laws and conservation of energy. Solved problems involving friction and momentum.',
    recordingUrl: 'https://example.com/recordings/session-ses40.mp4',
    feedback: {
      id: 'fb13',
      sessionId: 'ses40',
      studentRating: 4,
      studentComment: 'Good explanations, but need more practice.',
      tutorProgress: 'Making good progress',
      tutorNotes: 'Focus on problem-solving strategies',
      submittedAt: '2025-10-12T16:00:00Z'
    },
    maxStudents: 10,
    enrolledStudents: ['s7'],
    reviews: [
      {
        studentId: 's7',
        rating: 4,
        comment: 'Good explanations, but need more practice.',
        submittedAt: '2025-10-12T16:00:00Z'
      }
    ]
  },
  {
    id: 'ses41',
    tutorId: 't1',
    subject: 'Algorithms',
    date: '2025-10-18',
    startTime: '14:00',
    endTime: '15:30',
    type: 'online',
    status: 'completed',
    meetingLink: 'https://meet.google.com/algo-graph',
    summary: 'Graph algorithms: BFS, DFS, Dijkstra\'s algorithm. Implemented shortest path finding.',
    recordingUrl: 'https://example.com/recordings/session-ses41.mp4',
    feedback: {
      id: 'fb14',
      sessionId: 'ses41',
      studentRating: 5,
      studentComment: 'Great session! Graph algorithms are much clearer now.',
      tutorProgress: 'Excellent understanding of graph traversal',
      tutorNotes: 'Ready for more complex graph problems',
      submittedAt: '2025-10-18T16:00:00Z'
    },
    maxStudents: 12,
    enrolledStudents: ['s1', 's3', 's6'],
    reviews: [
      {
        studentId: 's1',
        rating: 5,
        comment: 'Great session! Graph algorithms are much clearer now.',
        submittedAt: '2025-10-18T16:00:00Z'
      },
      {
        studentId: 's3',
        rating: 5,
        comment: 'Perfect explanation of Dijkstra\'s algorithm!',
        submittedAt: '2025-10-18T16:10:00Z'
      },
      {
        studentId: 's6',
        rating: 4,
        comment: 'Good session, need more practice problems.',
        submittedAt: '2025-10-18T16:15:00Z'
      }
    ]
  },
  {
    id: 'ses42',
    tutorId: 't7',
    subject: 'Calculus',
    date: '2025-10-15',
    startTime: '14:00',
    endTime: '15:30',
    type: 'in-person',
    status: 'completed',
    location: 'Building H1, Room 302',
    summary: 'Derivatives and applications. Covered chain rule, product rule, and optimization problems.',
    recordingUrl: 'https://example.com/recordings/session-ses42.mp4',
    feedback: {
      id: 'fb15',
      sessionId: 'ses42',
      studentRating: 5,
      studentComment: 'Excellent session! Derivatives make much more sense now.',
      tutorProgress: 'Strong understanding of calculus fundamentals',
      tutorNotes: 'Continue with integration next',
      submittedAt: '2025-10-15T16:00:00Z'
    },
    maxStudents: 10,
    enrolledStudents: ['s7', 's9'],
    reviews: [
      {
        studentId: 's7',
        rating: 5,
        comment: 'Excellent session! Derivatives make much more sense now.',
        submittedAt: '2025-10-15T16:00:00Z'
      },
      {
        studentId: 's9',
        rating: 4,
        comment: 'Good explanations, but need more practice problems.',
        submittedAt: '2025-10-15T16:10:00Z'
      }
    ]
  },
  {
    id: 'ses43',
    tutorId: 't3',
    subject: 'Discrete Mathematics',
    date: '2025-10-22',
    startTime: '10:00',
    endTime: '11:30',
    type: 'online',
    status: 'completed',
    meetingLink: 'https://meet.google.com/discrete-proofs',
    summary: 'Mathematical proofs: direct proof, proof by contradiction, and mathematical induction.',
    recordingUrl: 'https://example.com/recordings/session-ses43.mp4',
    feedback: {
      id: 'fb16',
      sessionId: 'ses43',
      studentRating: 5,
      studentComment: 'Great explanation of proof techniques!',
      tutorProgress: 'Excellent progress with mathematical reasoning',
      tutorNotes: 'Ready for more advanced proof methods',
      submittedAt: '2025-10-22T12:00:00Z'
    },
    maxStudents: 12,
    enrolledStudents: ['s6', 's8', 's9'],
    reviews: [
      {
        studentId: 's6',
        rating: 5,
        comment: 'Great explanation of proof techniques!',
        submittedAt: '2025-10-22T12:00:00Z'
      },
      {
        studentId: 's8',
        rating: 5,
        comment: 'Very helpful! Mathematical induction is clearer now.',
        submittedAt: '2025-10-22T12:05:00Z'
      },
      {
        studentId: 's9',
        rating: 4,
        comment: 'Good session, need more practice on proofs.',
        submittedAt: '2025-10-22T12:10:00Z'
      }
    ]
  },
  {
    id: 'ses44',
    tutorId: 't5',
    subject: 'Probability and Statistics',
    date: '2025-10-25',
    startTime: '10:00',
    endTime: '11:30',
    type: 'online',
    status: 'completed',
    meetingLink: 'https://meet.google.com/stats-regression',
    summary: 'Linear regression and correlation analysis. Covered least squares method and R-squared values.',
    recordingUrl: 'https://example.com/recordings/session-ses44.mp4',
    feedback: {
      id: 'fb17',
      sessionId: 'ses44',
      studentRating: 4,
      studentComment: 'Good session, but need more examples.',
      tutorProgress: 'Understanding regression concepts well',
      tutorNotes: 'Provide more real-world datasets',
      submittedAt: '2025-10-25T12:00:00Z'
    },
    maxStudents: 10,
    enrolledStudents: ['s4', 's8', 's9'],
    reviews: [
      {
        studentId: 's4',
        rating: 4,
        comment: 'Good session, but need more examples.',
        submittedAt: '2025-10-25T12:00:00Z'
      },
      {
        studentId: 's8',
        rating: 5,
        comment: 'Excellent explanation of regression analysis!',
        submittedAt: '2025-10-25T12:05:00Z'
      },
      {
        studentId: 's9',
        rating: 4,
        comment: 'Helpful session, need more practice problems.',
        submittedAt: '2025-10-25T12:10:00Z'
      }
    ]
  },
  {
    id: 'ses45',
    tutorId: 't6',
    subject: 'Control Systems',
    date: '2025-09-18',
    startTime: '13:00',
    endTime: '14:30',
    type: 'in-person',
    status: 'completed',
    location: 'Building H2, Lab 302',
    summary: 'Introduction to control systems. Covered open-loop and closed-loop systems, transfer functions.',
    recordingUrl: 'https://example.com/recordings/session-ses45.mp4',
    feedback: {
      id: 'fb18',
      sessionId: 'ses45',
      studentRating: 5,
      studentComment: 'Great introduction to control systems!',
      tutorProgress: 'Good understanding of basic concepts',
      tutorNotes: 'Continue with system analysis',
      submittedAt: '2025-09-18T15:00:00Z'
    },
    maxStudents: 10,
    enrolledStudents: ['s2', 's5', 's10'],
    reviews: [
      {
        studentId: 's2',
        rating: 5,
        comment: 'Great introduction to control systems!',
        submittedAt: '2025-09-18T15:00:00Z'
      },
      {
        studentId: 's5',
        rating: 4,
        comment: 'Good session, need more examples.',
        submittedAt: '2025-09-18T15:10:00Z'
      },
      {
        studentId: 's10',
        rating: 5,
        comment: 'Excellent explanations!',
        submittedAt: '2025-09-18T15:15:00Z'
      }
    ]
  },
  {
    id: 'ses46',
    tutorId: 't6',
    subject: 'Microprocessors',
    date: '2025-10-08',
    startTime: '13:00',
    endTime: '14:30',
    type: 'in-person',
    status: 'completed',
    location: 'Building H2, Lab 304',
    summary: 'ARM architecture and instruction set. Covered assembly programming basics and register operations.',
    recordingUrl: 'https://example.com/recordings/session-ses46.mp4',
    feedback: {
      id: 'fb19',
      sessionId: 'ses46',
      studentRating: 4,
      studentComment: 'Good session, but need more hands-on practice.',
      tutorProgress: 'Understanding ARM architecture well',
      tutorNotes: 'Provide more programming exercises',
      submittedAt: '2025-10-08T15:00:00Z'
    },
    maxStudents: 8,
    enrolledStudents: ['s10'],
    reviews: [
      {
        studentId: 's10',
        rating: 4,
        comment: 'Good session, but need more hands-on practice.',
        submittedAt: '2025-10-08T15:00:00Z'
      }
    ]
  },
  {
    id: 'open1',
    tutorId: 't1',
    subject: 'Data Structures Workshop',
    date: '2025-11-01',
    startTime: '14:00',
    endTime: '16:00',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/workshop-ds',
    maxStudents: 10,
    enrolledStudents: ['s1'],
    notes: 'Group session covering advanced data structures'
  },
  {
    id: 'open2',
    tutorId: 't3',
    subject: 'Calculus Problem Solving',
    date: '2025-10-30',
    startTime: '10:00',
    endTime: '12:00',
    type: 'in-person',
    status: 'open',
    location: 'Building H3, Room 201',
    maxStudents: 15,
    enrolledStudents: [],
    notes: 'Open problem-solving session for calculus questions'
  },
  // Many more open sessions for comprehensive testing
  {
    id: 'open3',
    tutorId: 't1',
    subject: 'Advanced Algorithms',
    date: '2025-11-24',
    startTime: '14:00',
    endTime: '16:00',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/adv-algo',
    maxStudents: 12,
    enrolledStudents: ['s1', 's3', 's9'],
    notes: 'Graph algorithms, dynamic programming, and greedy algorithms'
  },
  {
    id: 'open4',
    tutorId: 't2',
    subject: 'Electronics Lab Session',
    date: '2025-11-25',
    startTime: '09:00',
    endTime: '11:00',
    type: 'in-person',
    status: 'open',
    location: 'Building H2, Lab 204',
    maxStudents: 8,
    enrolledStudents: ['s2', 's5', 's10'],
    notes: 'Hands-on practice with oscilloscopes and circuit building'
  },
  {
    id: 'open5',
    tutorId: 't3',
    subject: 'Linear Algebra Review',
    date: '2025-11-26',
    startTime: '10:00',
    endTime: '12:00',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/linalg-review',
    maxStudents: 20,
    enrolledStudents: ['s4', 's8'],
    notes: 'Comprehensive review of eigenvalues, eigenvectors, and matrix decomposition'
  },
  {
    id: 'open6',
    tutorId: 't4',
    subject: 'React Masterclass',
    date: '2025-11-27',
    startTime: '14:00',
    endTime: '17:00',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/react-master',
    maxStudents: 15,
    enrolledStudents: ['s3', 's6'],
    notes: 'Deep dive into React hooks, context API, and performance optimization'
  },
  {
    id: 'open7',
    tutorId: 't5',
    subject: 'Statistics Workshop',
    date: '2025-11-28',
    startTime: '09:00',
    endTime: '11:00',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/stats-workshop',
    maxStudents: 18,
    enrolledStudents: ['s4', 's8', 's1'],
    notes: 'Hypothesis testing, regression analysis, and ANOVA'
  },
  {
    id: 'open8',
    tutorId: 't6',
    subject: 'Microcontroller Programming',
    date: '2025-11-29',
    startTime: '13:00',
    endTime: '15:00',
    type: 'in-person',
    status: 'open',
    location: 'Building H2, Lab 306',
    maxStudents: 10,
    enrolledStudents: ['s5', 's10'],
    notes: 'Arduino and ARM programming workshop'
  },
  {
    id: 'open9',
    tutorId: 't7',
    subject: 'Engineering Mechanics Workshop',
    date: '2025-11-30',
    startTime: '10:00',
    endTime: '12:00',
    type: 'in-person',
    status: 'open',
    location: 'Building H1, Room 403',
    maxStudents: 12,
    enrolledStudents: ['s7'],
    notes: 'Statics, dynamics, and mechanics of materials'
  },
  {
    id: 'open10',
    tutorId: 't1',
    subject: 'Database Design Patterns',
    date: '2025-12-01',
    startTime: '14:00',
    endTime: '16:00',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/db-patterns',
    maxStudents: 15,
    enrolledStudents: ['s1'],
    notes: 'Advanced database design, indexing strategies, and query optimization'
  },
  {
    id: 'open11',
    tutorId: 't4',
    subject: 'JavaScript Deep Dive',
    date: '2025-12-02',
    startTime: '14:00',
    endTime: '16:30',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/js-deep',
    maxStudents: 20,
    enrolledStudents: ['s3', 's6', 's9'],
    notes: 'Closures, prototypes, async/await, and modern JavaScript features'
  },
  {
    id: 'open12',
    tutorId: 't2',
    subject: 'Signal Processing Fundamentals',
    date: '2025-12-03',
    startTime: '13:00',
    endTime: '15:00',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/signal-fund',
    maxStudents: 12,
    enrolledStudents: ['s2', 's5'],
    notes: 'Fourier analysis, filters, and frequency domain'
  },
  {
    id: 'open13',
    tutorId: 't3',
    subject: 'Discrete Math for CS',
    date: '2025-12-04',
    startTime: '10:00',
    endTime: '12:00',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/discrete-cs',
    maxStudents: 16,
    enrolledStudents: ['s6', 's8', 's9'],
    notes: 'Logic, set theory, graph theory, and combinatorics'
  },
  {
    id: 'open14',
    tutorId: 't5',
    subject: 'Probability Theory',
    date: '2025-12-05',
    startTime: '09:00',
    endTime: '11:00',
    type: 'in-person',
    status: 'open',
    location: 'Building H3, Room 302',
    maxStudents: 14,
    enrolledStudents: ['s4', 's8'],
    notes: 'Random variables, distributions, and conditional probability'
  },
  {
    id: 'open15',
    tutorId: 't1',
    subject: 'Competitive Programming',
    date: '2025-12-06',
    startTime: '14:00',
    endTime: '17:00',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/comp-prog',
    maxStudents: 10,
    enrolledStudents: ['s1', 's3'],
    notes: 'Practice session for ACM ICPC preparation'
  },
  {
    id: 'open16',
    tutorId: 't6',
    subject: 'Control Systems Design',
    date: '2025-12-07',
    startTime: '13:00',
    endTime: '15:00',
    type: 'in-person',
    status: 'open',
    location: 'Building H2, Lab 107',
    maxStudents: 8,
    enrolledStudents: ['s5', 's10'],
    notes: 'PID controllers and feedback systems'
  },
  {
    id: 'open17',
    tutorId: 't4',
    subject: 'Full Stack Development',
    date: '2025-12-08',
    startTime: '10:00',
    endTime: '13:00',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/fullstack',
    maxStudents: 12,
    enrolledStudents: ['s3', 's6'],
    notes: 'Build a complete web application from scratch'
  },
  {
    id: 'open18',
    tutorId: 't7',
    subject: 'Physics Problem Solving',
    date: '2025-12-09',
    startTime: '10:00',
    endTime: '12:00',
    type: 'in-person',
    status: 'open',
    location: 'Building H1, Room 302',
    maxStudents: 15,
    enrolledStudents: ['s7'],
    notes: 'Mechanics, thermodynamics, and electromagnetism problems'
  },
  {
    id: 'open19',
    tutorId: 't5',
    subject: 'Machine Learning Basics',
    date: '2025-12-10',
    startTime: '14:00',
    endTime: '16:30',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/ml-basics',
    maxStudents: 20,
    enrolledStudents: ['s1', 's3', 's4', 's8'],
    notes: 'Introduction to ML algorithms and Python libraries'
  },
  {
    id: 'open20',
    tutorId: 't2',
    subject: 'Digital Circuit Design',
    date: '2025-12-11',
    startTime: '09:00',
    endTime: '11:00',
    type: 'in-person',
    status: 'open',
    location: 'Building H2, Lab 205',
    maxStudents: 10,
    enrolledStudents: ['s2', 's10'],
    notes: 'Combinational and sequential circuit design'
  },
  {
    id: 'open21',
    tutorId: 't3',
    subject: 'Calculus for Engineers',
    date: '2025-12-12',
    startTime: '10:00',
    endTime: '12:00',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/calc-eng',
    maxStudents: 18,
    enrolledStudents: ['s4', 's7', 's8'],
    notes: 'Applications of calculus in engineering problems'
  },
  {
    id: 'open22',
    tutorId: 't1',
    subject: 'System Design Interview Prep',
    date: '2025-12-13',
    startTime: '14:00',
    endTime: '16:00',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/sys-design',
    maxStudents: 12,
    enrolledStudents: ['s1'],
    notes: 'Scalability, databases, caching, and distributed systems'
  },
  {
    id: 'open23',
    tutorId: 't4',
    subject: 'Mobile App Development',
    date: '2025-12-14',
    startTime: '13:00',
    endTime: '15:30',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/mobile-dev',
    maxStudents: 15,
    enrolledStudents: ['s3', 's6', 's9'],
    notes: 'React Native fundamentals and mobile UI/UX'
  },
  {
    id: 'open24',
    tutorId: 't6',
    subject: 'Embedded Systems Workshop',
    date: '2025-12-15',
    startTime: '13:00',
    endTime: '16:00',
    type: 'in-person',
    status: 'open',
    location: 'Building H2, Lab 308',
    maxStudents: 8,
    enrolledStudents: ['s5', 's10'],
    notes: 'Real-time operating systems and IoT applications'
  },
  {
    id: 'open25',
    tutorId: 't5',
    subject: 'Data Analysis with Python',
    date: '2025-12-16',
    startTime: '09:00',
    endTime: '11:30',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/data-python',
    maxStudents: 20,
    enrolledStudents: ['s1', 's4', 's8'],
    notes: 'Pandas, NumPy, and data visualization'
  },
  {
    id: 'open26',
    tutorId: 't2',
    subject: 'Power Electronics',
    date: '2025-12-17',
    startTime: '13:00',
    endTime: '15:00',
    type: 'in-person',
    status: 'open',
    location: 'Building H2, Lab 206',
    maxStudents: 10,
    enrolledStudents: ['s2', 's5'],
    notes: 'Converters, inverters, and motor drives'
  },
  {
    id: 'open27',
    tutorId: 't7',
    subject: 'Fluid Mechanics',
    date: '2025-12-18',
    startTime: '10:00',
    endTime: '12:00',
    type: 'in-person',
    status: 'open',
    location: 'Building H1, Room 404',
    maxStudents: 12,
    enrolledStudents: ['s7'],
    notes: 'Fluid statics, dynamics, and Bernoulli equation'
  },
  {
    id: 'open28',
    tutorId: 't1',
    subject: 'Software Testing Workshop',
    date: '2025-12-19',
    startTime: '14:00',
    endTime: '16:00',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/testing',
    maxStudents: 15,
    enrolledStudents: ['s1', 's3'],
    notes: 'Unit testing, integration testing, and TDD'
  },
  {
    id: 'open29',
    tutorId: 't3',
    subject: 'Abstract Algebra',
    date: '2025-12-20',
    startTime: '10:00',
    endTime: '12:00',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/abstract-alg',
    maxStudents: 10,
    enrolledStudents: ['s4', 's8'],
    notes: 'Groups, rings, and fields'
  },
  {
    id: 'open30',
    tutorId: 't4',
    subject: 'DevOps Fundamentals',
    date: '2025-12-21',
    startTime: '14:00',
    endTime: '16:30',
    type: 'online',
    status: 'open',
    meetingLink: 'https://meet.google.com/devops',
    maxStudents: 18,
    enrolledStudents: ['s3', 's6'],
    notes: 'CI/CD, Docker, Kubernetes, and cloud deployment'
  }
];

export const mockLibraryResources: LibraryResource[] = [
  {
    id: 'lib1',
    title: 'Introduction to Algorithms (CLRS)',
    type: 'textbook',
    subject: 'Algorithms',
    author: 'Cormen, Leiserson, Rivest, Stein',
    url: '#'
  },
  {
    id: 'lib2',
    title: 'Database System Concepts',
    type: 'textbook',
    subject: 'Database Systems',
    author: 'Silberschatz, Korth, Sudarshan',
    url: '#'
  },
  {
    id: 'lib3',
    title: 'Circuit Analysis: Theory and Practice',
    type: 'textbook',
    subject: 'Circuit Analysis',
    author: 'Robbins, Miller',
    url: '#'
  },
  {
    id: 'lib4',
    title: 'Dynamic Programming Lecture Notes',
    type: 'document',
    subject: 'Algorithms',
    author: 'Dr. Le Minh Chau',
    url: '#'
  },
  {
    id: 'lib5',
    title: 'Data Structures Video Tutorials',
    type: 'video',
    subject: 'Data Structures',
    author: 'HCMUT CS Department',
    url: '#'
  },
  {
    id: 'lib6',
    title: 'Calculus: Early Transcendentals',
    type: 'textbook',
    subject: 'Calculus',
    author: 'James Stewart',
    url: '#'
  },
  {
    id: 'lib7',
    title: 'Linear Algebra and Its Applications',
    type: 'textbook',
    subject: 'Linear Algebra',
    author: 'David C. Lay',
    url: '#'
  },
  {
    id: 'lib8',
    title: 'Digital Design and Computer Architecture',
    type: 'textbook',
    subject: 'Digital Electronics',
    author: 'Harris & Harris',
    url: '#'
  },
  {
    id: 'lib9',
    title: 'Signal Processing First',
    type: 'textbook',
    subject: 'Signal Processing',
    author: 'McClellan, Schafer, Yoder',
    url: '#'
  },
  {
    id: 'lib10',
    title: 'Web Development with React',
    type: 'video',
    subject: 'Web Development',
    author: 'Dr. Nguyen Quoc Khanh',
    url: '#'
  },
  {
    id: 'lib11',
    title: 'Statistics and Probability Theory',
    type: 'textbook',
    subject: 'Statistics',
    author: 'DeGroot & Schervish',
    url: '#'
  },
  {
    id: 'lib12',
    title: 'Control Systems Engineering',
    type: 'textbook',
    subject: 'Control Systems',
    author: 'Norman S. Nise',
    url: '#'
  },
  {
    id: 'lib13',
    title: 'Engineering Mechanics: Statics and Dynamics',
    type: 'textbook',
    subject: 'Engineering Mechanics',
    author: 'Hibbeler',
    url: '#'
  },
  {
    id: 'lib14',
    title: 'Binary Search Trees Tutorial',
    type: 'video',
    subject: 'Data Structures',
    author: 'Dr. Le Minh Chau',
    url: '#'
  },
  {
    id: 'lib15',
    title: 'Advanced SQL Queries Guide',
    type: 'document',
    subject: 'Database Systems',
    author: 'HCMUT CS Department',
    url: '#'
  },
  {
    id: 'lib16',
    title: 'Discrete Mathematics and Its Applications',
    type: 'textbook',
    subject: 'Discrete Mathematics',
    author: 'Kenneth H. Rosen',
    url: '#'
  },
  {
    id: 'lib17',
    title: 'Microprocessor Architecture Programming',
    type: 'document',
    subject: 'Microprocessors',
    author: 'Dr. Do Van Minh',
    url: '#'
  },
  {
    id: 'lib18',
    title: 'Python Programming Basics',
    type: 'video',
    subject: 'Programming',
    author: 'Dr. Nguyen Quoc Khanh',
    url: '#'
  },
  {
    id: 'lib19',
    title: 'Graph Theory and Applications',
    type: 'article',
    subject: 'Algorithms',
    author: 'Dr. Le Minh Chau',
    url: '#'
  },
  {
    id: 'lib20',
    title: 'Circuit Design Lab Manual',
    type: 'document',
    subject: 'Circuit Analysis',
    author: 'HCMUT EE Department',
    url: '#'
  }
];


export const mockMessages: Message[] = [
  // {
  //   id: 'msg1',
  //   senderId: 's1',
  //   receiverId: 't1',
  //   content: 'Hi Dr. Le, could we schedule an extra session for next week? I need help with graph algorithms.',
  //   timestamp: '2025-10-28T10:30:00Z',
  //   read: false,
  //   type: 'regular'
  // },
  // {
  //   id: 'msg2',
  //   senderId: 't1',
  //   receiverId: 's1',
  //   content: 'Hello An! Of course, I have availability on Wednesday at 14:00. Would that work for you?',
  //   timestamp: '2025-10-28T11:00:00Z',
  //   read: true,
  //   type: 'regular'
  // },
  // {
  //   id: 'msg3',
  //   senderId: 's2',
  //   receiverId: 't2',
  //   content: 'Thank you for the last session! The explanations were very clear.',
  //   timestamp: '2025-10-27T16:00:00Z',
  //   read: true,
  //   type: 'regular'
  // },
  // {
  //   id: 'msg4',
  //   senderId: 's1',
  //   receiverId: 't1',
  //   content: 'Session \"Data Structures\" has been rescheduled from 2025-10-25 14:00 to 2025-10-27 15:00. Reason: Student has conflicting exam.',
  //   timestamp: '2025-10-24T09:00:00Z',
  //   read: true,
  //   type: 'reschedule-notification',
  //   relatedSessionId: 'ses1'
  // },
  // {
  //   id: 'msg5',
  //   senderId: 's1',
  //   receiverId: 't1',
  //   content: 'Hi Dr. Le, could I get access to the recording and summary from our last Database Systems session?',
  //   timestamp: '2025-10-29T14:00:00Z',
  //   read: false,
  //   type: 'material-request',
  //   relatedSessionId: 'ses4'
  // },
  // {
  //   id: 'msg6',
  //   senderId: 's3',
  //   receiverId: 't4',
  //   content: 'Dr. Khanh, I have some questions about React hooks. Could we discuss this in our next session?',
  //   timestamp: '2025-11-10T09:00:00Z',
  //   read: true,
  //   type: 'regular'
  // },
  // {
  //   id: 'msg7',
  //   senderId: 't4',
  //   receiverId: 's3',
  //   content: 'Sure thing! Prepare your questions and we\'ll go through them step by step.',
  //   timestamp: '2025-11-10T09:30:00Z',
  //   read: true,
  //   type: 'regular'
  // },
  // {
  //   id: 'msg8',
  //   senderId: 's4',
  //   receiverId: 't3',
  //   content: 'Ms. Hoa, could you recommend some additional practice problems for Linear Algebra?',
  //   timestamp: '2025-11-11T14:00:00Z',
  //   read: false,
  //   type: 'regular'
  // },
  // {
  //   id: 'msg9',
  //   senderId: 's5',
  //   receiverId: 't2',
  //   content: 'Dr. Dung, I\'m having trouble understanding the Laplace transform. Can we cover this in detail?',
  //   timestamp: '2025-11-12T08:30:00Z',
  //   read: true,
  //   type: 'regular'
  // },
  // {
  //   id: 'msg10',
  //   senderId: 't2',
  //   receiverId: 's5',
  //   content: 'Absolutely! The Laplace transform is fundamental for signal processing. Let\'s schedule a dedicated session.',
  //   timestamp: '2025-11-12T09:00:00Z',
  //   read: true,
  //   type: 'regular'
  // },
  // {
  //   id: 'msg11',
  //   senderId: 's6',
  //   receiverId: 't4',
  //   content: 'I really enjoyed the last programming session! Looking forward to the next one.',
  //   timestamp: '2025-11-13T16:00:00Z',
  //   read: true,
  //   type: 'regular'
  // },
  // {
  //   id: 'msg12',
  //   senderId: 's7',
  //   receiverId: 't7',
  //   content: 'Ms. Ngan, could you explain the free body diagram concept again? I want to make sure I understand it fully.',
  //   timestamp: '2025-11-08T10:00:00Z',
  //   read: true,
  //   type: 'regular'
  // },
  // {
  //   id: 'msg13',
  //   senderId: 't7',
  //   receiverId: 's7',
  //   content: 'Of course! Free body diagrams are crucial. I\'ll prepare some extra examples for our next session.',
  //   timestamp: '2025-11-08T10:30:00Z',
  //   read: true,
  //   type: 'regular'
  // },
  // {
  //   id: 'msg14',
  //   senderId: 's8',
  //   receiverId: 't5',
  //   content: 'Prof. Linh, can I request access to your probability lecture slides?',
  //   timestamp: '2025-11-09T15:00:00Z',
  //   read: false,
  //   type: 'regular'
  // },
  // {
  //   id: 'msg15',
  //   senderId: 's9',
  //   receiverId: 't1',
  //   content: 'Dr. Le, I need help preparing for my algorithms midterm. Are you available this weekend?',
  //   timestamp: '2025-11-07T12:00:00Z',
  //   read: true,
  //   type: 'regular'
  // },
  // {
  //   id: 'msg16',
  //   senderId: 't1',
  //   receiverId: 's9',
  //   content: 'I have some time on Saturday afternoon. Let\'s set up a session to review the key concepts.',
  //   timestamp: '2025-11-07T13:00:00Z',
  //   read: true,
  //   type: 'regular'
  // },
  // {
  //   id: 'msg17',
  //   senderId: 's10',
  //   receiverId: 't6',
  //   content: 'Dr. Minh, the control systems lab was amazing! Thanks for the hands-on experience.',
  //   timestamp: '2025-11-06T17:00:00Z',
  //   read: true,
  //   type: 'regular'
  // },
  // {
  //   id: 'msg18',
  //   senderId: 's3',
  //   receiverId: 't1',
  //   content: 'Hi Dr. Le, I\'m interested in joining your Programming Workshop. Is there still space?',
  //   timestamp: '2025-11-14T10:00:00Z',
  //   read: false,
  //   type: 'regular'
  // },
  // {
  //   id: 'msg19',
  //   senderId: 't3',
  //   receiverId: 's4',
  //   content: 'Great work on the calculus assignment! Your understanding of integration is improving.',
  //   timestamp: '2025-11-05T14:00:00Z',
  //   read: true,
  //   type: 'regular'
  // },
  // {
  //   id: 'msg20',
  //   senderId: 's2',
  //   receiverId: 't2',
  //   content: 'Could I request access to the recording from our Digital Electronics session?',
  //   timestamp: '2025-10-19T10:00:00Z',
  //   read: true,
  //   type: 'material-request',
  //   relatedSessionId: 'ses5'
  // }
];


export const mockRescheduleRequests: RescheduleRequest[] = [
  {
    id: 'rr1',
    sessionId: 'ses1',
    requesterId: 's1',
    requesterRole: 'student',
    newDate: '2025-10-27',
    newStartTime: '15:00',
    newEndTime: '16:30',
    reason: 'I have a conflicting exam on the original date.',
    status: 'pending',
    createdAt: '2025-10-24T08:00:00Z'
  },
  {
    id: 'rr2',
    sessionId: 'ses3',
    requesterId: 's2',
    requesterRole: 'student',
    newDate: '2025-10-28',
    newStartTime: '10:00',
    newEndTime: '11:30',
    reason: 'Would like to move the session to next week.',
    status: 'pending',
    createdAt: '2025-10-25T10:00:00Z'
  }
];


export const mockStudentEvaluations: StudentEvaluation[] = [
  {
    id: 'eval1',
    studentId: 's1',
    tutorId: 't1',
    sessionId: 'ses2',
    skills: {
      understanding: 4,
      participation: 5,
      preparation: 4
    },
    attitude: 5,
    testResults: {
      score: 85,
      maxScore: 100,
      notes: 'Strong performance on dynamic programming problems'
    },
    overallProgress: 'Excellent progress. Student has shown significant improvement in algorithmic thinking and problem-solving skills.',
    recommendations: 'Continue practicing more advanced algorithms. Ready to move on to graph algorithms.',
    createdAt: '2025-10-20T16:30:00Z'
  },
  {
    id: 'eval2',
    studentId: 's1',
    tutorId: 't1',
    sessionId: 'ses4',
    skills: {
      understanding: 4,
      participation: 4,
      preparation: 5
    },
    attitude: 5,
    overallProgress: 'Good understanding of database normalization and SQL joins. Student came well-prepared with questions.',
    recommendations: 'Practice more complex queries involving multiple joins and subqueries.',
    createdAt: '2025-10-15T17:00:00Z'
  },
  {
    id: 'eval3',
    studentId: 's2',
    tutorId: 't2',
    sessionId: 'ses5',
    skills: {
      understanding: 5,
      participation: 4,
      preparation: 4
    },
    attitude: 4,
    testResults: {
      score: 92,
      maxScore: 100,
      notes: 'Excellent understanding of boolean algebra'
    },
    overallProgress: 'Outstanding performance in Digital Electronics. Student grasps concepts quickly.',
    recommendations: 'Ready for advanced topics in sequential circuits.',
    createdAt: '2025-10-18T12:00:00Z'
  }
];