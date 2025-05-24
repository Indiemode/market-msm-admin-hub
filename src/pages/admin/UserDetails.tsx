
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, CreditCard, Award } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';

interface UserProfile {
  id: string;
  name: string | null;
  mobile_number: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  status: string;
  created_at: string;
  utr_number: string | null;
}

interface Bet {
  id: string;
  bet_type: string;
  bet_number: string;
  amount: number;
  status: string;
  created_at: string;
}

export const UserDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);

  const fetchUserData = async (id: string) => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (userError) throw userError;
      setUser(userData);

      // Fetch user transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });
      
      if (transactionError) throw transactionError;
      setTransactions(transactionData || []);

      // Fetch user bets
      const { data: betData, error: betError } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });
      
      if (betError) throw betError;
      setBets(betData || []);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error loading user data",
        description: error.message || "Could not load user details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">User not found</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/admin/users')}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Users
        </Button>
      </div>
    );
  }

  // Calculate statistics
  const totalDeposits = transactions
    .filter(t => t.transaction_type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalWithdrawals = transactions
    .filter(t => t.transaction_type === 'withdraw' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalBets = bets.reduce((sum, b) => sum + b.amount, 0);

  const winningBets = bets.filter(b => b.status === 'win').length;
  const winPercentage = bets.length ? ((winningBets / bets.length) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-2"
            onClick={() => navigate('/admin/users')}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Users
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
          <p className="text-gray-600">Detailed view and history for {user.name || 'User'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* User Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{user.name || 'No Name'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile Number</p>
                <p className="font-medium">{user.mobile_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Balance</p>
                <p className="font-medium text-lg">₹{user.balance.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Joined On</p>
                <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Total Deposits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalDeposits.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Total Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalWithdrawals.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Total Bets Placed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalBets.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs for History */}
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">
            <CreditCard className="w-4 h-4 mr-1" /> Transactions
          </TabsTrigger>
          <TabsTrigger value="bets">
            <Award className="w-4 h-4 mr-1" /> Betting History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All deposits and withdrawals by this user</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>UTR Number</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          {transaction.transaction_type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                        </TableCell>
                        <TableCell>₹{transaction.amount}</TableCell>
                        <TableCell>{transaction.utr_number || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              transaction.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                              transaction.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No transaction history found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bets" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Betting History</CardTitle>
              <CardDescription>
                Win rate: {winPercentage}% ({winningBets} wins out of {bets.length} bets)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bets.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Bet Type</TableHead>
                      <TableHead>Number</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bets.map((bet) => (
                      <TableRow key={bet.id}>
                        <TableCell>{new Date(bet.created_at).toLocaleString()}</TableCell>
                        <TableCell>{bet.bet_type}</TableCell>
                        <TableCell>{bet.bet_number}</TableCell>
                        <TableCell>₹{bet.amount}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              bet.status === 'win' ? 'bg-green-50 text-green-700 border-green-200' :
                              bet.status === 'loss' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }
                          >
                            {bet.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No betting history found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
