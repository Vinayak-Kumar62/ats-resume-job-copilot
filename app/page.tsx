import type { Metadata } from "next";
import { ResumeBuilderApp } from "./resume-builder-app";

export const metadata: Metadata = {
  title: "ATS Resume Builder and Job Copilot",
  description:
    "Analyze a job description, tailor a truthful ATS-friendly resume, and manage job applications.",
};

export default function Home() {
  return <ResumeBuilderApp />;
}
