import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import ChangePasswordForm from '@/components/Profile/ChangePasswordForm';
import EditProfileForm from '@/components/Profile/EditProfileForm';
import LiveStream from '@/components/Stream/LiveStream';

const UserDashboard = () => {
  const { user, userData, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('streams');
  const [editingProfile, setEditingProfile] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-green-500/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Streamania</h1>
          <div className="flex items-center gap-4">
            <span className="text-green-400">Welcome, {userData?.username}</span>
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
            <TabsTrigger value="streams" className="text-white data-[state=active]:bg-green-600">Live Streams</TabsTrigger>
            <TabsTrigger value="quiz" className="text-white data-[state=active]:bg-green-600">Quiz</TabsTrigger>
            <TabsTrigger value="wallet" className="text-white data-[state=active]:bg-green-600">Wallet</TabsTrigger>
            <TabsTrigger value="chat" className="text-white data-[state=active]:bg-green-600">Chat</TabsTrigger>
            <TabsTrigger value="profile" className="text-white data-[state=active]:bg-green-600">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="streams" className="mt-6">
            <LiveStream />
          </TabsContent>

          <TabsContent value="quiz" className="mt-6">
            <Card className="bg-gray-800/50 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white">Quiz Interaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">No active quiz at the moment</p>
                  <p className="text-sm text-gray-500">Quizzes will appear here during live streams</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-gray-800/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Wallet Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">
                      {userData?.wallet || 0}
                    </div>
                    <p className="text-gray-400">Points</p>
                    <Button className="mt-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600">
                      Add Points
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded">
                      <span className="text-gray-300">Sign-up Bonus</span>
                      <span className="text-green-400">+50</span>
                    </div>
                    <p className="text-sm text-gray-500 text-center mt-4">
                      No other transactions yet
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <Card className="bg-gray-800/50 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white">Live Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">Chat will be available during live streams</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {editingProfile ? (
                <EditProfileForm onCancel={() => setEditingProfile(false)} />
              ) : (
                <Card className="bg-gray-800/50 border-green-500/20">
                  <CardHeader>
                    <CardTitle className="text-white">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                      <p className="text-white">{userData?.username}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                      <p className="text-white">{userData?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Member Since</label>
                      <p className="text-white">{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                    <Button 
                      onClick={() => setEditingProfile(true)}
                      className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                    >
                      Edit Profile
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              <ChangePasswordForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
