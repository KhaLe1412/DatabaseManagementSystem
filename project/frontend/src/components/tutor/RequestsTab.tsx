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
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Tutor, Session, RescheduleRequest } from "../../types";
import { toast } from "sonner";
import {
  apiGet,
  apiPatch,
  mapSession,
  mapRescheduleRequest,
} from "../../lib/api";

interface RequestsTabProps {
  tutor: Tutor;
}

export function RequestsTab({ tutor }: RequestsTabProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  const [rescheduleRequests, setRescheduleRequests] = useState<
    RescheduleRequest[]
  >([]);

  const handleFetchData = async () => {
    try {
      const [tutorSessions, allStudents, relatedRequests] = await Promise.all([
        apiGet<{ sessions: Record<string, unknown>[] }>(
          `/sessions?tutorId=${tutor.id}`,
        ),
        apiGet<{ users: { id: string; name: string; email: string }[] }>(
          "/users?role=student&limit=100",
        ),
        apiGet<{ rescheduleRequests: Record<string, unknown>[] }>(
          `/reschedule-requests?userId=${tutor.id}`,
        ),
      ]);
      setSessions(tutorSessions.sessions.map(mapSession));
      setStudents(allStudents.users);
      setRescheduleRequests(
        relatedRequests.rescheduleRequests.map(mapRescheduleRequest),
      );
    } catch (err) {
      console.error("Failed to fetch data", err);
      toast.error("Failed to load requests");
    }
  };

  const getRawRequest = (requestId: string) => {
    return rescheduleRequests.find((r) => r.id === requestId);
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  const handleApproveReschedule = async (requestId: string) => {
    try {
      await apiPatch(`/reschedule-requests/${requestId}`, {
        status: "accepted",
      });
      toast.success("Reschedule approved!");
      handleFetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve reschedule");
    }
  };

  const handleRejectReschedule = async (requestId: string) => {
    try {
      await apiPatch(`/reschedule-requests/${requestId}`, {
        status: "rejected",
      });
      toast.info("Reschedule request rejected");
      handleFetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject reschedule");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Reschedule Requests</CardTitle>
          <CardDescription>
            Students requesting to reschedule existing sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rescheduleRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No reschedule requests
            </p>
          ) : (
            rescheduleRequests.map((request) => {
              const rawRequest = request as any;
              const session = sessions.find((s) => s.id === request.sessionId);
              const student = students.find(
                (s) => s.id === request.requesterId,
              );

              return (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {student && (
                        <>
                          <Avatar>
                            <AvatarFallback>
                              {student?.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p>{student?.name}</p>
                            <p className="text-sm text-gray-600">
                              {rawRequest.subject ?? session?.subject}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <Badge
                      variant={
                        request.status === "approved"
                          ? "default"
                          : request.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Current Schedule</p>
                      <div className="bg-red-50 p-3 rounded border border-red-200">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-red-600" />
                          <span>
                            {rawRequest.current_session_date ?? session?.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-red-600" />
                          <span>
                            {rawRequest.current_start ?? session?.startTime} -{" "}
                            {rawRequest.current_end ?? session?.endTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Proposed Schedule</p>
                      <div className="bg-green-50 p-3 rounded border border-green-200">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-600" />
                          <span>{request.newDate}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span>
                            {request.newStartTime} - {request.newEndTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {request.reason && (
                    <div>
                      <p className="text-sm text-gray-600">Reason</p>
                      <div className="flex items-start gap-2 mt-1">
                        <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                        <p className="text-sm bg-gray-50 p-2 rounded flex-1">
                          {request.reason}
                        </p>
                      </div>
                    </div>
                  )}

                  {session?.status === "open" && session.enrolledStudents && (
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <p className="text-sm text-blue-800">
                        This is an open session with{" "}
                        {session.enrolledStudents.length} enrolled student(s).
                        Approving this reschedule will notify all enrolled
                        students via Messages.
                      </p>
                    </div>
                  )}

                  {request.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleApproveReschedule(request.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleRejectReschedule(request.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="py-6">
          <p className="mb-2">Important Note</p>
          <p className="text-sm text-gray-600">
            When you approve a reschedule request, all affected students will be
            automatically notified via the messaging system with the new session
            details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
