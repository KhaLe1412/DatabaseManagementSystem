import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Slider } from "../ui/slider";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  PlusCircle,
  FileText,
} from "lucide-react";
import {
  mockSessions,
  mockStudents,
  mockStudentEvaluations,
} from "../../lib/mock-data";
import { Tutor, Student } from "../../types";
import { toast } from "sonner@2.0.3";
import { apiGet, apiPost, apiPut } from "../../lib/api";

interface StudentProgressTabProps {
  tutor: Tutor;
}

export function StudentProgressTab({ tutor }: StudentProgressTabProps) {
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  // Current evaluation being edited (null if creating new)
  const [currentEvaluationId, setCurrentEvaluationId] = useState<string | null>(
    null,
  );
  // ends
  const [evaluation, setEvaluation] = useState({
    understanding: 3,
    participation: 3,
    preparation: 3,
    attitude: 3,
    testScore: "",
    testMaxScore: "",
    testNotes: "",
    overallProgress: "",
    recommendations: "",
  });

  const [evaluationsByStudent, setEvaluationsByStudent] = useState<
    Record<string, any[]>
  >({});

  // Load all evaluations when component mounts or tutor changes
  useEffect(() => {
    loadAllStudentEvaluations();
  }, [tutor.id]);

  const loadAllStudentEvaluations = async () => {
    try {
      const data = await apiGet<any[]>(`/evaluations?tutorId=${tutor.id}`);
      const grouped: Record<string, any[]> = {};
      data.forEach((evaluation: any) => {
        if (!grouped[evaluation.studentId]) grouped[evaluation.studentId] = [];
        grouped[evaluation.studentId].push(evaluation);
      });
      setEvaluationsByStudent(grouped);
    } catch (error) {
      console.error("loadAllStudentEvaluations error", error);
    }
  };

  const tutorSessions = mockSessions.filter((s) => s.tutorId === tutor.id);

  // Get unique students from all enrolled students
  const studentIds = Array.from(
    new Set(tutorSessions.flatMap((s) => s.enrolledStudents)),
  );
  const students = mockStudents.filter((s) => studentIds.includes(s.id));

  // Mock progress data for each student
  // const getStudentProgress = (studentId: string) => {
  //   const sessions = tutorSessions.filter(s => s.enrolledStudents.includes(studentId));
  //   const completed = sessions.filter(s => s.status === 'completed').length;
  //   const total = sessions.length;
  //   const improvement = Math.floor(Math.random() * 30) + 10; // Mock improvement percentage

  //   return {
  //     sessionsCompleted: completed,
  //     totalSessions: total,
  //     improvement,
  //     trend: improvement > 20 ? 'up' : improvement > 10 ? 'stable' : 'down',
  //     recentTopics: sessions.slice(-3).map(s => s.subject)
  //   };
  // };

  const getStudentProgress = (studentId: string) => {
    const sessions = tutorSessions.filter((s) =>
      s.enrolledStudents.includes(studentId),
    );
    const completed = sessions.filter((s) => s.status === "completed").length;
    const total = sessions.length;

    // Deterministic improvement: % completed over total (0-100)
    const improvement = total > 0 ? Math.round((completed / total) * 100) : 0;
    const trend =
      improvement >= 60 ? "up" : improvement >= 30 ? "stable" : "down";

    return {
      sessionsCompleted: completed,
      totalSessions: total,
      improvement,
      trend,
      recentTopics: sessions.slice(-3).map((s) => s.subject),
    };
  };

  const handleOpenEvaluation = (student: Student) => {
    setSelectedStudent(student);
    // Get most recent evaluation for this student from cache
    const existingEval = evaluationsByStudent[student.id]?.[0] || null;

    if (existingEval) {
      //set id for evaluation
      setCurrentEvaluationId(existingEval.id);
      // ends
      setEvaluation({
        understanding: existingEval.skills.understanding,
        participation: existingEval.skills.participation,
        preparation: existingEval.skills.preparation,
        attitude: existingEval.attitude,
        testScore: existingEval.testResults?.score.toString() || "",
        testMaxScore: existingEval.testResults?.maxScore.toString() || "",
        testNotes: existingEval.testResults?.notes || "",
        overallProgress: existingEval.overallProgress,
        recommendations: existingEval.recommendations,
      });
    } else {
      setCurrentEvaluationId(null);
      setEvaluation({
        understanding: 3,
        participation: 3,
        preparation: 3,
        attitude: 3,
        testScore: "",
        testMaxScore: "",
        testNotes: "",
        overallProgress: "",
        recommendations: "",
      });
    }
    setEvaluationDialogOpen(true);
  };

  const fetchStudentEvaluations = async (studentId: string) => {
    try {
      const data = await apiGet<any[]>(
        `/evaluations?studentId=${studentId}&tutorId=${tutor.id}`,
      );
      setEvaluationsByStudent((prev: any) => ({ ...prev, [studentId]: data }));
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error("fetchStudentEvaluations error", error);
      return null;
    }
  };

  const handleSaveEvaluation = () => {
    if (!evaluation.overallProgress || !evaluation.recommendations) {
      toast.error("Please fill in overall progress and recommendations");
      return;
    }

    (async () => {
      try {
        const sessionForStudent = tutorSessions.find((s) =>
          s.enrolledStudents.includes(selectedStudent?.id || ""),
        );
        const sessionId = sessionForStudent ? sessionForStudent.id : "manual";

        const payload: any = {
          studentId: selectedStudent?.id,
          tutorId: tutor.id,
          sessionId,
          skills: {
            understanding: evaluation.understanding,
            participation: evaluation.participation,
            preparation: evaluation.preparation,
          },
          attitude: evaluation.attitude,
          testResults:
            evaluation.testScore && evaluation.testMaxScore
              ? {
                  score: parseInt(evaluation.testScore),
                  maxScore: parseInt(evaluation.testMaxScore),
                  notes: evaluation.testNotes,
                }
              : undefined,
          overallProgress: evaluation.overallProgress,
          recommendations: evaluation.recommendations,
        };

        const isEditing = !!currentEvaluationId;
        const result = isEditing
          ? await apiPut(`/evaluations/${currentEvaluationId}`, payload)
          : await apiPost(`/evaluations`, payload);
        // Keep frontend mock-data in sync (so other components that read mockStudentEvaluations reflect new eval)
        try {
          if (!isEditing) {
            mockStudentEvaluations.unshift(result);
          }
        } catch (e) {
          // ignore if immutable
        }

        toast.success(
          `Evaluation ${isEditing ? "updated" : "saved"} for ${selectedStudent?.name}`,
        );
        // Refresh cache
        await loadAllStudentEvaluations();
        setEvaluationDialogOpen(false);
        setSelectedStudent(null);
        setCurrentEvaluationId(null);
      } catch (error) {
        console.error("save evaluation error", error);
        toast.error("Failed to save evaluation");
      }
    })();
  };

  const getStudentEvaluations = (studentId: string) => {
    const evals = evaluationsByStudent[studentId] || [];
    return evals.filter((e: any) => e.tutorId === tutor.id);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Progress Tracking</CardTitle>
          <CardDescription>
            Monitor and record your students' academic development
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {students.map((student) => {
          const progress = getStudentProgress(student.id);
          // const studentSessions = tutorSessions.filter(s => s.studentId === student.id);
          const studentSessions = tutorSessions.filter((s) =>
            s.enrolledStudents.includes(student.id),
          );

          return (
            <Card key={student.id}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-base">{student.name}</CardTitle>
                    <CardDescription>
                      {student.studentId} • {student.department}
                    </CardDescription>
                  </div>
                  {progress.trend === "up" && (
                    <Badge className="bg-green-100 text-green-800">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Improving
                    </Badge>
                  )}
                  {progress.trend === "stable" && (
                    <Badge variant="secondary">
                      <Minus className="h-3 w-3 mr-1" />
                      Steady
                    </Badge>
                  )}
                  {progress.trend === "down" && (
                    <Badge variant="destructive">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Needs Focus
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Sessions Completed</span>
                    <span>
                      {progress.sessionsCompleted} / {progress.totalSessions}
                    </span>
                  </div>
                  <Progress
                    value={
                      (progress.sessionsCompleted / progress.totalSessions) *
                      100
                    }
                  />
                </div>

                <div>
                  <p className="text-sm mb-2">Performance Improvement</p>
                  <div className="flex items-center gap-2">
                    <Progress value={progress.improvement} className="flex-1" />
                    <span className="text-sm">+{progress.improvement}%</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm mb-2">Recent Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {progress.recentTopics.map((topic, idx) => (
                      <Badge key={idx} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm mb-2">Support Needs</p>
                  <div className="flex flex-wrap gap-2">
                    {student.supportNeeds.map((need) => (
                      <Badge key={need} variant="secondary">
                        {need}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm mb-2">Latest Session Notes</p>
                  {studentSessions.length > 0 && studentSessions[0].feedback ? (
                    <p className="text-sm text-gray-600">
                      {studentSessions[0].feedback.tutorProgress ||
                        "No notes recorded yet"}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No session notes available
                    </p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm">Student Evaluations</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEvaluation(student)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Evaluation
                    </Button>
                  </div>
                  {getStudentEvaluations(student.id).length > 0 ? (
                    <div className="space-y-2">
                      {getStudentEvaluations(student.id)
                        .slice(0, 1)
                        .map((evalData) => (
                          <div
                            key={evalData.id}
                            className="bg-gray-50 p-3 rounded-lg"
                          >
                            <div className="flex items-center gap-4 mb-2">
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-600">
                                  Understanding:
                                </span>
                                <Badge variant="secondary">
                                  {evalData.skills.understanding}/5
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-600">
                                  Participation:
                                </span>
                                <Badge variant="secondary">
                                  {evalData.skills.participation}/5
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-600">
                                  Attitude:
                                </span>
                                <Badge variant="secondary">
                                  {evalData.attitude}/5
                                </Badge>
                              </div>
                            </div>
                            {evalData.testResults && (
                              <p className="text-xs text-gray-600 mb-1">
                                Test Score: {evalData.testResults.score}/
                                {evalData.testResults.maxScore}
                              </p>
                            )}
                            <p className="text-xs text-gray-600">
                              {evalData.overallProgress.substring(0, 100)}...
                            </p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No evaluations yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {students.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No students assigned yet
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-6">
          <p className="mb-2">Progress Reports</p>
          <p className="text-sm text-gray-600">
            Student progress data is shared with academic departments for course
            performance analysis and with the Office of Student Affairs for
            scholarship and training credit evaluations.
          </p>
        </CardContent>
      </Card>

      {/* Student Evaluation Dialog */}
      <Dialog
        open={evaluationDialogOpen}
        onOpenChange={setEvaluationDialogOpen}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Student Evaluation: {selectedStudent?.name}
            </DialogTitle>
            <DialogDescription>
              Evaluate student's performance across multiple dimensions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label>Understanding (1-5)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    value={[evaluation.understanding]}
                    onValueChange={(v) =>
                      setEvaluation({ ...evaluation, understanding: v[0] })
                    }
                    min={1}
                    max={5}
                    step={1}
                    className="flex-1"
                  />
                  <Badge>{evaluation.understanding}/5</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  How well does the student grasp concepts?
                </p>
              </div>

              <div>
                <Label>Participation (1-5)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    value={[evaluation.participation]}
                    onValueChange={(v) =>
                      setEvaluation({ ...evaluation, participation: v[0] })
                    }
                    min={1}
                    max={5}
                    step={1}
                    className="flex-1"
                  />
                  <Badge>{evaluation.participation}/5</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  How actively does the student engage in sessions?
                </p>
              </div>

              <div>
                <Label>Preparation (1-5)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    value={[evaluation.preparation]}
                    onValueChange={(v) =>
                      setEvaluation({ ...evaluation, preparation: v[0] })
                    }
                    min={1}
                    max={5}
                    step={1}
                    className="flex-1"
                  />
                  <Badge>{evaluation.preparation}/5</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Does the student come prepared to sessions?
                </p>
              </div>

              <div>
                <Label>Attitude (1-5)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    value={[evaluation.attitude]}
                    onValueChange={(v) =>
                      setEvaluation({ ...evaluation, attitude: v[0] })
                    }
                    min={1}
                    max={5}
                    step={1}
                    className="flex-1"
                  />
                  <Badge>{evaluation.attitude}/5</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Student's learning attitude and motivation
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <Label>Test Results (Optional)</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Input
                    type="number"
                    placeholder="Score"
                    value={evaluation.testScore}
                    onChange={(e) =>
                      setEvaluation({
                        ...evaluation,
                        testScore: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Max Score"
                    value={evaluation.testMaxScore}
                    onChange={(e) =>
                      setEvaluation({
                        ...evaluation,
                        testMaxScore: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-span-1">
                  {evaluation.testScore && evaluation.testMaxScore && (
                    <div className="flex items-center justify-center h-full">
                      <Badge variant="outline">
                        {(
                          (parseInt(evaluation.testScore) /
                            parseInt(evaluation.testMaxScore)) *
                          100
                        ).toFixed(1)}
                        %
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              <Textarea
                placeholder="Notes about the test performance..."
                value={evaluation.testNotes}
                onChange={(e) =>
                  setEvaluation({ ...evaluation, testNotes: e.target.value })
                }
                rows={2}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Overall Progress *</Label>
              <Textarea
                placeholder="Describe the student's overall progress, strengths, and areas of improvement..."
                value={evaluation.overallProgress}
                onChange={(e) =>
                  setEvaluation({
                    ...evaluation,
                    overallProgress: e.target.value,
                  })
                }
                rows={4}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Recommendations *</Label>
              <Textarea
                placeholder="What should the student focus on next? Any specific study methods or resources to recommend?"
                value={evaluation.recommendations}
                onChange={(e) =>
                  setEvaluation({
                    ...evaluation,
                    recommendations: e.target.value,
                  })
                }
                rows={3}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleSaveEvaluation}>
                <FileText className="h-4 w-4 mr-2" />
                Save Evaluation
              </Button>
              <Button
                variant="outline"
                onClick={() => setEvaluationDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
