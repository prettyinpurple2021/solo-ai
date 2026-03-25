"use client";

import { useState, useEffect, useActionState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { submitAssessmentAction } from "@/lib/actions/learning-actions";
import { logError } from "@/lib/logger";

export function AssessmentDialog({ open, onOpenChange, moduleId, moduleTitle }: { open: boolean, onOpenChange: (open: boolean) => void, moduleId: string, moduleTitle: string }) {
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);

  const [state, formAction, pending] = useActionState(submitAssessmentAction, {});

  useEffect(() => {
    if (open && !assessment) {
      loadAssessment();
    }
  }, [open]);

  useEffect(() => {
    if (state.success && state.data) {
      setResult(state.data);
    }
  }, [state]);

  async function loadAssessment() {
    setLoading(true);
    try {
      const res = await fetch(`/api/learning/${moduleId}`);
      if (res.ok) {
        const json = await res.json();
        setAssessment(json.assessment);
      }
    } catch (e) {
      logError("AssessmentDialog loadAssessment failed", e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
        if (!val) {
            // Reset state on close
            setTimeout(() => { setResult(null); setAnswers({}); }, 200);
        }
        onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assessment: {moduleTitle}</DialogTitle>
          <DialogDescription>
            {result ? "Assessment Complete" : (assessment?.description || "Select the best answer for each question.")}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading assessment...</div>
        ) : result ? (
          <div className="py-6 space-y-4">
             <div className={`p-4 rounded-lg border ${result.passed ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400' : 'bg-destructive/10 border-destructivet/20 text-destructive'}`}>
                <h3 className="font-semibold text-lg">{result.passed ? 'Congratulations! 🎉' : 'Assessment Failed'}</h3>
                <p>You scored {result.score}%.</p>
                {result.xpAwarded > 0 && <p className="mt-2 text-sm font-medium">+{result.xpAwarded} XP Earned!</p>}
             </div>
             <Button className="w-full" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        ) : assessment?.questions_data?.length > 0 ? (
          <form action={formAction}>
            <input type="hidden" name="assessmentId" value={assessment.id} />
            <div className="space-y-6 py-4">
              {state?.error && (
                <div aria-live="polite" className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
                  {state.error}
                </div>
              )}
              {assessment.questions_data.map((q: any, idx: number) => (
                <div key={q.id} className="space-y-3">
                  <h4 className="font-medium">{idx + 1}. {q.text}</h4>
                  <RadioGroup name={`answer_${q.id}`} value={answers[q.id]} onValueChange={(val) => handleAnswerChange(q.id, val)}>
                    {q.options.map((opt: string) => (
                      <div className="flex items-center space-x-2" key={opt}>
                        <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                        <Label htmlFor={`${q.id}-${opt}`}>{opt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
              <DialogFooter>
                <Button type="submit" disabled={pending || Object.keys(answers).length < assessment.questions_data.length}>
                  {pending ? 'Submitting...' : 'Submit Assessment'}
                </Button>
              </DialogFooter>
            </div>
          </form>
        ) : (
          <div className="py-8 text-center text-muted-foreground">No assessment found for this module.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

