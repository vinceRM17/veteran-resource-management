import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { mentalHealthExercises } from "@/content/mental-health-exercises";

interface PageProps {
  params: Promise<{ topic: string }>;
}

export async function generateStaticParams() {
  return mentalHealthExercises.map((topic) => ({
    topic: topic.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { topic: topicSlug } = await params;
  const topic = mentalHealthExercises.find((t) => t.slug === topicSlug);

  if (!topic) {
    return {
      title: "Topic Not Found | Veteran Resource Management",
    };
  }

  return {
    title: `${topic.name} Exercises | Veteran Resource Management`,
    description: topic.description,
  };
}

export default async function ExerciseTopicPage({ params }: PageProps) {
  const { topic: topicSlug } = await params;
  const topic = mentalHealthExercises.find((t) => t.slug === topicSlug);

  if (!topic) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/tools/exercises"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to All Exercises
      </Link>

      <h1 className="text-3xl font-bold mb-4">{topic.name}</h1>
      <p className="text-lg text-muted-foreground mb-8">{topic.description}</p>

      <Accordion type="single" collapsible className="space-y-4">
        {topic.exercises.map((exercise) => (
          <AccordionItem
            key={exercise.id}
            value={exercise.id}
            className="border rounded-lg px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-left font-semibold">
                  {exercise.title}
                </span>
                <Badge variant="outline" className="ml-auto mr-2 shrink-0">
                  {exercise.duration}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <p className="text-muted-foreground mb-4">
                {exercise.description}
              </p>

              <h3 className="font-semibold mb-3">Steps:</h3>
              <ol className="list-decimal list-inside space-y-2 mb-6">
                {exercise.steps.map((step, index) => (
                  <li key={index} className="text-sm leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Tip:
                </p>
                <p className="text-sm text-blue-900">{exercise.tip}</p>
              </div>

              <p className="text-xs text-muted-foreground italic">
                {exercise.source}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-900">
          <strong>Safety Note:</strong> If any of these exercises bring up
          difficult feelings or memories, please reach out for support. Call
          the Veterans Crisis Line at <strong>988 (press 1)</strong> or text{" "}
          <strong>838255</strong>.
        </p>
      </div>
    </div>
  );
}
