'use client'

import axios from "axios";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
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
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

export function CreateExamDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit() {
    setIsLoading(true);

    await axios
      .post(`/api/exam`, { name })
      .then((res) => {
        router.push(`/dashboard/exam/${res.data.id}`);
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
          setName("");
          setError(undefined);
        }
        setIsOpen(open)
      }}
    >
      <form>
        <DialogTrigger asChild>
          <Button><Plus/> Create Exam</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create an Exam</DialogTitle>
            <DialogDescription>
              Add your exam details here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="name-1">Title</Label>
              <Input
                id="title-1"
                name="title"
                value={name}
                className={cn(error && "border-red-500")}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(undefined);
                }}
                placeholder="Write your title here"
              />
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
