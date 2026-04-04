import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex justify-center items-center flex-col bg-fuchsia-600 h-screen">
      <div className="mb-4 flex justify-center items-center">
        <h1 className="font-medium text-white font-Mackinac leading-18 text-6xl text-center">
          Test your students
          <br />
          Effortlessely
        </h1>
      </div>
      <div className="flex gap-1">
      <Link href="/dashboard">
        <Button className="group relative font-semibold rounded-lg text-lg p-5 hover:pr-8 text-fuchsia-600 bg-white">
         Teacher Dashboard
          <ArrowRight className="absolute duration-200 opacity-0 group-hover:opacity-100 right-0 mr-3" />
        </Button>
      </Link>
      <Link href="/room">
        <Button className="group relative font-semibold rounded-lg text-lg p-5 hover:pr-8 bg-fuchsia-500 text-white">
         Join a room
          <ArrowRight className="absolute duration-200 opacity-0 group-hover:opacity-100 right-0 mr-3" />
        </Button>
      </Link></div>
    </div>
  );
}
