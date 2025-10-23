'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Loader2, CreditCard, Shield, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentProcessingProps {
  amount: number;
  eventTitle: string;
  onComplete: () => void;
  processingTime?: number; // milliseconds
}

export default function PaymentProcessing({ 
  amount, 
  eventTitle, 
  onComplete,
  processingTime = 3000 
}: PaymentProcessingProps) {
  const [stage, setStage] = useState<'processing' | 'verifying' | 'completed'>('processing');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate payment processing stages
    const timer1 = setTimeout(() => {
      setStage('verifying');
    }, processingTime * 0.4);

    const timer2 = setTimeout(() => {
      setStage('completed');
    }, processingTime * 0.8);

    const timer3 = setTimeout(() => {
      onComplete();
    }, processingTime);

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / (processingTime / 100));
      });
    }, 100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearInterval(progressInterval);
    };
  }, [processingTime, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 border-2 border-purple-200 dark:border-purple-800 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Shield className="h-8 w-8" />
            <h2 className="text-2xl font-bold">Secure Payment</h2>
          </div>
          <p className="text-center text-purple-100 text-sm">
            Processing your registration
          </p>
        </div>

        <CardContent className="p-8 space-y-6">
          {/* Amount Display */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Amount</p>
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              ₹{amount.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground truncate">{eventTitle}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              {Math.round(progress)}% Complete
            </p>
          </div>

          {/* Processing Stages */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {stage === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg"
                >
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  <div>
                    <p className="font-medium">Processing Payment</p>
                    <p className="text-sm text-muted-foreground">
                      Securely processing your transaction...
                    </p>
                  </div>
                </motion.div>
              )}

              {stage === 'verifying' && (
                <motion.div
                  key="verifying"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg"
                >
                  <Lock className="h-6 w-6 text-indigo-600 animate-pulse" />
                  <div>
                    <p className="font-medium">Verifying Transaction</p>
                    <p className="text-sm text-muted-foreground">
                      Confirming your registration...
                    </p>
                  </div>
                </motion.div>
              )}

              {stage === 'completed' && (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg"
                >
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-600">Payment Successful!</p>
                    <p className="text-sm text-muted-foreground">
                      Generating your ticket...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Security Badges */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>256-bit SSL</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span>PCI DSS</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
