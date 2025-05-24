
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Result {
  id: string;
  market_name: string;
  result_date: string;
  open_result: string | null;
  close_result: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const ResultDeclaration = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [openResult, setOpenResult] = useState("");
  const [closeResult, setCloseResult] = useState("");
  const [selectedResult, setSelectedResult] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingResults();
  }, []);

  const fetchPendingResults = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .eq('status', 'pending')
        .order('result_date', { ascending: false });
      
      if (error) throw error;
      
      setResults(data || []);
    } catch (error: any) {
      console.error('Error fetching pending results:', error);
      toast({
        title: "Error loading results",
        description: error.message || "Could not load result data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = (result: Result) => {
    setSelectedResult(result.id);
    setOpenResult(result.open_result || "");
    setCloseResult(result.close_result || "");
  };

  const validateResult = (result: string) => {
    // Basic validation: Numbers should be 3 digits
    return /^\d{3}$/.test(result);
  };

  const handleDeclareResult = async () => {
    if (!selectedResult) {
      toast({
        title: "No result selected",
        description: "Please select a result to declare",
        variant: "destructive",
      });
      return;
    }

    // Validate open and close results
    if (openResult && !validateResult(openResult)) {
      toast({
        title: "Invalid open result",
        description: "Open result must be a 3-digit number",
        variant: "destructive",
      });
      return;
    }

    if (closeResult && !validateResult(closeResult)) {
      toast({
        title: "Invalid close result",
        description: "Close result must be a 3-digit number",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update the result
      const { error } = await supabase
        .from('results')
        .update({
          open_result: openResult || null,
          close_result: closeResult || null,
          status: 'declared',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedResult);
        
      if (error) throw error;

      // Process bets and update user balances
      // This would typically involve checking which bets match the result and updating user balances
      // For this example, we'll just show a success message

      toast({
        title: "Result declared successfully",
        description: "The result has been declared and bets will be processed",
      });

      // Reset form and refresh the list
      setSelectedResult(null);
      setOpenResult("");
      setCloseResult("");
      fetchPendingResults();
    } catch (error: any) {
      console.error('Error declaring result:', error);
      toast({
        title: "Failed to declare result",
        description: error.message || "An error occurred while trying to declare the result",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Result Declaration</h1>
        <p className="text-gray-600">Declare results for games and process bets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pending Results</CardTitle>
              <CardDescription>
                Select a market to declare its results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                </div>
              ) : results.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Market</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id} className={selectedResult === result.id ? "bg-blue-50" : ""}>
                        <TableCell>{new Date(result.result_date).toLocaleDateString()}</TableCell>
                        <TableCell>{result.market_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            {result.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant={selectedResult === result.id ? "default" : "outline"}
                            onClick={() => handleSelectResult(result)}
                          >
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No pending results to declare</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Declare Result</CardTitle>
              <CardDescription>
                Enter the open and close results for the selected market
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedResult ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="open-result">Open Result (3 digits)</Label>
                    <Input 
                      id="open-result"
                      value={openResult}
                      onChange={(e) => setOpenResult(e.target.value)}
                      placeholder="e.g. 123"
                      maxLength={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="close-result">Close Result (3 digits)</Label>
                    <Input 
                      id="close-result"
                      value={closeResult}
                      onChange={(e) => setCloseResult(e.target.value)}
                      placeholder="e.g. 456"
                      maxLength={3}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleDeclareResult}
                  >
                    Declare Result
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Select a market to declare its result</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
