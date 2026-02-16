import { Metadata } from "next";
import Link from "next/link";
import { Brain, ClipboardList } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Self-Service Tools | Veteran Resource Management",
  description:
    "Evidence-based mental health exercises and transition planning checklists to help veterans manage stress, improve sleep, and plan for civilian life.",
};

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">Self-Service Tools</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Free, evidence-based resources you can use anytime. These tools come
        from VA programs, DoD resources, and proven clinical practices.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link href="/tools/exercises" className="block hover:no-underline">
          <Card className="h-full transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Brain className="h-8 w-8 text-primary" />
                <CardTitle>Mental Health Exercises</CardTitle>
              </div>
              <CardDescription>
                Step-by-step exercises to manage PTSD, anxiety, sleep problems,
                and anger. Based on techniques from the VA PTSD Coach app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                4 topics • 16 exercises • 5-15 minutes each
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tools/transition" className="block hover:no-underline">
          <Card className="h-full transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <ClipboardList className="h-8 w-8 text-primary" />
                <CardTitle>Transition Planning Checklists</CardTitle>
              </div>
              <CardDescription>
                Time-based checklists to help you prepare for separation. Know
                what to do at 180 days, 90 days, and 30 days out.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                3 milestones • 23 action items • Links to official resources
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Important:</strong> These tools are not a substitute for
          professional care. If you are in crisis, please use the resources at
          the top of this page or call the Veterans Crisis Line at 988 (press
          1).
        </p>
      </div>
    </div>
  );
}
