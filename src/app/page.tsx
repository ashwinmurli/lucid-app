"use client";

import { useState } from "react";
import { colors, fonts, globalStyles } from "@/lib/tokens";
import { Header, PageShell, ScrollArea, Cinematic } from "@/components/ui";
import Dashboard from "@/modules/Dashboard";
import Discovery from "@/modules/Discovery";
import BrandPersonality from "@/modules/BrandPersonality";
import TensionPairs from "@/modules/TensionPairs";
import CoreValues from "@/modules/CoreValues";
import ToneOfVoice from "@/modules/ToneOfVoice";
import USPs from "@/modules/USPs";
import Manifesto from "@/modules/Manifesto";
import Summary from "@/modules/Summary";

const MODULE_ORDER = [
  "dashboard",
  "discovery",
  "personality",
  "tensions",
  "values",
  "tone",
  "usps",
  "manifesto",
  "summary",
];

const MODULE_LABELS: Record<string, string | null> = {
  dashboard: null,
  discovery: "Discovery",
  personality: "Strategy – Personality",
  tensions: "Strategy – Tensions",
  values: "Strategy – Values",
  tone: "Strategy – Tone",
  usps: "Strategy – USPs",
  manifesto: "Strategy – Manifesto",
  summary: "Summary",
};

export default function LucidApp() {
  const [currentModule, setCurrentModule] = useState("dashboard");
  const [transition, setTransition] = useState<{
    target: string;
    steps: string[];
  } | null>(null);

  // Shared project state — flows between modules
  const [projectData, setProjectData] = useState({
    briefAnswers: [] as { q: string; a: string }[],
    discoveryQuestions: [] as any[],
    gaps: [] as any[],
    personality: null as any,
    tensions: null as any,
    values: null as any,
    tone: null as any,
    usps: null as any,
    manifesto: "",
  });

  const updateProject = (key: string, value: any) => {
    setProjectData((prev) => ({ ...prev, [key]: value }));
  };

  const navigateTo = (target: string, cinematicSteps?: string[]) => {
    if (cinematicSteps) {
      setTransition({ target, steps: cinematicSteps });
      const duration = 600 + cinematicSteps.length * 1400 + 400;
      setTimeout(() => {
        setCurrentModule(target);
        setTransition(null);
      }, duration);
    } else {
      setCurrentModule(target);
    }
  };

  const goNext = () => {
    const idx = MODULE_ORDER.indexOf(currentModule);
    if (idx < MODULE_ORDER.length - 1) {
      navigateTo(MODULE_ORDER[idx + 1]);
    }
  };

  const goBack = () => {
    const idx = MODULE_ORDER.indexOf(currentModule);
    if (idx > 0) {
      navigateTo(MODULE_ORDER[idx - 1]);
    }
  };

  return (
    <PageShell>
      <style>{globalStyles}</style>

      {/* Cinematic transition overlay */}
      {transition && <Cinematic steps={transition.steps} />}

      <ScrollArea>
        {currentModule === "dashboard" && (
          <Dashboard
            onStartProject={() =>
              navigateTo("discovery", [
                "CREATING PROJECT",
                "PREPARING LUCY",
                "OPENING DISCOVERY",
              ])
            }
            onOpenProject={(project: any) => {
              // Map legacy module names and handle completed projects
              const moduleMap: Record<string, string> = { pvm: "values" };
              const raw = project.currentModule;
              const target = raw ? (moduleMap[raw] || raw) : "summary";
              const validTarget = MODULE_ORDER.includes(target) ? target : "personality";
              navigateTo(validTarget, [
                `OPENING ${project.name.toUpperCase()}`,
                "LOADING PROGRESS",
                `RESUMING ${(MODULE_LABELS[validTarget] || validTarget).toUpperCase()}`,
              ]);
            }}
          />
        )}

        {currentModule === "discovery" && (
          <Discovery
            onComplete={(data: any) => {
              updateProject("briefAnswers", data.briefAnswers);
              updateProject("discoveryQuestions", data.questions);
              updateProject("gaps", data.gaps);
              navigateTo("personality");
            }}
            onBack={() => setCurrentModule("dashboard")}
          />
        )}

        {currentModule === "personality" && (
          <BrandPersonality
            onComplete={(data: any) => {
              updateProject("personality", data);
              navigateTo("tensions");
            }}
            onBack={() => setCurrentModule("dashboard")}
          />
        )}

        {currentModule === "tensions" && (
          <TensionPairs
            onComplete={(data: any) => {
              updateProject("tensions", data);
              navigateTo("values");
            }}
            onBack={() => setCurrentModule("dashboard")}
          />
        )}

        {currentModule === "values" && (
          <CoreValues
            onComplete={(data: any) => {
              updateProject("values", data);
              navigateTo("tone");
            }}
            onBack={() => setCurrentModule("dashboard")}
          />
        )}

        {currentModule === "tone" && (
          <ToneOfVoice
            onComplete={(data: any) => {
              updateProject("tone", data);
              navigateTo("usps");
            }}
            onBack={() => setCurrentModule("dashboard")}
          />
        )}

        {currentModule === "usps" && (
          <USPs
            onComplete={(data: any) => {
              updateProject("usps", data);
              navigateTo("manifesto", [
                "READING BRAND WORK",
                "FINDING THE VOICE",
                "COMPOSING MANIFESTO",
              ]);
            }}
            onBack={() => setCurrentModule("dashboard")}
          />
        )}

        {currentModule === "manifesto" && (
          <Manifesto
            projectData={projectData}
            onComplete={(text: string) => {
              updateProject("manifesto", text);
              navigateTo("summary");
            }}
            onBack={() => setCurrentModule("dashboard")}
          />
        )}

        {currentModule === "summary" && (
          <Summary
            projectData={projectData}
            onBack={() => setCurrentModule("dashboard")}
          />
        )}
      </ScrollArea>
    </PageShell>
  );
}
