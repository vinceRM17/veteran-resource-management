import { Metadata } from "next";
import Link from "next/link";
import { Shield, Heart, Moon, Flame, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mentalHealthExercises } from "@/content/mental-health-exercises";

export const metadata: Metadata = {
  title: "Mental Health Exercises | Veteran Resource Management",
  description:
    "Evidence-based self-help exercises for PTSD, anxiety, sleep, and anger management. Step-by-step techniques you can use anytime.",
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ptsd: Shield,
  anxiety: Heart,
  sleep: Moon,
  anger: Flame,
};

export default function ExercisesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/tools"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Self-Service Tools
      </Link>

      <h1 className="text-3xl font-bold mb-4">Mental Health Exercises</h1>
      <p className="text-lg text-muted-foreground mb-8">
        These exercises use proven techniques from the VA PTSD Coach app and
        other evidence-based programs. Each exercise includes step-by-step
        instructions you can follow on your own.
      </p>

      <div className="grid sm:grid-cols-2 gap-6">
        {mentalHealthExercises.map((topic) => {
          const Icon = iconMap[topic.slug] || Shield;
          return (
            <Link
              key={topic.slug}
              href={`/tools/exercises/${topic.slug}`}
              className="block hover:no-underline"
            >
              <Card className="h-full transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">{topic.name}</CardTitle>
                  </div>
                  <CardDescription>{topic.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">
                    {topic.exercises.length} exercise
                    {topic.exercises.length !== 1 ? "s" : ""}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
