import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  X,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { mockSessions, mockTutors } from "../../lib/mock-data";
import { Student, Tutor, Session } from "../../types";
import { toast } from "sonner";
import { apiGet, apiPost } from "../../lib/api";

interface EnhancedMySessionsTabProps {
  student: Student;
}

export function EnhancedMySessionsTab({ student }: EnhancedMySessionsTabProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);

  const [rescheduleData, setRescheduleData] = useState({
    newDate: "",
    newStartTime: "",
    newEndTime: "",
    reason: "",
  });

  const [studentSessions, setStudentSessions] = useState<Session[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);

  const mapSession = (r: any): Session => ({
    id: r.session_id ?? r.id,
    tutorId: r.tutor_id ?? r.tutorId,
    tutorName: r.tutorName,
    subject: r.subject,
    date: r.date,
    startTime: r.start_time ?? r.startTime,
    endTime: r.end_time ?? r.endTime,
    type: r.type,
    status: r.status,
    location: r.location,
    meetingLink: r.meeting_link ?? r.meetingLink,
    notes: r.notes,
    summary: r.summary,
    recordingUrl: r.recording_url ?? r.recordingUrl,
    maxStudents: r.max_students ?? r.maxStudents ?? 0,
    enrolledStudents: r.enrolledStudents ?? [],
  });

  const handleFetchData = async () => {
    try {
      const [sessionResp, tutorResp] = await Promise.all([
        apiGet<{ sessions: any[] }>(`/sessions?studentId=${student.id}`),
        apiGet<{ users: any[] }>("/users?role=tutor"),
      ]);
      setStudentSessions((sessionResp.sessions ?? []).map(mapSession));
      setTutors(tutorResp.users ?? []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      toast.error("Cannot load session data, please try again.");
    }
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  // Only show open (upcoming) sessions in the calendar
  const openSessions = studentSessions.filter((s) => s.status === "open");

  const selectedSession = openSessions.find((s) => s.id === selectedSessionId);

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getSessionsForDate = (date: Date) => {
    // Cách cũ gây lỗi lệch múi giờ:
    // const dateString = date.toISOString().split('T')[0];

    // Cách mới: Tự tạo chuỗi YYYY-MM-DD theo giờ địa phương
    const year = date.getFullYear();
    // getMonth() trả về 0-11 nên cần +1, padStart để thêm số 0 đằng trước nếu cần
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const dateString = `${year}-${month}-${day}`;

    return openSessions.filter((s) => s.date === dateString);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const { daysInMonth, startingDayOfWeek, year, month } =
    getDaysInMonth(currentMonth);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleOpenReschedule = () => {
    if (selectedSession) {
      setRescheduleData({
        newDate: selectedSession.date,
        newStartTime: selectedSession.startTime,
        newEndTime: selectedSession.endTime,
        reason: "",
      });
      setRescheduleDialogOpen(true);
    }
  };

  const handleSubmitRescheduleRequest = async () => {
    if (
      !rescheduleData.newDate ||
      !rescheduleData.newStartTime ||
      !rescheduleData.newEndTime ||
      !rescheduleData.reason
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!selectedSession) {
      toast.error("No session selected");
      return;
    }

    try {
      const payload = {
        studentId: student.id,
        sessionId: selectedSession.id,
        proposedDate: rescheduleData.newDate,
        proposedStartTime: rescheduleData.newStartTime,
        proposedEndTime: rescheduleData.newEndTime,
        reason: rescheduleData.reason,
      };

      await apiPost(`/reschedule-requests`, payload);

      toast.success("Reschedule request sent to the tutor.");

      // Reset UI
      setRescheduleDialogOpen(false);
      setSelectedSessionId(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send reschedule request. Please try again.");
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    try {
      await apiPost(`/sessions/${sessionId}/leave`, { studentId: student.id });
      toast.success("Left session successfully!");
      setSelectedSessionId(null);
      handleFetchData();
    } catch (error: any) {
      console.error(error);
      toast.error(
        `Failed to leave session: ${error?.message ?? String(error)}`,
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Sessions Calendar</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[150px] text-center">
                {monthNames[month]} {year}
              </span>
              <Button variant="outline" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Click on a session to view details, reschedule, or cancel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm border-b">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="min-h-[100px] p-2 border rounded-lg bg-gray-50"
              />
            ))}

            {/* Calendar days */}
            {Array.from({ length: daysInMonth }).map((_, dayIdx) => {
              const day = dayIdx + 1;
              const date = new Date(year, month, day);
              const sessionsOnDate = getSessionsForDate(date);
              const isToday = new Date().toDateString() === date.toDateString();

              return (
                <div
                  key={day}
                  className={`min-h-[100px] p-2 border rounded-lg ${isToday ? "bg-blue-50 border-blue-300" : "bg-white"}`}
                >
                  <div className="text-sm mb-1">
                    <span
                      className={
                        isToday ? "font-bold text-blue-700" : "text-gray-600"
                      }
                    >
                      {day}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {sessionsOnDate.map((session) => {
                      const sessionColor =
                        session.type === "online"
                          ? "bg-blue-100 hover:bg-blue-200 border-blue-300"
                          : "bg-green-100 hover:bg-green-200 border-green-300";
                      return (
                        <div
                          key={session.id}
                          onClick={() => setSelectedSessionId(session.id)}
                          className={`text-xs p-1.5 rounded cursor-pointer border ${sessionColor}`}
                        >
                          <p className="truncate">{session.subject}</p>
                          <p className="text-gray-600">{session.startTime}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Session Detail Dialog */}
      <Dialog
        open={!!selectedSessionId}
        onOpenChange={(open: boolean) => !open && setSelectedSessionId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>View and manage this session</DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Subject</p>
                <p>{selectedSession.subject}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Tutor</p>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        tutors.find((t) => t.id === selectedSession.tutorId)
                          ?.avatar
                      }
                    />
                    <AvatarFallback>
                      {(
                        selectedSession.tutorName ??
                        tutors.find((t) => t.id === selectedSession.tutorId)
                          ?.name ??
                        "?"
                      ).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {selectedSession.tutorName ??
                      tutors.find((t) => t.id === selectedSession.tutorId)
                        ?.name ??
                      selectedSession.tutorId}
                  </span>
                </div>
              </div>

              {selectedSession.status === "open" && (
                <div>
                  <p className="text-sm text-gray-600">Enrolled Students</p>
                  <p>
                    {selectedSession.enrolledStudents?.length || 0} /{" "}
                    {selectedSession.maxStudents}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedSession.date}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {selectedSession.startTime} - {selectedSession.endTime}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Type</p>
                <Badge>{selectedSession.type}</Badge>
              </div>

              {selectedSession.type === "in-person" &&
                selectedSession.location && (
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedSession.location}</span>
                    </div>
                  </div>
                )}

              {selectedSession.type === "online" &&
                selectedSession.meetingLink && (
                  <div>
                    <p className="text-sm text-gray-600">Meeting Link</p>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <a
                        href={selectedSession.meetingLink}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {selectedSession.meetingLink}
                      </a>
                    </div>
                  </div>
                )}

              {selectedSession.notes && (
                <div>
                  <p className="text-sm text-gray-600">Notes</p>
                  <p className="text-sm bg-gray-50 p-2 rounded">
                    {selectedSession.notes}
                  </p>
                </div>
              )}

              {selectedSession.status === "open" && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleOpenReschedule}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Request Reschedule
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCancelSession(selectedSession.id)}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Leave Session
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule Request Dialog */}
      <Dialog
        open={rescheduleDialogOpen}
        onOpenChange={setRescheduleDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request to Reschedule Session</DialogTitle>
            <DialogDescription>
              Request a new date and time for your session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Date *</Label>
              <Input
                type="date"
                value={rescheduleData.newDate}
                onChange={(e) =>
                  setRescheduleData({
                    ...rescheduleData,
                    newDate: e.target.value,
                  })
                }
                className="mt-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={rescheduleData.newStartTime}
                  onChange={(e) =>
                    setRescheduleData({
                      ...rescheduleData,
                      newStartTime: e.target.value,
                    })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label>End Time *</Label>
                <Input
                  type="time"
                  value={rescheduleData.newEndTime}
                  onChange={(e) =>
                    setRescheduleData({
                      ...rescheduleData,
                      newEndTime: e.target.value,
                    })
                  }
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label>Reason for Rescheduling *</Label>
              <Textarea
                placeholder="Please explain why you need to reschedule..."
                value={rescheduleData.reason}
                onChange={(e) =>
                  setRescheduleData({
                    ...rescheduleData,
                    reason: e.target.value,
                  })
                }
                rows={3}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRescheduleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitRescheduleRequest}>
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
