
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  utr_number: string | null;
  user_name?: string;
  user_mobile?: string;
}

export const PaymentVerification = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      
      // Get all deposit transactions with pending status
      const { data: pendingPayments, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('transaction_type', 'deposit')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Get user information for each payment
      const enhancedPayments = await Promise.all((pendingPayments || []).map(async (payment) => {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('name, mobile_number')
          .eq('id', payment.user_id)
          .single();
          
        if (userError) {
          console.error(`Error fetching user data for ${payment.user_id}:`, userError);
          return {
            ...payment,
            user_name: 'Unknown',
            user_mobile: 'Unknown',
          };
        }
          
        return {
          ...payment,
          user_name: userData?.name || 'No Name',
          user_mobile: userData?.mobile_number || 'No Mobile',
        };
      }));
          
      setPayments(enhancedPayments);
    } catch (error: any) {
      console.error('Error fetching pending payments:', error);
      toast({
        title: "Error loading payment data",
        description: error.message || "Could not load payment verification data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (id: string, status: 'completed' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;

      // If payment is approved, update user balance
      if (status === 'completed') {
        const payment = payments.find(p => p.id === id);
        if (payment) {
          const { data: userData, error: fetchError } = await supabase
            .from('profiles')
            .select('balance')
            .eq('id', payment.user_id)
            .single();
            
          if (fetchError) throw fetchError;
          
          const newBalance = (userData?.balance || 0) + payment.amount;
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ balance: newBalance })
            .eq('id', payment.user_id);
            
          if (updateError) throw updateError;
        }
      }

      toast({
        title: `Payment ${status === 'completed' ? 'Approved' : 'Rejected'}`,
        description: `The payment has been ${status === 'completed' ? 'approved and the user balance has been updated' : 'rejected'}`,
      });

      // Refresh the list
      fetchPendingPayments();
    } catch (error: any) {
      console.error(`Error ${status === 'completed' ? 'approving' : 'rejecting'} payment:`, error);
      toast({
        title: `Failed to ${status === 'completed' ? 'approve' : 'reject'} payment`,
        description: error.message || `An error occurred while trying to ${status === 'completed' ? 'approve' : 'reject'} the payment`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Verification</h1>
        <p className="text-gray-600">Review and verify pending deposit requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Payments</CardTitle>
          <CardDescription>
            Approve or reject pending deposit requests from users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            </div>
          ) : payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>UTR Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{new Date(payment.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.user_name}</p>
                        <p className="text-xs text-gray-500">{payment.user_mobile}</p>
                      </div>
                    </TableCell>
                    <TableCell>₹{payment.amount}</TableCell>
                    <TableCell>{payment.utr_number || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          onClick={() => updatePaymentStatus(payment.id, 'completed')}
                        >
                          <Check className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          onClick={() => updatePaymentStatus(payment.id, 'rejected')}
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
              <p className="text-gray-500">No pending payments to verify</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
