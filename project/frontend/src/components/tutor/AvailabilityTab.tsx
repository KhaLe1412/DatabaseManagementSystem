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
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Plus,
  CheckCircle,
  XCircle,
  Edit,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { Tutor, Session } from "../../types";
//import { mockSessions, mockStudents } from '../../lib/mock-data';
import { toast } from "sonner";
import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
  mapSession,
} from "../../lib/api";

interface AvailabilityTabProps {
  tutor: Tutor;
}

export function AvailabilityTab({ tutor }: AvailabilityTabProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [sessionType, setSessionType] = useState<"individual" | "open">("open");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);

  const [newSession, setNewSession] = useState({
    subject: "",
    date: "",
    startTime: "",
    endTime: "",
    type: "online" as "online" | "in-person",
    location: "",
    meetingLink: "",
    notes: "",
    maxStudents: "10",
    studentId: "",
  });

  const [rescheduleData, setRescheduleData] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  // Get all sessions created by this tutor (both scheduled and open)
  // const tutorSessions = mockSessions.filter(s => s.tutorId === tutor.id && (s.status === 'scheduled' || s.status === 'open'));

  // const selectedSession = tutorSessions.find(s => s.id === selectedSessionId);

  const [tutorSessions, setTutorSessions] = useState<Session[]>([]);
  const [subjectIdMap, setSubjectIdMap] = useState<Record<string, string>>({});

  const fetchSessions = async () => {
    try {
      const data = await apiGet<{ sessions: Record<string, unknown>[] }>(
        `/sessions?tutorId=${tutor.id}&status=open`,
      );
      setTutorSessions(data.sessions.map(mapSession));
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  useEffect(() => {
    if (tutor?.id) {
      fetchSessions();
      // Fetch all subjects to get subject ID from name
      apiGet<{ subjects: { subject_id: string; subject_name: string }[] }>(
        "/subjects",
      )
        .then((data) => {
          const map: Record<string, string> = {};
          (data.subjects ?? []).forEach((s) => {
            map[s.subject_name] = s.subject_id;
          });
          setSubjectIdMap(map);
        })
        .catch(console.error);
    }
  }, [tutor?.id]);

  const selectedSession = tutorSessions.find((s) => s.id === selectedSessionId);
  const enrolledCount = selectedSession?.enrolledStudents?.length ?? 0;
  const studentNamesDisplay = `${enrolledCount} enrolled student(s)`;
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
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0 nên cần +1
    const day = String(date.getDate()).padStart(2, "0");

    const dateString = `${year}-${month}-${day}`;

    return tutorSessions.filter((s) => s.date === dateString);
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

  const handleCreateSession = async () => {
    if (
      !newSession.subject ||
      !newSession.date ||
      !newSession.startTime ||
      !newSession.endTime
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if subject is in tutor's expertise
    if (!tutor.expertise.includes(newSession.subject)) {
      toast.error("Please select a subject from your expertise");
      return;
    }

    if (sessionType === "open" && !newSession.maxStudents) {
      toast.error("Please set maximum students for open session");
      return;
    }

    const subjectId = subjectIdMap[newSession.subject];
    if (!subjectId) {
      toast.error("Cannot find subject ID. Please try again.");
      return;
    }

    // Tạo session qua API
    try {
      await apiPost("/sessions", {
        tutorId: tutor.id,
        subjectId,
        date: newSession.date,
        startTime: newSession.startTime,
        endTime: newSession.endTime,
        type: newSession.type,
        location: newSession.location || null,
        meetingLink: newSession.meetingLink || null,
        notes: newSession.notes || null,
        maxStudents: Number(newSession.maxStudents),
      });
    } catch (err: any) {
      toast.error(
        `Failed to create session: ${err.message || "Unknown error"}`,
      );
      return;
    }

    setCreateDialogOpen(false);
    setNewSession({
      subject: "",
      date: "",
      startTime: "",
      endTime: "",
      type: "online",
      location: "",
      meetingLink: "",
      notes: "",
      maxStudents: "10",
      studentId: "",
    });

    toast.success(
      `Session created successfully. Students can now join from the Join tab.`,
    );
    fetchSessions();
  };

  const handleCompleteSession = async () => {
    try {
      await apiPost(`/sessions/${selectedSessionId}/complete`);
    } catch (err: any) {
      toast.error(
        `Failed to complete session: ${err.message || "Unknown error"}`,
      );
      return;
    }

    toast.success(
      "Session marked as completed and added to Session History for both you and enrolled students.",
    );
    fetchSessions();
    setSelectedSessionId(null);
  };

  const handleCancelSession = async () => {
    try {
      await apiDelete(`/sessions/${selectedSessionId}`);
    } catch (err: any) {
      toast.error(
        `Failed to cancel session: ${err.message || "Unknown error"}`,
      );
      return;
    }
    toast.success("Session cancelled");
    fetchSessions();
    setSelectedSessionId(null);
  };

  const handleOpenReschedule = () => {
    if (selectedSession) {
      setRescheduleData({
        date: selectedSession.date,
        startTime: selectedSession.startTime,
        endTime: selectedSession.endTime,
      });
      setRescheduleDialogOpen(true);
    }
  };

  const handleRescheduleSession = async () => {
    if (
      !rescheduleData.date ||
      !rescheduleData.startTime ||
      !rescheduleData.endTime
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await apiPatch(`/sessions/${selectedSessionId}`, {
        updateData: {
          date: rescheduleData.date,
          startTime: rescheduleData.startTime,
          endTime: rescheduleData.endTime,
        },
        reason: "Rescheduled by tutor",
      });

      const enrolledCount = selectedSession?.enrolledStudents?.length ?? 0;
      toast.success(
        `Session rescheduled to ${rescheduleData.date} at ${rescheduleData.startTime}. Notification sent to ${enrolledCount} enrolled student(s) via Messages.`,
      );

      fetchSessions();
      setRescheduleDialogOpen(false);
      setSelectedSessionId(null);
    } catch (err: any) {
      toast.error(
        `Failed to reschedule session: ${err.message || "Unknown error"}`,
      );
    }
  };

  // Get session color based on type
  const getSessionColor = (session: Session) => {
    return session.type === "online"
      ? "bg-blue-100 hover:bg-blue-200 border-blue-400"
      : "bg-green-100 hover:bg-green-200 border-green-400";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Teaching Calendar</CardTitle>
              <CardDescription>
                View and manage your sessions in calendar view
              </CardDescription>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Session
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Session</DialogTitle>
                  <DialogDescription>
                    Schedule a new tutoring session
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Session Type</Label>
                    <Select
                      value={sessionType}
                      onValueChange={(v: "open") => setSessionType(v)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open Session</SelectItem>
                        <SelectItem value="individual">
                          Individual Session
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {sessionType === "open" && (
                    <div>
                      <Label>Maximum Students</Label>
                      <Input
                        type="number"
                        value={newSession.maxStudents}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            maxStudents: e.target.value,
                          })
                        }
                        className="mt-2"
                        min="1"
                        max="50"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Subject (from your expertise) *</Label>
                    <Select
                      value={newSession.subject}
                      onValueChange={(v: string) =>
                        setNewSession({ ...newSession, subject: v })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select subject you can teach" />
                      </SelectTrigger>
                      <SelectContent>
                        {tutor.expertise.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Only subjects from your expertise list are available
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newSession.date}
                        onChange={(e) =>
                          setNewSession({ ...newSession, date: e.target.value })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={newSession.type}
                        onValueChange={(v: "online" | "in-person") =>
                          setNewSession({ ...newSession, type: v })
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="in-person">In-Person</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={newSession.startTime}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            startTime: e.target.value,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={newSession.endTime}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            endTime: e.target.value,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {newSession.type === "in-person" && (
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={newSession.location}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            location: e.target.value,
                          })
                        }
                        className="mt-2"
                        placeholder="e.g., Library Room 301"
                      />
                    </div>
                  )}

                  {newSession.type === "online" && (
                    <div>
                      <Label>Meeting Link</Label>
                      <Input
                        value={newSession.meetingLink}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            meetingLink: e.target.value,
                          })
                        }
                        className="mt-2"
                        placeholder="e.g., https://meet.google.com/..."
                      />
                    </div>
                  )}

                  <div>
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      value={newSession.notes}
                      onChange={(e) =>
                        setNewSession({ ...newSession, notes: e.target.value })
                      }
                      className="mt-2"
                      placeholder="Additional information about the session"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateSession}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create Session
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <div className="flex items-center gap-2">
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
            <div className="w-16" /> {/* Spacer for alignment */}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-400" />
              <span className="text-xs text-gray-600">Online Session</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-400" />
              <span className="text-xs text-gray-600">In-Person Session</span>
            </div>
          </div>

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
                className="min-h-[120px] p-2 border rounded-lg bg-gray-50"
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
                  className={`min-h-[120px] p-2 border rounded-lg ${
                    isToday ? "bg-blue-50 border-blue-300" : "bg-white"
                  }`}
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
                      const isOpenSession = session.status === "open";
                      return (
                        <div
                          key={session.id}
                          onClick={() => setSelectedSessionId(session.id)}
                          className={`text-xs p-1.5 rounded cursor-pointer border-2 ${getSessionColor(
                            session,
                          )}`}
                        >
                          <p className="truncate">{session.subject}</p>
                          <p className="text-gray-700">{session.startTime}</p>
                          {isOpenSession && (
                            <p className="text-purple-800 flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {session.enrolledStudents?.length || 0}/
                              {session.maxStudents}
                            </p>
                          )}
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

              {selectedSession.enrolledStudents && (
                <div>
                  <p className="text-sm text-gray-600">Students</p>
                  <div className="mt-1 text-sm text-gray-800">
                    <span>{studentNamesDisplay}</span>
                  </div>
                </div>
              )}

              {selectedSession.status === "open" && (
                <div>
                  <p className="text-sm text-gray-600">
                    Session Type & Enrollment
                  </p>
                  <Badge className="bg-purple-100 text-purple-800 mt-1">
                    Open Session:{" "}
                    {selectedSession.enrolledStudents?.length || 0} /{" "}
                    {selectedSession.maxStudents} enrolled
                  </Badge>
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

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleCompleteSession}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete
                </Button>
                <Button variant="outline" onClick={handleOpenReschedule}>
                  <Edit className="h-4 w-4 mr-2" />
                  Reschedule
                </Button>
                <Button variant="outline" onClick={handleCancelSession}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog
        open={rescheduleDialogOpen}
        onOpenChange={setRescheduleDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Session</DialogTitle>
            <DialogDescription>
              Choose a new time for this session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={rescheduleData.date}
                onChange={(e) =>
                  setRescheduleData({ ...rescheduleData, date: e.target.value })
                }
                className="mt-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={rescheduleData.startTime}
                  onChange={(e) =>
                    setRescheduleData({
                      ...rescheduleData,
                      startTime: e.target.value,
                    })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={rescheduleData.endTime}
                  onChange={(e) =>
                    setRescheduleData({
                      ...rescheduleData,
                      endTime: e.target.value,
                    })
                  }
                  className="mt-2"
                />
              </div>
            </div>
            {selectedSession?.status === "open" &&
              selectedSession.enrolledStudents &&
              selectedSession.enrolledStudents.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-sm text-gray-700">
                    This session has {selectedSession.enrolledStudents.length}{" "}
                    enrolled student(s). All will be notified of the reschedule
                    via Messages.
                  </p>
                </div>
              )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRescheduleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRescheduleSession}>Reschedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-6">
          <p className="mb-2">Calendar Tips</p>
          <p className="text-sm text-gray-600">
            Click on any session to view full details, reschedule, or complete
            it. Create new sessions and they will automatically appear on the
            calendar. Students can view and join open sessions from the Join
            tab. Colors indicate session type: blue for online sessions and
            green for in-person sessions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
