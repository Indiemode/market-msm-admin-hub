
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Payout {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_mobile?: string;
}

export const PayoutProcessing = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingPayouts();
  }, []);

  const fetchPendingPayouts = async () => {
    try {
      setLoading(true);
      
      // Get all withdrawal transactions with pending status
      const { data: pendingPayouts, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('transaction_type', 'withdraw')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Get user information for each payout
      const enhancedPayouts = await Promise.all((pendingPayouts || []).map(async (payout) => {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('name, mobile_number')
          .eq('id', payout.user_id)
          .single();
          
        if (userError) {
          console.error(`Error fetching user data for ${payout.user_id}:`, userError);
          return {
            ...payout,
            user_name: 'Unknown',
            user_mobile: 'Unknown',
          };
        }
          
        return {
          ...payout,
          user_name: userData?.name || 'No Name',
          user_mobile: userData?.mobile_number || 'No Mobile',
        };
      }));
          
      setPayouts(enhancedPayouts);
    } catch (error: any) {
      console.error('Error fetching pending payouts:', error);
      toast({
        title: "Error loading payout data",
        description: error.message || "Could not load payout processing data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePayoutStatus = async (id: string, status: 'completed' | 'rejected' | 'processing') => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
        
      if (error) throw error;

      let message;
      
      if (status === 'completed') {
        message = "Payout marked as completed";
      } else if (status === 'processing') {
        message = "Payout marked as processing";
      } else {
        message = "Payout rejected";
        
        // If payout is rejected, refund the amount to user's balance
        const payout = payouts.find(p => p.id === id);
        if (payout) {
          const { data: userData, error: fetchError } = await supabase
            .from('profiles')
            .select('balance')
            .eq('id', payout.user_id)
            .single();
            
          if (fetchError) throw fetchError;
          
          const newBalance = (userData?.balance || 0) + payout.amount;
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ balance: newBalance })
            .eq('id', payout.user_id);
            
          if (updateError) throw updateError;
          
          message += " and funds have been returned to the user's balance";
        }
      }

      toast({ title: message });

      // Refresh the list
      fetchPendingPayouts();
    } catch (error: any) {
      console.error(`Error updating payout status:`, error);
      toast({
        title: `Failed to update payout status`,
        description: error.message || `An error occurred while trying to update the payout status`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payout Processing</h1>
        <p className="text-gray-600">Process withdrawal requests from users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Payouts</CardTitle>
          <CardDescription>
            Review and process payout requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            </div>
          ) : payouts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>{new Date(payout.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payout.user_name}</p>
                        <p className="text-xs text-gray-500">{payout.user_mobile}</p>
                      </div>
                    </TableCell>
                    <TableCell>₹{payout.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        {payout.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                          onClick={() => updatePayoutStatus(payout.id, 'processing')}
                        >
                          <Clock className="w-4 h-4 mr-1" /> Processing
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          onClick={() => updatePayoutStatus(payout.id, 'completed')}
                        >
                          <Check className="w-4 h-4 mr-1" /> Complete
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          onClick={() => updatePayoutStatus(payout.id, 'rejected')}
                        >
                          <X className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No pending payouts to process</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
