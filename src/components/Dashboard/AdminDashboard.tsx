import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import StreamManager from '@/components/Stream/StreamManager';
import QuizCreationForm from '@/components/Quiz/QuizCreationForm';
import QuizList from '@/components/Quiz/QuizList';
import LiveStream from '@/components/Stream/LiveStream';
import { toast } from '@/hooks/use-toast';

interface UserData {
  uid: string;
  email: string;
  username: string;
  isAdmin: boolean;
  wallet: number;
  createdAt: Date;
  emailVerified: boolean;
}

const AdminDashboard = () => {
  const { user, userData, logout, getAllUsers, topUpUserWallet } = useAuth();
  const [activeTab, setActiveTab] = useState('streams');
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Failed to load users",
        description: "There was an error loading user data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    if (!selectedUserId || !topUpAmount || Number(topUpAmount) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid amount.",
        variant: "destructive"
      });
      return;
    }

    try {
      await topUpUserWallet(selectedUserId, Number(topUpAmount));
      setTopUpAmount('');
      setSelectedUserId('');
      setDialogOpen(false);
      loadUsers(); // Refresh user list
    } catch (error) {
      console.error('Error topping up wallet:', error);
      toast({
        title: "Failed to top up wallet",
        description: "There was an error adding points. Please check your permissions and try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-green-500/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Streamania Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-green-400">Admin: {userData?.username}</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-green-500/20 text-green-400 hover:bg-green-500/10"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 border-green-500/20">
            <TabsTrigger value="streams" className="text-white data-[state=active]:bg-green-600">Stream Control</TabsTrigger>
            <TabsTrigger value="watch" className="text-white data-[state=active]:bg-green-600">Watch Stream</TabsTrigger>
            <TabsTrigger value="quiz" className="text-white data-[state=active]:bg-green-600">Quiz Management</TabsTrigger>
            <TabsTrigger value="users" className="text-white data-[state=active]:bg-green-600">User Management</TabsTrigger>
            <TabsTrigger value="chat" className="text-white data-[state=active]:bg-green-600">Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="streams" className="mt-6">
            <StreamManager />
          </TabsContent>

          <TabsContent value="watch" className="mt-6">
            <LiveStream showChat={true} />
          </TabsContent>

          <TabsContent value="quiz" className="mt-6">
            <div className="space-y-6">
              <Card className="bg-gray-800/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Create New Quiz</CardTitle>
                </CardHeader>
                <CardContent>
                  {showQuizForm ? (
                    <QuizCreationForm onClose={() => setShowQuizForm(false)} />
                  ) : (
                    <Button 
                      onClick={() => setShowQuizForm(true)}
                      className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                    >
                      Create New Quiz
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              <QuizList />
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card className="bg-gray-800/50 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white flex justify-between items-center">
                  User Management
                  <Button onClick={loadUsers} disabled={loading} className="bg-gradient-to-r from-green-600 to-green-500">
                    {loading ? 'Loading...' : 'Refresh'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {users.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-300">Username</TableHead>
                        <TableHead className="text-gray-300">Email</TableHead>
                        <TableHead className="text-gray-300">Wallet</TableHead>
                        <TableHead className="text-gray-300">Verified</TableHead>
                        <TableHead className="text-gray-300">Role</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.uid}>
                          <TableCell className="text-white">{user.username}</TableCell>
                          <TableCell className="text-gray-300">{user.email}</TableCell>
                          <TableCell className="text-green-400">{user.wallet}</TableCell>
                          <TableCell className={user.emailVerified ? "text-green-400" : "text-red-400"}>
                            {user.emailVerified ? "Yes" : "No"}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {user.isAdmin ? "Admin" : "User"}
                          </TableCell>
                          <TableCell>
                            <Dialog open={dialogOpen && selectedUserId === user.uid} onOpenChange={(open) => {
                              setDialogOpen(open);
                              if (!open) {
                                setSelectedUserId('');
                                setTopUpAmount('');
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-green-500/20 text-green-400"
                                  onClick={() => {
                                    setSelectedUserId(user.uid);
                                    setDialogOpen(true);
                                  }}
                                >
                                  Top Up
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gray-800 border-gray-700">
                                <DialogHeader>
                                  <DialogTitle className="text-white">Top Up Wallet - {user.username}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-gray-300">Amount to add</Label>
                                    <Input
                                      type="number"
                                      value={topUpAmount}
                                      onChange={(e) => setTopUpAmount(e.target.value)}
                                      placeholder="Enter amount..."
                                      min="1"
                                      className="bg-gray-700/50 border-gray-600 text-white"
                                    />
                                  </div>
                                  <Button onClick={handleTopUp} className="w-full bg-green-600 hover:bg-green-700">
                                    Add Points
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">
                      {loading ? 'Loading users...' : 'No users found'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <Card className="bg-gray-800/50 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white">Chat Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">Chat moderation tools will be available here</p>
                  <p className="text-sm text-gray-500">Manage chat settings, moderate messages, and view chat analytics</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
