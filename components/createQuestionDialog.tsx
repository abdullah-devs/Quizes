'use client'

import axios from "axios";
import { Loader2, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";

export function CreateQuestionDialog({
  examId,
  onCreate,
}: {
  examId: number;
  onCreate?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState<
    { id: number; title: string; correct: boolean }[]
  >([
    {
      id: 1,
      title: "Choice 1",
      correct: true,
    },
    {
      id: 2,
      title: "Choice 2",
      correct: false,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    setIsLoading(true);

    await axios
      .post(`/api/exam/${examId}/question`, {
        title: question,
        choices: choices.map(({ title, correct }) => ({ title, correct })),
      })
      .then((res) => {
        if (res.status === 201) {
          setQuestion("");
          setChoices([
            {
              id: 1,
              title: "Choice 1",
              correct: true,
            },
            {
              id: 2,
              title: "Choice 2",
              correct: false,
            },
          ]);
          onCreate?.();
          setIsOpen(false);
        }
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
          setQuestion("");
          setChoices([
            {
              id: 1,
              title: "Choice 1",
              correct: true,
            },
            {
              id: 2,
              title: "Choice 2",
              correct: false,
            },
          ]);
        }
        setIsOpen(open);
      }}
    >
      <form>
        <DialogTrigger asChild>
          <Button>Create Question</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create a question</DialogTitle>
            <DialogDescription>
              Add your question details here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="name-1">Question</Label>
              <Textarea
                id="title-1"
                name="title"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Write your question here"
              />
            </Field>
            <Field>
              <div className="mb-2 flex items-center justify-between">
                <Label>Choices</Label>
                <Label>Is correct answer</Label>
              </div>
              {choices.map((choice, index) => (
                <div key={choice.id} className="flex items-start gap-2">
                  <Textarea
                    name={`choice-${index}`}
                    defaultValue={choice.title}
                    placeholder={`Choice ${index + 1}`}
                    onChange={(e) => {
                      const value = e.target.value;
                      setChoices((prev) =>
                        prev.map((c) =>
                          c.id === choice.id ? { ...c, title: value } : c,
                        ),
                      );
                    }}
                  />
                  <div>
                    <Switch
                      checked={choice.correct}
                      onCheckedChange={(checked) => {
                        if (
                          !checked &&
                          choices.filter((c) => c.correct).length === 1
                        ) {
                          return;
                        }
                        setChoices((prev) =>
                          prev.map((c, i) =>
                            i === index
                              ? { ...c, correct: checked }
                              : { ...c, correct: false },
                          ),
                        );
                      }}
                    />
                    <Button
                      disabled={choices.length <= 2}
                      variant="outline"
                      className="text-red-500"
                      onClick={() => {
                        setChoices((prev) =>
                          prev.filter((_, i) => _.id !== choice.id),
                        );
                        if (choice.correct) {
                          setChoices((prev) =>
                            prev.map((c, i) =>
                              i === 0 ? { ...c, correct: true } : c,
                            ),
                          );
                        }
                      }}
                    >
                      <X />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  setChoices((prev) => [
                    ...prev,
                    {
                      id: Math.max(...prev.map((choice) => choice.id)) + 1,
                      title: `Choice ${Math.max(...prev.map((choice) => choice.id))}`,
                      correct: false,
                    },
                  ]);
                }}
              >
                Add Choice
              </Button>
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
