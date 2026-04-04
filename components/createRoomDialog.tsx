'use client'

import axios from "axios";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Exam } from "@/app/generated/prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export function CreateRoomDialog({ children }: { children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState();
  const [examId, setExamId] = useState<number | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function fetchExams() {
      await axios
        .get("/api/exam")
        .then((res) => {
          return setExams(res.data);
        })
    }
    
    fetchExams();
  }, [])

  async function handleSubmit() {
    setIsLoading(true);

    await axios
      .post(`/api/room`, { examId })
      .then((res) => {
        router.push(`/room/${res.data.code}`);
        setIsOpen(false);
      }).catch((err) => {
        setError(err.response.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setExamId(null);
          setError(undefined);
        }
        setIsOpen(open)
      }}
    >
      <form className="w-auto w-full">
        <DialogTrigger asChild>
          {children ?? <Button><Plus/> Create Room</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create a Room</DialogTitle>
            <DialogDescription>
              Add your room details here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label>Exam</Label>
              <Select value={examId?.toString()} onValueChange={(value) => {
                setExamId(Number(value))
                setError(undefined);
              }}>
              <SelectTrigger aria-invalid={!!error}>
                <SelectValue placeholder="Select an exam" />
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id.toString()}>{exam.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
              {error && (
                <p className="text-sm text-red-500">
                  {error}
                </p>
              )}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={isLoading} type="submit">
              {isLoading && <Loader2 className="animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
