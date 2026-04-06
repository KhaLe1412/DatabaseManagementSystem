import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  Users,
  GraduationCap,
  UserPlus,
  Edit,
  Trash2,
  Search,
} from "lucide-react";
import { Admin, Student, Tutor, UserRole } from "../types";
import { mockStudents, mockTutors } from "../lib/mock-data";
import { toast } from "sonner@2.0.3";
import schoolLogo from "figma:asset/5d30621cfc38347904bd973d0c562d26588d6b2f.png";

interface AdminDashboardProps {
  admin: Admin;
}

export function AdminDashboard({ admin }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [students, setStudents] = useState(mockStudents);
  const [tutors, setTutors] = useState(mockTutors);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] =
    useState(false);
  const [editingUser, setEditingUser] = useState<
    Student | Tutor | null
  >(null);

  // Form state for adding/editing users
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "" as "student" | "tutor" | "",
    department: "",
    username: "",
    password: "",
    // Student specific
    studentId: "",
    year: 1,
    gpa: 3.0,
    // Tutor specific
    tutorId: "",
    expertise: "",
    rating: 4.5,
  });

  const allUsers = [
    ...students.map((s) => ({
      ...s,
      type: "student" as const,
    })),
    ...tutors.map((t) => ({ ...t, type: "tutor" as const })),
  ];

  const filteredUsers = allUsers.filter(
    (user) =>
      user.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      user.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      user.department
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const handleAddUser = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.role ||
      !formData.department ||
      !formData.username ||
      !formData.password
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const baseUser = {
      name: formData.name,
      email: formData.email,
      department: formData.department,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
    };

    if (formData.role === "student") {
      const newStudent: Student = {
        ...baseUser,
        id: `s${students.length + 1}`,
        role: "student",
        studentId:
          formData.studentId || `202${students.length + 1}`,
        year: formData.year,
        supportNeeds: [],
        gpa: formData.gpa,
      };
      setStudents([...students, newStudent]);
      toast.success(
        `Student ${formData.name} added successfully`,
      );
    } else if (formData.role === "tutor") {
      const newTutor: Tutor = {
        ...baseUser,
        id: `t${tutors.length + 1}`,
        role: "tutor",
        tutorId: formData.tutorId || `T00${tutors.length + 1}`,
        expertise: formData.expertise
          .split(",")
          .map((e) => e.trim()),
        rating: formData.rating,
        totalSessions: 0
      };
      setTutors([...tutors, newTutor]);
      toast.success(
        `Tutor ${formData.name} added successfully`,
      );
    }

    setIsAddUserDialogOpen(false);
    resetForm();
  };

  const handleEditUser = (user: Student | Tutor) => {
    setEditingUser(user);
    if (user.role === "student") {
      setFormData({
        name: user.name,
        email: user.email,
        role: "student",
        department: user.department,
        studentId: user.studentId,
        year: user.year,
        gpa: user.gpa,
        tutorId: "",
        expertise: "",
        rating: 4.5,
      });
    } else {
      setFormData({
        name: user.name,
        email: user.email,
        role: "tutor",
        department: user.department,
        tutorId: user.tutorId,
        expertise: user.expertise.join(", "),
        rating: user.rating,
        studentId: "",
        year: 1,
        gpa: 3.0,
      });
    }
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    if (editingUser.role === "student") {
      setStudents(
        students.map((s) =>
          s.id === editingUser.id
            ? {
                ...s,
                name: formData.name,
                email: formData.email,
                department: formData.department,
                year: formData.year,
                gpa: formData.gpa,
              }
            : s,
        ),
      );
      toast.success("Student updated successfully");
    } else {
      setTutors(
        tutors.map((t) =>
          t.id === editingUser.id
            ? {
                ...t,
                name: formData.name,
                email: formData.email,
                department: formData.department,
                expertise: formData.expertise
                  .split(",")
                  .map((e) => e.trim()),
                rating: formData.rating,
              }
            : t,
        ),
      );
      toast.success("Tutor updated successfully");
    }

    setEditingUser(null);
    resetForm();
  };

  const handleDeleteUser = (user: Student | Tutor) => {
    if (user.role === "student") {
      setStudents(students.filter((s) => s.id !== user.id));
      toast.success("Student removed successfully");
    } else {
      setTutors(tutors.filter((t) => t.id !== user.id));
      toast.success("Tutor removed successfully");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      department: "",
      username: "",
      password: "",
      studentId: "",
      year: 1,
      gpa: 3.0,
      tutorId: "",
      expertise: "",
      rating: 4.5,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1>HCMUT Tutoring System</h1>
              <p className="text-gray-600">Admin Portal</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p>{admin.name}</p>
                <p className="text-sm text-gray-600">
                  Administrator
                </p>
              </div>
              <Avatar>
                <AvatarImage src={admin.avatar} />
                <AvatarFallback>
                  {admin.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="tutors">Tutors</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">
                    Total Students
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">
                    {students.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active students in system
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">
                    Total Tutors
                  </CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">
                    {tutors.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active tutors in system
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">
                    {students.length + tutors.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All accounts
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* All Users Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Accounts</CardTitle>
                    <CardDescription>
                      Manage all students and tutors
                    </CardDescription>
                  </div>
                  <Dialog
                    open={isAddUserDialogOpen}
                    onOpenChange={setIsAddUserDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                          Create a new student or tutor account
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">
                              Email *
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  email: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="role">Role *</Label>
                            <Select
                              value={formData.role}
                              onValueChange={(
                                value: "student" | "tutor",
                              ) =>
                                setFormData({
                                  ...formData,
                                  role: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="student">
                                  Student
                                </SelectItem>
                                <SelectItem value="tutor">
                                  Tutor
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="department">
                              Department *
                            </Label>
                            <Input
                              id="department"
                              value={formData.department}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  department: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="username">
                              Username *
                            </Label>
                            <Input
                              id="username"
                              value={formData.username}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  username: e.target.value,
                                })
                              }
                              placeholder="Login username"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">
                              Password *
                            </Label>
                            <Input
                              id="password"
                              type="password"
                              value={formData.password}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  password: e.target.value,
                                })
                              }
                              placeholder="Account password"
                            />
                          </div>
                        </div>

                        {formData.role === "student" && (
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="studentId">
                                Student ID
                              </Label>
                              <Input
                                id="studentId"
                                value={formData.studentId}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    studentId: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="year">Year</Label>
                              <Input
                                id="year"
                                type="number"
                                min="1"
                                max="5"
                                value={formData.year}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    year: parseInt(
                                      e.target.value,
                                    ),
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="gpa">GPA</Label>
                              <Input
                                id="gpa"
                                type="number"
                                step="0.1"
                                min="0"
                                max="4"
                                value={formData.gpa}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    gpa: parseFloat(
                                      e.target.value,
                                    ),
                                  })
                                }
                              />
                            </div>
                          </div>
                        )}

                        {formData.role === "tutor" && (
                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="tutorId">
                                Tutor ID
                              </Label>
                              <Input
                                id="tutorId"
                                value={formData.tutorId}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    tutorId: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="expertise">
                                Expertise (comma-separated)
                              </Label>
                              <Input
                                id="expertise"
                                placeholder="e.g., Data Structures, Algorithms"
                                value={formData.expertise}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    expertise: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="rating">
                                Initial Rating
                              </Label>
                              <Input
                                id="rating"
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                value={formData.rating}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    rating: parseFloat(
                                      e.target.value,
                                    ),
                                  })
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAddUserDialogOpen(false);
                            resetForm();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAddUser}>
                          Add User
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or department..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {user.name}
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "student"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {user.role === "student"
                              ? "Student"
                              : "Tutor"}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>
                          {user.role === "student"
                            ? user.studentId
                            : user.tutorId}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleEditUser(user)
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Edit User
                                  </DialogTitle>
                                  <DialogDescription>
                                    Update user information
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-name">
                                        Name
                                      </Label>
                                      <Input
                                        id="edit-name"
                                        value={formData.name}
                                        onChange={(e) =>
                                          setFormData({
                                            ...formData,
                                            name: e.target
                                              .value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-email">
                                        Email
                                      </Label>
                                      <Input
                                        id="edit-email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                          setFormData({
                                            ...formData,
                                            email:
                                              e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-department">
                                      Department
                                    </Label>
                                    <Input
                                      id="edit-department"
                                      value={
                                        formData.department
                                      }
                                      onChange={(e) =>
                                        setFormData({
                                          ...formData,
                                          department:
                                            e.target.value,
                                        })
                                      }
                                    />
                                  </div>

                                  {formData.role ===
                                    "student" && (
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-year">
                                          Year
                                        </Label>
                                        <Input
                                          id="edit-year"
                                          type="number"
                                          min="1"
                                          max="5"
                                          value={formData.year}
                                          onChange={(e) =>
                                            setFormData({
                                              ...formData,
                                              year: parseInt(
                                                e.target.value,
                                              ),
                                            })
                                          }
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-gpa">
                                          GPA
                                        </Label>
                                        <Input
                                          id="edit-gpa"
                                          type="number"
                                          step="0.1"
                                          min="0"
                                          max="4"
                                          value={formData.gpa}
                                          onChange={(e) =>
                                            setFormData({
                                              ...formData,
                                              gpa: parseFloat(
                                                e.target.value,
                                              ),
                                            })
                                          }
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {formData.role ===
                                    "tutor" && (
                                    <div className="grid grid-cols-1 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-expertise">
                                          Expertise
                                          (comma-separated)
                                        </Label>
                                        <Input
                                          id="edit-expertise"
                                          value={
                                            formData.expertise
                                          }
                                          onChange={(e) =>
                                            setFormData({
                                              ...formData,
                                              expertise:
                                                e.target.value,
                                            })
                                          }
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-rating">
                                          Rating
                                        </Label>
                                        <Input
                                          id="edit-rating"
                                          type="number"
                                          step="0.1"
                                          min="0"
                                          max="5"
                                          value={
                                            formData.rating
                                          }
                                          onChange={(e) =>
                                            setFormData({
                                              ...formData,
                                              rating:
                                                parseFloat(
                                                  e.target
                                                    .value,
                                                ),
                                            })
                                          }
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setEditingUser(null);
                                      resetForm();
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleUpdateUser}
                                  >
                                    Save Changes
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete{" "}
                                    {user.name}'s account. This
                                    action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteUser(user)
                                    }
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>
                  Students ({students.length})
                </CardTitle>
                <CardDescription>
                  All registered students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>GPA</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={student.avatar}
                              />
                              <AvatarFallback>
                                {student.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {student.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {student.studentId}
                        </TableCell>
                        <TableCell>
                          {student.department}
                        </TableCell>
                        <TableCell>
                          Year {student.year}
                        </TableCell>
                        <TableCell>
                          {student.gpa.toFixed(2)}
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tutors">
            <Card>
              <CardHeader>
                <CardTitle>Tutors ({tutors.length})</CardTitle>
                <CardDescription>
                  All registered tutors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Tutor ID</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Expertise</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Total Sessions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tutors.map((tutor) => (
                      <TableRow key={tutor.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={tutor.avatar} />
                              <AvatarFallback>
                                {tutor.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {tutor.name}
                          </div>
                        </TableCell>
                        <TableCell>{tutor.tutorId}</TableCell>
                        <TableCell>
                          {tutor.department}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {tutor.expertise
                              .slice(0, 2)
                              .map((exp) => (
                                <Badge
                                  key={exp}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {exp}
                                </Badge>
                              ))}
                            {tutor.expertise.length > 2 && (
                              <Badge
                                variant="secondary"
                                className="text-xs"
                              >
                                +{tutor.expertise.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {tutor.rating.toFixed(1)} ★
                        </TableCell>
                        <TableCell>
                          {tutor.totalSessions}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}