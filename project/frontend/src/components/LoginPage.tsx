import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Users, GraduationCap, Shield, Eye, EyeOff } from "lucide-react";
import schoolLogo from "figma:asset/5d30621cfc38347904bd973d0c562d26588d6b2f.png";
import { UserRole } from "../types";
import { apiPost, ApiError } from "../lib/api";

interface LoginPageProps {
  onLogin: (role: UserRole, userId: string) => void;
}

// Demo accounts với username và password
const demoAccounts = [
  // Students
  {
    username: "student1",
    password: "pass123",
    role: "student" as UserRole,
    userId: "s1",
    name: "Nguyen Van An",
    type: "Student",
  },
  {
    username: "student2",
    password: "pass123",
    role: "student" as UserRole,
    userId: "s2",
    name: "Tran Thi Binh",
    type: "Student",
  },

  // Tutors
  {
    username: "tutor1",
    password: "pass123",
    role: "tutor" as UserRole,
    userId: "t1",
    name: "Dr. Le Minh Chau",
    type: "Tutor",
  },
  {
    username: "tutor2",
    password: "pass123",
    role: "tutor" as UserRole,
    userId: "t2",
    name: "Dr. Pham Hoang Dung",
    type: "Tutor",
  },

  // Admin & Affairs
  {
    username: "admin",
    password: "admin123",
    role: "admin" as UserRole,
    userId: "admin1",
    name: "Nguyen Van Admin",
    type: "Administrator",
  },
  {
    username: "academic",
    password: "pass123",
    role: "academic-affairs" as UserRole,
    userId: "aa1",
    name: "Academic Affairs",
    type: "Academic Affairs",
  },
  {
    username: "student-affairs",
    password: "pass123",
    role: "student-affairs" as UserRole,
    userId: "sa1",
    name: "Student Affairs",
    type: "Student Affairs",
  },
];

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError('');

  //   const account = demoAccounts.find(
  //     acc => acc.username === username && acc.password === password
  //   );

  //   if (account) {
  //     onLogin(account.role, account.userId);
  //   } else {
  //     setError('Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại.');
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const account = await apiPost<{ role: UserRole; userId: string }>(
        "/auth/login",
        { username, password },
      );
      onLogin(account.role, account.userId);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setError("Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại.");
      } else {
        console.error("Login error:", error);
        setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      }
    }
  };

  const handleQuickLogin = (account: (typeof demoAccounts)[0]) => {
    setUsername(account.username);
    setPassword(account.password);
    onLogin(account.role, account.userId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left space-y-6">
          <div className="flex justify-center lg:justify-start">
            <img
              src={schoolLogo}
              alt="BK TP.HCM Logo"
              className="h-32 w-32 object-contain"
            />
          </div>
          <div>
            <h1 className="mb-4">HCMUT Tutoring Management System</h1>
            <p className="text-xl text-gray-600">
              Hệ thống quản lý gia sư toàn diện dành cho sinh viên và giảng viên
              Đại học Bách Khoa TP.HCM
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <Users className="h-8 w-8 text-blue-600 mb-2 mx-auto lg:mx-0" />
              <p className="text-sm">Kết nối sinh viên với gia sư</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <GraduationCap className="h-8 w-8 text-green-600 mb-2 mx-auto lg:mx-0" />
              <p className="text-sm">Quản lý lịch học hiệu quả</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <Shield className="h-8 w-8 text-purple-600 mb-2 mx-auto lg:mx-0" />
              <p className="text-sm">Theo dõi tiến độ học tập</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="w-full shadow-xl">
          <CardHeader className="text-center">
            <CardTitle>Đăng nhập</CardTitle>
            <CardDescription>
              Nhập thông tin đăng nhập của bạn để tiếp tục
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full">
                Đăng nhập
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Hoặc đăng nhập nhanh
                </span>
              </div>
            </div>

            <div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              >
                {showDemoAccounts ? "Ẩn" : "Hiện"} tài khoản demo
              </Button>

              {showDemoAccounts && (
                <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-lg border max-h-64 overflow-y-auto">
                  <p className="text-sm text-gray-600 mb-3">
                    Chọn tài khoản để đăng nhập nhanh:
                  </p>

                  {/* Students */}
                  <div className="space-y-2">
                    <p className="text-xs uppercase text-gray-500">Sinh viên</p>
                    {demoAccounts
                      .filter((acc) => acc.role === "student")
                      .map((account, idx) => (
                        <Button
                          key={idx}
                          variant="ghost"
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => handleQuickLogin(account)}
                        >
                          <div className="flex items-center gap-3">
                            <Users className="h-4 w-4 text-blue-600" />
                            <div>
                              <div className="text-sm">{account.name}</div>
                              <div className="text-xs text-gray-500">
                                {account.username} / {account.password}
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))}
                  </div>

                  {/* Tutors */}
                  <div className="space-y-2">
                    <p className="text-xs uppercase text-gray-500">Gia sư</p>
                    {demoAccounts
                      .filter((acc) => acc.role === "tutor")
                      .map((account, idx) => (
                        <Button
                          key={idx}
                          variant="ghost"
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => handleQuickLogin(account)}
                        >
                          <div className="flex items-center gap-3">
                            <GraduationCap className="h-4 w-4 text-green-600" />
                            <div>
                              <div className="text-sm">{account.name}</div>
                              <div className="text-xs text-gray-500">
                                {account.username} / {account.password}
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))}
                  </div>

                  {/* Admin & Affairs */}
                  <div className="space-y-2">
                    <p className="text-xs uppercase text-gray-500">
                      Quản trị & Phòng ban
                    </p>
                    {demoAccounts
                      .filter((acc) =>
                        [
                          "admin",
                          "academic-affairs",
                          "student-affairs",
                        ].includes(acc.role),
                      )
                      .map((account, idx) => (
                        <Button
                          key={idx}
                          variant="ghost"
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => handleQuickLogin(account)}
                        >
                          <div className="flex items-center gap-3">
                            <Shield className="h-4 w-4 text-purple-600" />
                            <div>
                              <div className="text-sm">{account.name}</div>
                              <div className="text-xs text-gray-500">
                                {account.username} / {account.password}
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>Hệ thống demo - Đại học Bách Khoa TP.HCM</p>
              <p className="text-xs mt-1">
                Môi trường thử nghiệm cho mục đích học tập
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
