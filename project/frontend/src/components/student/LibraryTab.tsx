import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  BookOpen,
  FileText,
  Video,
  FileIcon,
  Search,
  Download,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { apiGet, mapLibraryResource } from "../../lib/api";
import { LibraryResource } from "../../types";

export function LibraryTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<{ resources: Record<string, unknown>[] }>(
          "/library",
        );
        setResources(data.resources.map(mapLibraryResource));
      } catch (err) {
        console.error("Error fetching library resources:", err);
        setError("Failed to load library resources. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const allSubjects = useMemo(() => {
    const subjectSet = new Set<string>();
    resources.forEach((r) => {
      if (r.subject) {
        r.subject.split(",").forEach((s) => {
          const trimmed = s.trim();
          if (trimmed) subjectSet.add(trimmed);
        });
      }
    });
    return Array.from(subjectSet).sort();
  }, [resources]);

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || resource.type === filterType;
    const matchesSubject =
      filterSubject === "all" ||
      resource.subject
        .split(",")
        .map((s) => s.trim())
        .includes(filterSubject);
    return matchesSearch && matchesType && matchesSubject;
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "textbook":
        return <BookOpen className="h-5 w-5" />;
      case "document":
        return <FileText className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      default:
        return <FileIcon className="h-5 w-5" />;
    }
  };

  const handleDownload = (resourceId: string, title: string) => {
    toast.success(`Downloading: ${title}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>HCMUT Library Integration</CardTitle>
          <CardDescription>
            Access textbooks, documents, and learning resources synchronized
            with the university library
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search library resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="textbook">Textbooks</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="article">Articles</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {allSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-6 text-center text-red-600">
            {error}
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource.id}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                      {getResourceIcon(resource.type)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {resource.title}
                      </CardTitle>
                      <CardDescription>{resource.author}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{resource.subject}</Badge>
                    <Badge variant="outline">{resource.type}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() =>
                        handleDownload(resource.id, resource.title)
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open(resource.url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No resources found matching your criteria
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="mb-2">Connected to HCMUT Library Database</p>
              <p className="text-sm text-gray-600">
                All resources are synchronized with the university's central
                library system. You can access official textbooks, lecture
                materials, and curated learning content approved by your
                department.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
