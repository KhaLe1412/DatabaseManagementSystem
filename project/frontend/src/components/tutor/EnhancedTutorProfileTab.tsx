import React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Video,
  Lock,
  Edit,
  Star,
  FileText,
} from "lucide-react";
import { Tutor, Session, Student } from "../../types";
import { toast } from "sonner";
import {
  apiGet,
  apiPatch,
  apiPost,
  apiDelete,
  apiPut,
  mapSession,
} from "../../lib/api";

interface EnhancedTutorProfileTabProps {
  tutor: Tutor;
}

interface SessionReview {
  sessionId: string;
  rating?: number;
  summary?: string;
  recordingUrl?: string;
}

interface SubjectOption {
  subject_id: string;
  subject_name: string;
}

export function EnhancedTutorProfileTab({
  tutor,
}: EnhancedTutorProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [expertise, setExpertise] = useState(tutor.expertise);
  const [name, setName] = useState(tutor.name);
  const [email, setEmail] = useState(tutor.email);
  const [showAddExpertiseDialog, setShowAddExpertiseDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] =
    useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [currentReviewSessionId, setCurrentReviewSessionId] = useState<
    string | null
  >(null);
  // subject_name -> subject_id map for current tutor subjects
  const [subjectIdMap, setSubjectIdMap] = useState<Record<string, string>>({});
  // all available subjects from DB
  const [allSubjects, setAllSubjects] = useState<SubjectOption[]>([]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // State to store session reviews
  const [sessionReviews, setSessionReviews] = useState<
    Record<string, SessionReview>
  >({});

  const [reviewData, setReviewData] = useState({
    summary: "",
    recordingUrl: "",
  });

  // State for fetched data
  const [completedSessions, setCompletedSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    handleProfile();
    fetchSubjects();
  }, [tutor.id]);

  // Fetch current tutor subjects and all available subjects
  const fetchSubjects = async () => {
    try {
      const [userSubsResp, allSubsResp] = await Promise.all([
        apiGet<{ subjects: SubjectOption[] }>(`/users/${tutor.id}/subjects`),
        apiGet<{ subjects: SubjectOption[] }>("/subjects"),
      ]);
      const userSubs = userSubsResp.subjects ?? [];
      const map: Record<string, string> = {};
      userSubs.forEach((s) => {
        map[s.subject_name] = s.subject_id;
      });
      setSubjectIdMap(map);
      setExpertise(userSubs.map((s) => s.subject_name));
      setAllSubjects(allSubsResp.subjects ?? []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  // Fetch completed sessions and students from API (backend returns mock data)
  const handleProfile = async () => {
    try {
      const data = await apiGet<{ sessions: Record<string, unknown>[] }>(
        `/sessions?tutorId=${tutor.id}&status=completed`,
      );

      const sessions = data.sessions.map(mapSession);
      const sortedSessions = sessions.sort((a: Session, b: Session) => {
        const dateCompare =
          new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return b.startTime.localeCompare(a.startTime);
      });

      setCompletedSessions(sortedSessions);

      // Batch-fetch reviews for each completed session
      const reviewsResults = await Promise.allSettled(
        sortedSessions.map((s: Session) =>
          apiGet<{ reviews: any[] }>(`/sessions/${s.id}/reviews`),
        ),
      );
      const sessionsWithReviews = sortedSessions.map(
        (s: Session, i: number) => {
          const result = reviewsResults[i];
          if (result.status === "fulfilled") {
            const raw = result.value.reviews ?? [];
            s.reviews = raw.map((r: any) => ({
              studentId: r.student_id ?? r.studentId ?? "",
              rating: r.rating,
              comment: r.comment ?? "",
              submittedAt: r.updated_at ?? r.submittedAt ?? "",
            }));
          }
          return s;
        },
      );
      setCompletedSessions(sessionsWithReviews);

      // Fetch enrolled students separately
      const allStudentIds = new Set<string>();
      sessions.forEach((s) =>
        s.enrolledStudents?.forEach((id) => allStudentIds.add(id)),
      );

      if (allStudentIds.size > 0) {
        const studentsData = await apiGet<{
          users: {
            id: string;
            name: string;
            email: string;
            studentId?: string;
          }[];
        }>("/users?role=student&limit=100");
        setStudents(
          studentsData.users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: "student" as const,
            avatar: undefined,
            studentId: u.studentId ?? "",
            department: "",
            year: 1,
            supportNeeds: [],
            gpa: 0,
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load session history");
    }
  };

  const filteredSessions = completedSessions.filter((session) => {
    const enrolledStudents = students.filter((s) =>
      session.enrolledStudents.includes(s.id),
    );
    const searchLower = searchQuery.toLowerCase();
    return (
      session.subject.toLowerCase().includes(searchLower) ||
      session.date.includes(searchLower) ||
      enrolledStudents.some((s) =>
        s.name.toLowerCase().includes(searchLower),
      ) ||
      enrolledStudents.some((s) =>
        s.studentId.toLowerCase().includes(searchLower),
      )
    );
  });

  const handleSaveProfile = async () => {
    try {
      await apiPut(`/users/${tutor.id}`, {
        name,
        department: tutor.department,
      });
      window.dispatchEvent(new Event("profileUpdated"));
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleAddExpertise = async () => {
    const subjectObj = allSubjects.find(
      (s) => s.subject_id === selectedSubject,
    );
    if (!subjectObj) return;
    if (expertise.includes(subjectObj.subject_name)) {
      toast.error("Subject already added");
      return;
    }
    try {
      await apiPost(`/users/${tutor.id}/subjects`, {
        subject_id: subjectObj.subject_id,
      });
      setSubjectIdMap((prev) => ({
        ...prev,
        [subjectObj.subject_name]: subjectObj.subject_id,
      }));
      setExpertise((prev) => [...prev, subjectObj.subject_name]);
      toast.success(`Added ${subjectObj.subject_name} to your expertise`);
      setShowAddExpertiseDialog(false);
      setSelectedSubject("");
    } catch (error) {
      console.error("Error adding subject:", error);
      toast.error("Failed to add subject");
    }
  };

  const handleRemoveExpertise = async (exp: string) => {
    const subjectId = subjectIdMap[exp];
    if (!subjectId) return;
    try {
      await apiDelete(`/users/${tutor.id}/subjects/${subjectId}`);
      setExpertise((prev) => prev.filter((e) => e !== exp));
      setSubjectIdMap((prev) => {
        const m = { ...prev };
        delete m[exp];
        return m;
      });
      toast.success(`Removed ${exp} from your expertise`);
    } catch (error) {
      console.error("Error removing subject:", error);
      toast.error("Failed to remove subject");
    }
  };

  const handleChangePassword = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      // Vì không có database, chỉ simulate việc đổi mật khẩu
      // Trong tương lai có thể gọi API: POST /api/auth/change-password
      // const response = await fetch(`${API_BASE_URL}/auth/change-password`, {...});

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success("Password changed successfully!");
      setChangePasswordDialogOpen(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    }
  };

  const handleOpenReviewDialog = (sessionId: string) => {
    setCurrentReviewSessionId(sessionId);
    const session = completedSessions.find((s) => s.id === sessionId);
    setReviewData({
      summary: session?.summary || "",
      recordingUrl: session?.recordingUrl || "",
    });
    setReviewDialogOpen(true);
  };

  const handleSaveReview = async () => {
    if (!currentReviewSessionId) return;

    if (!reviewData.summary.trim()) {
      toast.error("Please provide a summary");
      return;
    }

    try {
      await apiPatch(`/sessions/${currentReviewSessionId}`, {
        updateData: {
          summary: reviewData.summary,
          recordingUrl: reviewData.recordingUrl || undefined,
        },
      });

      await handleProfile();

      toast.success("Session feedback saved successfully!");
      setReviewDialogOpen(false);
      setCurrentReviewSessionId(null);
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast.error("Failed to save feedback");
    }
  };

  // Filter available subjects to exclude already added ones
  const availableToAdd = allSubjects.filter(
    (s) => !expertise.includes(s.subject_name),
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tutor Profile</CardTitle>
              <CardDescription>
                Manage your professional information
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Full Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Tutor ID</Label>
              <Input value={tutor.tutorId} disabled className="mt-2" />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Department</Label>
              <Input value={tutor.department} disabled className="mt-2" />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={() => setChangePasswordDialogOpen(true)}
              variant="outline"
            >
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Areas of Expertise</CardTitle>
              <CardDescription>
                Subjects and topics you can teach
              </CardDescription>
            </div>
            {isEditing && (
              <Dialog
                open={showAddExpertiseDialog}
                onOpenChange={setShowAddExpertiseDialog}
              >
                <DialogTrigger asChild>
                  <Button size="sm">Add Subject</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Area of Expertise</DialogTitle>
                    <DialogDescription>
                      Select a subject you can teach
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Subject</Label>
                      <Select
                        value={selectedSubject}
                        onValueChange={setSelectedSubject}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableToAdd.map((s) => (
                            <SelectItem key={s.subject_id} value={s.subject_id}>
                              {s.subject_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddExpertiseDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddExpertise}>Add</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {expertise.length === 0 ? (
              <p className="text-sm text-gray-500">No expertise added yet</p>
            ) : (
              expertise.map((exp) => (
                <Badge
                  key={exp}
                  variant="secondary"
                  className={isEditing ? "cursor-pointer hover:bg-red-100" : ""}
                  onClick={() => isEditing && handleRemoveExpertise(exp)}
                >
                  {exp}
                  {isEditing && <span className="ml-2">×</span>}
                </Badge>
              ))
            )}
          </div>
          {isEditing && (
            <p className="text-sm text-gray-600">
              Click on a badge to remove it, or click "Add Subject" to add more
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">{tutor.totalSessions}</div>
              <p className="text-sm text-gray-600">Total Sessions</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">{tutor.rating}</div>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">{students.length}</div>
              <p className="text-sm text-gray-600">Students Helped</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
          <CardDescription>
            View and review your completed sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by subject, student name, or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredSessions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {searchQuery
                ? "No sessions found matching your search"
                : "No completed sessions yet"}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((session) => {
                const enrolledStudents = students.filter((s) =>
                  session.enrolledStudents.includes(s.id),
                );

                return (
                  <div
                    key={session.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p>{session.subject}</p>
                        <p className="text-sm text-gray-600">
                          {enrolledStudents
                            .map((s) => `${s.name} (${s.studentId})`)
                            .join(", ")}
                        </p>
                      </div>
                      <Badge>{session.type}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{session.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          {session.startTime} - {session.endTime}
                        </span>
                      </div>
                      {session.type === "in-person" && session.location && (
                        <div className="flex items-center gap-2 text-gray-600 col-span-2">
                          <MapPin className="h-4 w-4" />
                          <span>{session.location}</span>
                        </div>
                      )}
                    </div>

                    {(session.summary || session.recordingUrl) && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded p-3 mb-3">
                        <p className="text-xs font-medium text-indigo-700 mb-2">
                          Session Summary & Recording
                        </p>
                        {session.summary && (
                          <p className="text-sm mb-2">{session.summary}</p>
                        )}
                        {session.recordingUrl && (
                          <div>
                            <p className="text-xs text-gray-600 mb-1">
                              Recording URL:
                            </p>
                            <a
                              href={session.recordingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline break-all"
                            >
                              {session.recordingUrl}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {session.reviews && session.reviews.length > 0 && (
                      <div className="pt-3 border-t space-y-3 mb-3">
                        <p className="text-sm">Student Reviews:</p>
                        {session.reviews
                          .slice(0, 3)
                          .map((studentReview, idx) => {
                            const student = students.find(
                              (s) => s.id === studentReview.studentId,
                            );
                            return (
                              <div key={idx} className="bg-gray-50 rounded p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-sm">{student?.name}</p>
                                  <span className="text-sm">
                                    {studentReview.rating}/5 ⭐
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {studentReview.comment}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(
                                    studentReview.submittedAt,
                                  ).toLocaleString()}
                                </p>
                              </div>
                            );
                          })}
                        {session.reviews.length > 3 && (
                          <p className="text-xs text-gray-500">
                            and {session.reviews.length - 3} more review
                            {session.reviews.length - 3 > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenReviewDialog(session.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {session.summary || session.recordingUrl
                          ? "Edit Summary & Recording"
                          : "Add Summary & Recording"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="py-6">
          <p className="mb-2">Tutor Recognition</p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl">Outstanding Tutor</span>
          </div>
          <p className="text-sm text-gray-600">
            Your excellent performance and student feedback have earned you
            recognition from the Office of Academic Affairs. Keep up the great
            work!
          </p>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Summary & Recording</DialogTitle>
            <DialogDescription>
              {completedSessions.find((s) => s.id === currentReviewSessionId)
                ?.summary
                ? "Edit the summary and recording link you have already posted for this session."
                : "Post a summary and recording link for this session. You can edit it later."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Session Summary *</Label>
              <Textarea
                value={reviewData.summary}
                onChange={(e) =>
                  setReviewData({ ...reviewData, summary: e.target.value })
                }
                placeholder="Describe what was covered, student's progress, and any recommendations..."
                className="mt-2"
                rows={5}
              />
            </div>
            <div>
              <Label>Recording URL (Optional)</Label>
              <Input
                value={reviewData.recordingUrl}
                onChange={(e) =>
                  setReviewData({ ...reviewData, recordingUrl: e.target.value })
                }
                placeholder="https://example.com/recordings/session.mp4"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add a link to the recording of this session
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveReview}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={changePasswordDialogOpen}
        onOpenChange={setChangePasswordDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Update your account password</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Password</Label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className="mt-2"
              />
            </div>
            <p className="text-sm text-gray-600">
              Password must be at least 6 characters long
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChangePasswordDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
