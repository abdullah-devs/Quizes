"use client";

import axios from "axios";
import { BookOpenCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setIsLoading(true);

    const payload = {
      email: e.currentTarget.email.value,
      password: e.currentTarget.password.value,
    };

    await axios
      .post("/api/login", payload)
      .then((res) => {
        if (res.status === 200) {
          router.push("/dashboard");
        }
      })
      .catch((err) => {
        setError(err.response.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-8 items-center justify-center rounded-md">
              <BookOpenCheck className="size-6" />
            </div>

            <h1 className="text-xl font-bold">Welcome to Quizes</h1>
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <Field className="gap-0.5">
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              className={cn(error && "border-red-500")}
              onChange={() => setError(undefined)}
              required
            />
          </Field>
          <Field className="gap-0.5">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="password"
              className={cn(error && "border-red-500")}
              onChange={() => setError(undefined)}
              required
            />
          </Field>
          <Field>
            <Button
              disabled={isLoading}
              className="font-semibold text-md py-4.5"
              type="submit"
            >
              {isLoading && <Loader2 className="animate-spin" />}
              Sign In
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
