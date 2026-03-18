import Exam from "@/components/ui/exam"

export default async function ExamPage({ params }: { params: Promise<{ examId: string }> }) {
    const examId = (await params).examId
    return (
        <div className="flex w-full items-center justify-center">
            <Exam id={parseInt(examId)} />
        </div>
    )
}