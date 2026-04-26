import React, { useState, useEffect } from "react";
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
  Lock,
  Star,
  Edit,
  Download,
  Loader2,
} from "lucide-react";
import { Student, Session, Tutor } from "../../types";
import { toast } from "sonner";
import { apiGet, apiPatch, apiPost, apiDelete, apiPut } from "../../lib/api";

interface EnhancedProfileTabProps {
  student: Student;
}

interface SessionReview {
  sessionId: string;
  rating?: number;
  comment?: string;
}

interface SubjectOption {
  subject_id: string;
  subject_name: string;
}

export function EnhancedProfileTab({ student }: EnhancedProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [supportNeeds, setSupportNeeds] = useState(student.supportNeeds);
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [showAddSubjectDialog, setShowAddSubjectDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  // subject_name -> subject_id map for current user subjects
  const [subjectIdMap, setSubjectIdMap] = useState<Record<string, string>>({});
  // all available subjects from DB
  const [allSubjects, setAllSubjects] = useState<SubjectOption[]>([]);

  // Dialog states
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] =
    useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  // Loading state cho việc gọi API
  const [isLoading, setIsLoading] = useState(false);

  const [currentReviewSessionId, setCurrentReviewSessionId] = useState<
    string | null
  >(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
  });

  // State to store session reviews
  const [sessionReviews, setSessionReviews] = useState<
    Record<string, SessionReview>
  >({});

  // State for fetched data
  const [completedSessions, setCompletedSessions] = useState<Session[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    handleOverview();
    fetchSubjects();
  }, [student.id]);

  // Fetch current user subjects and all available subjects
  const fetchSubjects = async () => {
    try {
      const [userSubsResp, allSubsResp] = await Promise.all([
        apiGet<{ subjects: SubjectOption[] }>(`/users/${student.id}/subjects`),
        apiGet<{ subjects: SubjectOption[] }>("/subjects"),
      ]);
      const userSubs = userSubsResp.subjects ?? [];
      const map: Record<string, string> = {};
      userSubs.forEach((s) => {
        map[s.subject_name] = s.subject_id;
      });
      setSubjectIdMap(map);
      setSupportNeeds(userSubs.map((s) => s.subject_name));
      setAllSubjects(allSubsResp.subjects ?? []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  // Fetch completed sessions and tutors from API
  const handleOverview = async () => {
    try {
      setIsLoading(true);
      const resp = await apiGet<{ sessions: any[] }>(
        `/sessions?studentId=${student.id}&status=completed`,
      );
      // Response format: { sessions: [...flat session objects...] }
      const data = resp.sessions ?? [];

      // Map snake_case backend fields to camelCase Session type
      const sessions: Session[] = data.map((item: any) => ({
        id: item.session_id ?? item.id,
        tutorId: item.tutor_id ?? item.tutorId,
        subject: item.subject,
        date: item.date,
        startTime: item.start_time ?? item.startTime,
        endTime: item.end_time ?? item.endTime,
        type: item.type,
        status: item.status,
        location: item.location,
        meetingLink: item.meeting_link ?? item.meetingLink,
        notes: item.notes,
        summary: item.summary,
        recordingUrl: item.recording_url ?? item.recordingUrl,
        maxStudents: item.max_students ?? item.maxStudents ?? 0,
        enrolledStudents: item.enrolledStudents ?? [],
      }));
      setCompletedSessions(sessions);

      // Batch-fetch reviews for each completed session
      const reviewsResults = await Promise.allSettled(
        sessions.map((s) =>
          apiGet<{ reviews: any[] }>(`/sessions/${s.id}/reviews`),
        ),
      );
      const sessionsWithReviews = sessions.map((s, i) => {
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
      });
      setCompletedSessions(sessionsWithReviews);

      // Extract unique tutors from tutorName / tutor_id fields
      const allTutors = new Map<string, Tutor>();
      data.forEach((item: any) => {
        const tid = item.tutor_id;
        if (tid && !allTutors.has(tid)) {
          allTutors.set(tid, { id: tid, name: item.tutorName ?? tid } as Tutor);
        }
      });

      setTutors(Array.from(allTutors.values()));
    } catch (error) {
      console.error("Error fetching overview data:", error);
      toast.error("Failed to load session history");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter completed sessions by search query
  const filteredSessions = completedSessions.filter((session) => {
    const tutor = tutors.find((t) => t.id === session.tutorId);
    const searchLower = searchQuery.toLowerCase();
    return (
      session.subject.toLowerCase().includes(searchLower) ||
      session.date.includes(searchLower) ||
      tutor?.name.toLowerCase().includes(searchLower)
    );
  });

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      await apiPut(`/users/${student.id}`, {
        name,
        department: student.department,
      });
      // Trigger event để App.tsx refresh data
      window.dispatchEvent(new Event("profileUpdated"));
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubject = async () => {
    const subjectObj = allSubjects.find(
      (s) => s.subject_id === selectedSubject,
    );
    if (!subjectObj) return;
    if (supportNeeds.includes(subjectObj.subject_name)) {
      toast.error("Subject already added");
      return;
    }
    try {
      await apiPost(`/users/${student.id}/subjects`, {
        subject_id: subjectObj.subject_id,
      });
      setSubjectIdMap((prev) => ({
        ...prev,
        [subjectObj.subject_name]: subjectObj.subject_id,
      }));
      setSupportNeeds((prev) => [...prev, subjectObj.subject_name]);
      toast.success(`Added ${subjectObj.subject_name} to your support needs`);
      setShowAddSubjectDialog(false);
      setSelectedSubject("");
    } catch (error) {
      console.error("Error adding subject:", error);
      toast.error("Failed to add subject");
    }
  };

  const handleRemoveNeed = async (need: string) => {
    const subjectId = subjectIdMap[need];
    if (!subjectId) return;
    try {
      await apiDelete(`/users/${student.id}/subjects/${subjectId}`);
      setSupportNeeds((prev) => prev.filter((n) => n !== need));
      setSubjectIdMap((prev) => {
        const m = { ...prev };
        delete m[need];
        return m;
      });
      toast.success(`Removed ${need} from your support needs`);
    } catch (error) {
      console.error("Error removing subject:", error);
      toast.error("Failed to remove subject");
    }
  };

  // --- HÀM XỬ LÝ ĐỔI MẬT KHẨU (GỌI API) ---
  const handleChangePassword = async () => {
    // 1. Validate Client
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

    setIsLoading(true);

    try {
      // Vì không có database, chỉ simulate việc đổi mật khẩu
      // Trong tương lai có thể gọi API: POST /api/auth/change-password
      // const response = await fetch(`${API_BASE_URL}/auth/change-password`, {...});

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 3. Thành công
      toast.success("Password changed successfully!");
      setChangePasswordDialogOpen(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Server error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReviewDialog = (sessionId: string) => {
    setCurrentReviewSessionId(sessionId);
    const session = completedSessions.find((s) => s.id === sessionId);
    const existingReview =
      sessionReviews[sessionId] ||
      session?.reviews?.find((r) => r.studentId === student.id);
    if (existingReview) {
      setReviewData({
        rating: existingReview.rating || 5,
        comment: existingReview.comment || "",
      });
    } else {
      setReviewData({
        rating: 5,
        comment: "",
      });
    }
    setReviewDialogOpen(true);
  };

  const handleSaveReview = async () => {
    if (!currentReviewSessionId) return;

    if (!reviewData.comment.trim()) {
      toast.error("Please provide a comment");
      return;
    }

    try {
      await apiPost(`/sessions/${currentReviewSessionId}/review`, {
        studentId: student.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });

      // Update local state
      setSessionReviews((prev) => ({
        ...prev,
        [currentReviewSessionId]: {
          sessionId: currentReviewSessionId,
          rating: reviewData.rating,
          comment: reviewData.comment,
        },
      }));

      await handleOverview();

      toast.success("Session review saved successfully!");
      setReviewDialogOpen(false);
      setCurrentReviewSessionId(null);
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Failed to save review");
    }
  };

  const availableToAdd = allSubjects.filter(
    (s) => !supportNeeds.includes(s.subject_name),
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Manage your profile and preferences
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
              <Label>Student ID</Label>
              <Input value={student.studentId} disabled className="mt-2" />
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
              <Input value={student.department} disabled className="mt-2" />
            </div>
            <div>
              <Label>Year</Label>
              <Input
                value={student.year}
                type="number"
                disabled
                className="mt-2"
              />
            </div>
            <div>
              <Label>Current GPA</Label>
              <Input
                value={student.gpa}
                type="number"
                step="0.01"
                disabled
                className="mt-2"
              />
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
              <CardTitle>Support Needs</CardTitle>
              <CardDescription>Subjects you need help with</CardDescription>
            </div>
            {isEditing && (
              <Dialog
                open={showAddSubjectDialog}
                onOpenChange={setShowAddSubjectDialog}
              >
                <DialogTrigger asChild>
                  <Button size="sm">Add Subject</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Support Need</DialogTitle>
                    <DialogDescription>
                      Select a subject you need help with
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
                      onClick={() => setShowAddSubjectDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddSubject}>Add</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {supportNeeds.length === 0 ? (
              <p className="text-sm text-gray-500">
                No support needs added yet
              </p>
            ) : (
              supportNeeds.map((need) => (
                <Badge
                  key={need}
                  variant="secondary"
                  className={isEditing ? "cursor-pointer hover:bg-red-100" : ""}
                  onClick={() => isEditing && handleRemoveNeed(need)}
                >
                  {need}
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
          <CardTitle>Session History</CardTitle>
          <CardDescription>
            View all your completed tutoring sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by subject, tutor name, or date..."
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
                const tutor = tutors.find((t) => t.id === session.tutorId);
                const review =
                  sessionReviews[session.id] ||
                  session.reviews?.find((r) => r.studentId === student.id);

                return (
                  <div
                    key={session.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={tutor?.avatar} />
                          <AvatarFallback>
                            {tutor?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p>{session.subject}</p>
                          <p className="text-sm text-gray-600">{tutor?.name}</p>
                        </div>
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
                          <Button size="sm" variant="outline" asChild>
                            <a
                              href={session.recordingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Watch Recording
                            </a>
                          </Button>
                        )}
                      </div>
                    )}

                    {review && (
                      <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm">
                            Your Rating: {review.rating}/5
                          </span>
                        </div>
                        {review.comment && (
                          <div>
                            <p className="text-xs text-gray-600 mb-1">
                              Your Review:
                            </p>
                            <p className="text-sm">{review.comment}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {session.feedback?.tutorProgress && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                        <p className="text-xs text-gray-600 mb-1">
                          Tutor Notes:
                        </p>
                        <p className="text-sm">
                          {session.feedback.tutorProgress}
                        </p>
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenReviewDialog(session.id)}
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {review ? "Edit Review" : "Add Review"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

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
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Review</DialogTitle>
            <DialogDescription>Rate and review your session</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating (1-5)</Label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    onClick={() => setReviewData({ ...reviewData, rating })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        rating <= reviewData.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  </Button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {reviewData.rating}/5
                </span>
              </div>
            </div>
            <div>
              <Label>Review Comment</Label>
              <Textarea
                value={reviewData.comment}
                onChange={(e) =>
                  setReviewData({ ...reviewData, comment: e.target.value })
                }
                placeholder="Share your experience with this session..."
                className="mt-2"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveReview}>Save Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
