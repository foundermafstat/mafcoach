'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronDown, Check, RefreshCw } from 'lucide-react';
import { useReplica } from '@/components/replica-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ExperimentalPage() {
  // Используем глобальный контекст реплик
  const { replicas, loadingReplicas, refreshReplicas } = useReplica();

  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'system', content: 'You are a helpful assistant.' },
  ]);
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [replicaId, setReplicaId] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.');
  const [error, setError] = useState('');

  // Load replicas when component mounts if they are not already loaded
  useEffect(() => {
    if (replicas.length === 0 && !loadingReplicas) {
      refreshReplicas();
    } else if (replicas.length > 0 && !replicaId) {
      // If replicas are loaded but UUID is not selected, set the first replica
      setReplicaId(replicas[0].uuid);
    }
  }, [replicas, loadingReplicas, refreshReplicas, replicaId]);

  const sendRequest = async () => {
    if (!userInput.trim()) return;

    setLoading(true);
    setError('');

    // Add user message
    const updatedMessages = [
      ...messages,
      { role: 'user', content: userInput.trim() },
    ];
    setMessages(updatedMessages);

    try {
      // Call our API route that connects to the Sensay Experimental API
      const response = await fetch('/api/sensay/experimental', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          store: true,
          source: 'web',
          replicaId: replicaId,  // Pass the selected replica UUID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get API response');
      }

      const data = await response.json();
      setResponse(data);

      // Add assistant response to message history
      if (data.choices?.[0]?.message) {
        setMessages([
          ...updatedMessages,
          data.choices[0].message,
        ]);
      }
    } catch (err) {
      console.error('Error calling experimental API:', err);
      setError(err instanceof Error ? err.message : 'An error occurred when calling the API');
    } finally {
      setLoading(false);
      setUserInput('');
    }
  };

  const resetChat = () => {
    setMessages([{ role: 'system', content: systemPrompt }]);
    setResponse(null);
    setError('');
  };

  const updateSystemPrompt = () => {
    setMessages([{ role: 'system', content: systemPrompt }]);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-white">Sensay Experimental API</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left settings panel */}
        <Card className="border border-dark-500 bg-dark-300 text-white">
          <CardHeader>
            <CardTitle>Request Settings</CardTitle>
            <CardDescription className="text-gray-400">
              Configure parameters for Experimental API requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Replica selection */}
            <div className="space-y-2">
              <Label htmlFor="replicaId">Replica ID</Label>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="flex-1 justify-between flex overflow-hidden border-dark-500 bg-dark-400 text-white"
                      disabled={loadingReplicas}
                    >
                      {loadingReplicas ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading replicas...</span>
                        </div>
                      ) : (
                        <div className="flex justify-between w-full items-center">
                          <span className="truncate max-w-[200px]">{replicaId || 'Select a replica'}</span>
                          <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[300px]">
                    <DropdownMenuLabel>Available Replicas</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <ScrollArea className="h-[200px]">
                      {replicas.length > 0 ? (
                        replicas.map((replica) => (
                          <DropdownMenuItem 
                            key={replica.uuid} 
                            className="flex items-center justify-between"
                            onClick={() => setReplicaId(replica.uuid)}
                          >
                            <div className="flex flex-col mr-2 flex-1 min-w-0">
                              <span className="font-medium">{replica.name}</span>
                              <span className="text-xs text-gray-400 font-mono truncate">{replica.uuid}</span>
                            </div>
                            {replicaId === replica.uuid && (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="p-2 text-center text-sm text-gray-400">
                          {loadingReplicas ? 'Loading...' : 'No replicas available'}
                        </div>
                      )}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={refreshReplicas}
                  disabled={loadingReplicas}
                  title="Refresh replica list"
                  className="border-dark-500 bg-dark-400 text-white"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingReplicas ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              {/* Manual UUID input */}
              <Input
                id="replicaId"
                value={replicaId}
                onChange={(e) => setReplicaId(e.target.value)}
                placeholder="Or enter replica UUID manually"
                className="mt-2 text-xs font-mono border-dark-500 bg-dark-400 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">System Prompt</Label>
              <Textarea
                id="systemPrompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-[100px] border-dark-500 bg-dark-400 text-white"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={updateSystemPrompt}
                className="mt-2 border-dark-500 bg-dark-400 text-white"
              >
                Update Prompt
              </Button>
            </div>
            
            <Button
              variant="destructive"
              onClick={resetChat}
              className="w-full"
            >
              Reset Chat
            </Button>
          </CardContent>
        </Card>
        
        {/* Right chat panel */}
        <Card className="border border-dark-500 bg-dark-300 text-white">
          <CardHeader>
            <CardTitle>Experimental API Chat</CardTitle>
            <CardDescription className="text-gray-400">
              Send messages and receive responses from the replica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={`${msg.role}-${index}`}
                    className={`p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-mafia-600 text-white ml-auto max-w-[80%]'
                        : msg.role === 'assistant'
                        ? 'bg-gray-700 text-white max-w-[80%]'
                        : 'bg-gray-800 text-white text-xs italic max-w-full'
                    }`}
                  >
                    <p>{msg.content}</p>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center space-x-2 bg-gray-700 text-white p-3 rounded-lg max-w-[80%]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p>API is responding...</p>
                  </div>
                )}
                {error && (
                  <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg">
                    <p className="text-sm font-semibold">Error</p>
                    <p className="text-xs">{error}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendRequest();
              }}
              className="w-full flex gap-2"
            >
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 border-dark-500 bg-dark-400 text-white"
              />
              <Button
                type="submit"
                disabled={loading || !userInput.trim() || !replicaId}
                className="bg-mafia-600 hover:bg-mafia-700 text-white"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
      
      {/* Display API response in JSON format for debugging */}
      {response && (
        <Card className="border border-dark-500 bg-dark-300 text-white">
          <CardHeader>
            <CardTitle>API Response (JSON)</CardTitle>
            <CardDescription className="text-gray-400">
              Complete API response in JSON format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <pre className="text-xs font-mono whitespace-pre-wrap text-green-400">
                {JSON.stringify(response, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
