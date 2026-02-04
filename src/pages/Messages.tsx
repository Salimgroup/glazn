"use client";

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-gradient-space flex items-center justify-center">
      <div className="text-center p-8">
        <div className="w-20 h-20 bg-gradient-to-br from-neon-pink to-neon-purple rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Messages Coming Soon</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Direct messaging between creators and brands is in development. 
          Stay tuned for updates!
        </p>
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}