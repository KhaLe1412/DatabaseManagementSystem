import { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  MessageCircle,
  Send,
  Bell,
  Calendar,
  Plus,
  Search,
} from "lucide-react";
import { mockStudents, mockTutors } from "../lib/mock-data";
import { Message } from "../types";
import { toast } from "sonner";
import { apiGet, apiPost } from "../lib/api";

interface MessagingPanelProps {
  userId: string;
  userRole: "student" | "tutor";
}

export function MessagingPanel({ userId, userRole }: MessagingPanelProps) {
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messageText, setMessageText] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationPartners, setConversationPartners] = useState<string[]>(
    [],
  );
  const [notifications, setNotifications] = useState<Message[]>([]);

  const [activeTab, setActiveTab] = useState("messages");
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchConversationMessages = async () => {
    try {
      const data = await apiGet<any[]>(
        `/messages/conversations?userId=${userId}`,
      );
      setConversationPartners(data.map((d) => d.partnerId));
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };

  const fetchMessages = async (partnerId: string) => {
    try {
      const data = await apiGet<Message[]>(
        `/messages?userId=${userId}&partnerId=${partnerId}`,
      );
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await apiGet<Message[]>(
        `/messages/notifications?userId=${userId}`,
      );
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    if (!userId) return;

    fetchConversationMessages();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchConversationMessages();
      fetchNotifications();
    }, 3000);

    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (!selectedConversation) return;

    fetchMessages(selectedConversation);

    const interval = setInterval(() => {
      fetchMessages(selectedConversation);
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedConversation, userId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const getPartnerInfo = (partnerId: string) => {
    const allUsers = [...mockStudents, ...mockTutors];
    return allUsers.find((u) => u.id === partnerId);
  };

  const getAvailableUsers = () => {
    const potentialUsers = userRole === "student" ? mockTutors : mockStudents;
    return potentialUsers.filter((user) => user.id !== userId);
  };

  const filteredAvailableUsers = getAvailableUsers().filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const startNewConversation = (partnerId: string) => {
    setSelectedConversation(partnerId);
    setShowNewChatDialog(false);
    setSearchQuery("");
    if (!conversationPartners.includes(partnerId)) {
      setConversationPartners((prev) => [partnerId, ...prev]);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    const payload = {
      senderId: userId,
      receiverId: selectedConversation,
      content: messageText.trim(),
      type: "regular",
    };

    try {
      const saved = await apiPost<Message>("/messages", payload);
      setMessages((prev) => [...prev, saved]);
      setMessageText("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <MessageCircle className="h-4 w-4 mr-2" />
          Messages
          {notifications.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
              {notifications.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-2xl flex flex-col h-[100vh] p-0 gap-0 overflow-hidden">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Messages & Notifications</SheetTitle>
          <SheetDescription>
            Communicate with {userRole === "student" ? "tutors" : "students"}
          </SheetDescription>
        </SheetHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0 w-full overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications
              {notifications.length > 0 && (
                <Badge className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="messages"
            className="flex-1 flex flex-col min-h-0 px-6 pb-6 data-[state=active]:flex overflow-hidden"
          >
            <div className="flex h-full gap-4">
              {/* Left column: Conversation list */}
              <div className="w-1/3 border-r pr-4 flex flex-col h-full overflow-hidden">
                <div className="mb-3 flex-shrink-0">
                  <Dialog
                    open={showNewChatDialog}
                    onOpenChange={setShowNewChatDialog}
                  >
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        New Message
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Start New Conversation</DialogTitle>
                        <DialogDescription>
                          Select a user to chat with
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <ScrollArea className="h-[300px] border rounded-lg">
                          <div className="p-2 space-y-1">
                            {filteredAvailableUsers.map((user) => (
                              <div
                                key={user.id}
                                onClick={() => startNewConversation(user.id)}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback>
                                    {user.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">
                                    {user.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <ScrollArea className="flex-1 -mr-3 pr-3">
                  <div className="space-y-2">
                    {conversationPartners.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">
                        No conversations
                      </p>
                    ) : (
                      conversationPartners.map((partnerId) => {
                        const partner = getPartnerInfo(partnerId);
                        return (
                          <div
                            key={partnerId}
                            onClick={() => setSelectedConversation(partnerId)}
                            className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 flex items-center gap-3 ${
                              selectedConversation === partnerId
                                ? "bg-gray-100 ring-1 ring-gray-200"
                                : ""
                            }`}
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={partner?.avatar} />
                              <AvatarFallback>
                                {partner?.name?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {partner?.name || partnerId}
                              </p>
                              <p className="text-xs text-gray-400">
                                Click to chat
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Right column: Chat window */}
              <div className="flex-1 flex flex-col min-w-0 bg-white h-full overflow-hidden">
                {selectedConversation ? (
                  <>
                    {/* Header */}
                    <div className="pb-4 border-b flex items-center gap-3 flex-shrink-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={getPartnerInfo(selectedConversation)?.avatar}
                        />
                        <AvatarFallback>
                          {getPartnerInfo(selectedConversation)?.name?.charAt(
                            0,
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {getPartnerInfo(selectedConversation)?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getPartnerInfo(selectedConversation)?.email}
                        </p>
                      </div>
                    </div>

                    {/* Messages Area - Simple overflow scroll */}

                    <ScrollArea className="flex-1 h-full p-4">
                      <div className="space-y-4 pb-2">
                        {messages.length === 0 ? (
                          <p className="text-center text-gray-400 text-sm mt-10">
                            No messages yet. Say hello!
                          </p>
                        ) : (
                          messages.map((message, index) => (
                            <div
                              key={index}
                              className={`flex ${
                                message.senderId === userId
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[85%] rounded-lg p-3 ${
                                  message.senderId === userId
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                <p className="text-sm break-words">
                                  {message.content}
                                </p>
                                <p
                                  className={`text-[10px] mt-1 text-right ${
                                    message.senderId === userId
                                      ? "text-blue-200"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {new Date(
                                    message.timestamp,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={scrollRef} />
                      </div>
                    </ScrollArea>

                    {/* Input Area - Locked at bottom */}
                    <div className="p-3 border-t bg-white flex-shrink-0">
                      <Input
                        placeholder="Type a message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                      />
                      <Button onClick={handleSendMessage} size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <MessageCircle className="h-12 w-12 mb-2 opacity-20" />
                    <p>Select a conversation to start chatting</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="notifications"
            className="flex-1 flex flex-col min-h-0 px-6 pb-6 data-[state=active]:flex overflow-hidden"
          >
            <ScrollArea className="flex-1 h-full">
              <div className="space-y-3 pr-4">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Bell className="h-12 w-12 mb-4 text-gray-300" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.map((notif, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-4 bg-yellow-50 border-yellow-200"
                    >
                      <div className="flex gap-3">
                        <Calendar className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-semibold text-sm text-yellow-800">
                            {notif.type === "reschedule-notification"
                              ? "Schedule Update"
                              : "Notification"}
                          </p>
                          <p className="text-sm text-gray-700">
                            {notif.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notif.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );

  // test git
}
