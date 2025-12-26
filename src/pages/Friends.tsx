import { useState, useEffect } from "react";
import {
  Mail,
  Users,
  Send,
  UserPlus,
  Droplets,
  Clock,
  Target,
  MessageCircle,
  Search,
  Check,
  X,
  Bell,
} from "lucide-react";

import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { friendsAPI, messagesAPI } from "@/lib/api";

type Status = "excellent" | "good" | "bad";

interface Friend {
  id: string;
  name: string;
  email: string;
  totalDrank: number;
  goalPercentage: number;
  firstDrinkTime: string;
  lastDrinkTime: string;
  avatar: string;
  status: Status;
}

interface FriendRequest {
  _id: string;
  from: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
  createdAt: string;
}

const CIRCUMFERENCE = 2 * Math.PI * 42;

export default function Friends() {
  const { toast } = useToast();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [message, setMessage] = useState(
    "Hey! Don't forget to drink water today 💧"
  );
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [loading, setLoading] = useState(true);

  const statusMap: Record<Status, any> = {
    excellent: {
      label: "Excellent",
      ring: "stroke-green-500",
      text: "text-green-600",
      bg: "from-green-100 to-emerald-100",
    },
    good: {
      label: "Good",
      ring: "stroke-orange-500",
      text: "text-orange-600",
      bg: "from-yellow-100 to-orange-100",
    },
    bad: {
      label: "Bad",
      ring: "stroke-red-500",
      text: "text-red-600",
      bg: "from-red-100 to-pink-100",
    },
  };

  // Fetch friends list and requests
  const fetchFriends = async () => {
    try {
      const [friendsResponse, requestsResponse] = await Promise.all([
        friendsAPI.getFriends(),
        friendsAPI.getRequests(),
      ]);
      setFriends(friendsResponse.data.friends || []);
      setFriendRequests(requestsResponse.data.requests || []);
    } catch (error) {
      console.error("Failed to fetch friends:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
    // Poll for new requests every 10 seconds
    const interval = setInterval(fetchFriends, 10000);
    return () => clearInterval(interval);
  }, []);

  // Search users
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await friendsAPI.searchUsers(query);
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  // Send friend request
  const handleAddFriend = async (friendId: string) => {
    try {
      await friendsAPI.sendRequest(friendId);
      toast({
        title: "Friend request sent",
        description: "Your friend request has been sent!",
      });
      setSearchQuery("");
      setSearchResults([]);
      setShowAdd(false);
    } catch (error: any) {
      toast({
        title: "Failed to send request",
        description: error.response?.data?.error || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  // Accept friend request
  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendsAPI.acceptRequest(requestId);
      toast({
        title: "Friend request accepted",
        description: "You are now friends!",
      });
      fetchFriends(); // Refresh the lists
    } catch (error: any) {
      toast({
        title: "Failed to accept request",
        description: error.response?.data?.error || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  // Decline friend request
  const handleDeclineRequest = async (requestId: string) => {
    try {
      // Remove the request from the list locally
      setFriendRequests(prev => prev.filter(req => req._id !== requestId));
      toast({
        title: "Request declined",
        description: "Friend request declined",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to decline request",
        variant: "destructive",
      });
    }
  };

  async function sendReminder(friend: Friend) {
    setSendingId(friend.id);
    try {
      await messagesAPI.sendReminder(friend.id, message);

      toast({
        title: "Reminder sent",
        description: `Message sent to ${friend.name}`,
      });
    } catch (err: any) {
      toast({
        title: "Failed to send",
        description: err.response?.data?.error || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSendingId(null);
    }
  }

  async function sendToAll() {
    setSendingAll(true);
    try {
      for (const f of friends) {
        await messagesAPI.sendReminder(f.id, message);
      }

      toast({
        title: "All reminders sent",
        description: `${friends.length} messages sent`,
      });
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err.response?.data?.error || "Error sending messages",
        variant: "destructive",
      });
    } finally {
      setSendingAll(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <p className="text-lg">Loading friends...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient pb-24">
      <div className="container max-w-lg mx-auto px-4">
        <Header title="Friends" subtitle="Help friends stay hydrated" />

        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <div className="bg-card rounded-3xl p-6 mb-6 border-2 border-primary/20 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-primary animate-pulse" />
              <h3 className="font-semibold">Friend Requests ({friendRequests.length})</h3>
            </div>
            <div className="space-y-3">
              {friendRequests.map((request) => (
                <div
                  key={request._id}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-lg">
                      {request.from.avatar || request.from.name[0]}
                    </div>
                    <div>
                      <p className="font-medium">{request.from.name}</p>
                      <p className="text-xs text-muted-foreground">{request.from.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAcceptRequest(request._id)}
                      className="gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeclineRequest(request._id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message */}
        <div className="bg-card rounded-3xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Reminder Message</h3>
          </div>

          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mb-4"
          />

          <Button
            variant="water"
            className="w-full gap-2"
            onClick={sendToAll}
            disabled={sendingAll || friends.length === 0}
          >
            <Send className="w-4 h-4" />
            {sendingAll ? "Sending..." : "Send to All"}
          </Button>
        </div>

        {/* Friends */}
        <div className="bg-card rounded-3xl p-6">
          <div className="flex justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Friends ({friends.length})</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(!showAdd)}>
              <UserPlus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>

          {showAdd && (
            <div className="space-y-3 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="bg-muted rounded-xl p-3 space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between bg-card p-3 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddFriend(user._id)}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-6">
            {friends.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No friends yet. Search and add some!
              </p>
            ) : (
              friends.map((f) => {
                const s = statusMap[f.status];
                const pct = Math.min(f.goalPercentage, 100);
                const offset =
                  CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

                return (
                  <div
                    key={f.id}
                    className={`bg-gradient-to-br ${s.bg} rounded-3xl p-5 relative`}
                  >
                    <div className="flex gap-4">
                      <div className="relative">
                        <svg
                          className="w-24 h-24 -rotate-90"
                          viewBox="0 0 96 96"
                        >
                          <circle
                            cx="48"
                            cy="48"
                            r="42"
                            stroke="#e5e7eb"
                            strokeWidth="4"
                            fill="none"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="42"
                            strokeWidth="5"
                            fill="none"
                            className={s.ring}
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-3xl">
                          {f.avatar}
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className={`text-xl font-bold ${s.text}`}>
                          {f.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">{s.label}</p>

                        <div className="text-sm space-y-1 mt-2">
                          <div className="flex gap-2 items-center">
                            <Droplets className="w-4 h-4 text-blue-400" />
                            {f.totalDrank}ml
                            <Target className="w-4 h-4 ml-2 text-purple-400" />
                            {f.goalPercentage}%
                          </div>
                          <div className="flex gap-2 items-center">
                            <Clock className="w-4 h-4 text-teal-400" />
                            {f.firstDrinkTime} – {f.lastDrinkTime}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => sendReminder(f)}
                      disabled={sendingId === f.id}
                      className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center disabled:opacity-50 hover:scale-110 transition-transform"
                    >
                      <MessageCircle className="w-5 h-5 text-green-500" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
