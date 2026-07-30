"use client";

import { useMemo, useState } from "react";

type Profile = {
  name: string;
  email: string;
  phone: string;
  location: string;
  links: string;
  targetTitle: string;
  notificationEmail: string;
  summaryFacts: string;
  skills: string;
  experience: string;
  education: string;
  certifications: string;
};

type Keyword = {
  label: string;
  value: string;
  count: number;
};

type TemplateKey = "classic" | "compact" | "technical" | "executive";

type JobCard = {
  id: string;
  title: string;
  company: string;
  source: string;
  location: string;
  match: number;
  url: string;
};

type ApplicationRecord = {
  id: string;
  title: string;
  company: string;
  source: string;
  appliedAt: string;
  emailStatus: string;
};

const emptyProfile: Profile = {
  name: "",
  email: "",
  phone: "",
  location: "",
  links: "",
  targetTitle: "",
  notificationEmail: "",
  summaryFacts: "",
  skills: "",
  experience: "",
  education: "",
  certifications: "",
};

const sampleProfile: Profile = {
  name: "Avery Jordan",
  email: "avery@example.com",
  phone: "+1 555 0148",
  location: "Austin, TX",
  links: "linkedin.com/in/averyjordan | github.com/averyjordan",
  targetTitle: "Security Analyst",
  notificationEmail: "avery@example.com",
  summaryFacts:
    "Security analyst with hands-on experience in phishing triage, SIEM monitoring, incident response, and user awareness programs. Improved alert handling quality through playbooks and stakeholder reporting.",
  skills:
    "SIEM, Splunk, Microsoft Sentinel, phishing analysis, incident response, threat intelligence, Python, SQL, vulnerability management, security awareness, Jira",
  experience:
    "Security Analyst | Northwind Security | 2023-Present\n- Investigated phishing reports and reduced false-positive escalations by 28% through triage rules and analyst coaching.\n- Built weekly threat briefings for leadership using SIEM data, ticket trends, and incident timelines.\n- Partnered with IT to close high-risk vulnerability tickets and document remediation evidence.\n\nIT Support Specialist | Northwind Security | 2021-2023\n- Resolved endpoint, identity, and email security issues for 600+ employees.\n- Created knowledge base articles that cut repeated support requests by 18%.",
  education: "B.S. Information Technology | State University",
  certifications: "CompTIA Security+ | Google Cybersecurity Certificate",
};

const sampleDescription =
  "Job Title: Security Analyst\n\nWe are looking for a Security Analyst to monitor SIEM alerts, investigate phishing reports, support incident response, analyze threat intelligence, document playbooks, and partner with IT teams on vulnerability management. The ideal candidate has experience with Splunk or Microsoft Sentinel, Python or SQL, ticketing systems, stakeholder communication, and security awareness training.";

const stopWords = new Set([
  "about",
  "across",
  "after",
  "also",
  "and",
  "are",
  "with",
  "from",
  "this",
  "that",
  "the",
  "for",
  "you",
  "your",
  "our",
  "will",
  "can",
  "has",
  "have",
  "into",
  "their",
  "they",
  "them",
  "role",
  "job",
  "team",
  "work",
  "using",
  "use",
  "need",
  "needs",
  "plus",
  "must",
  "ideal",
  "candidate",
  "experience",
  "responsibilities",
  "requirements",
  "looking",
  "support",
  "including",
  "within",
  "strong",
]);

const skillBank = [
  "AWS",
  "Azure",
  "GCP",
  "React",
  "Next.js",
  "Node.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "Java",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Docker",
  "Kubernetes",
  "Terraform",
  "CI/CD",
  "GitHub Actions",
  "REST API",
  "GraphQL",
  "Salesforce",
  "HubSpot",
  "Tableau",
  "Power BI",
  "Excel",
  "financial modeling",
  "machine learning",
  "data analysis",
  "stakeholder management",
  "project management",
  "product strategy",
  "customer discovery",
  "roadmap planning",
  "incident response",
  "SIEM",
  "Splunk",
  "Microsoft Sentinel",
  "phishing analysis",
  "threat intelligence",
  "vulnerability management",
  "security awareness",
  "risk assessment",
  "Jira",
  "Agile",
  "Scrum",
];

const templates: Array<{ key: TemplateKey; label: string; note: string }> = [
  { key: "classic", label: "Classic", note: "Balanced one-page structure" },
  { key: "compact", label: "Compact", note: "Dense, recruiter-scan friendly" },
  { key: "technical", label: "Technical", note: "Skills and systems first" },
  { key: "executive", label: "Executive", note: "Leadership evidence first" },
];

const jobSites = [
  {
    name: "LinkedIn",
    buildUrl: (query: string, location: string) =>
      `https://www.linkedin.com/jobs/search/?keywords=${query}&location=${location}`,
  },
  {
    name: "Indeed",
    buildUrl: (query: string, location: string) =>
      `https://www.indeed.com/jobs?q=${query}&l=${location}`,
  },
  {
    name: "Glassdoor",
    buildUrl: (query: string, location: string) =>
      `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${query}&locT=C&locName=${location}`,
  },
  {
    name: "Google Jobs",
    buildUrl: (query: string, location: string) =>
      `https://www.google.com/search?q=${query}+jobs+${location}`,
  },
  {
    name: "Wellfound",
    buildUrl: (query: string) => `https://wellfound.com/jobs?query=${query}`,
  },
  {
    name: "Remote OK",
    buildUrl: (query: string) =>
      `https://remoteok.com/remote-${query.replaceAll("%20", "-")}-jobs`,
  },
];

function setField<K extends keyof Profile>(
  profile: Profile,
  key: K,
  value: Profile[K],
) {
  return { ...profile, [key]: value };
}

function splitList(value: string) {
  return value
    .split(/[\n,;|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").trim();
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function extractKeywords(description: string): Keyword[] {
  const text = normalize(description);
  if (!text) return [];

  const phraseHits = skillBank
    .filter((skill) => text.includes(normalize(skill)))
    .map((skill) => ({
      label: skill,
      value: normalize(skill),
      count: 4,
    }));

  const counts = new Map<string, number>();
  const words = text.match(/[a-z][a-z0-9+#.]{2,}/g) ?? [];
  for (const word of words) {
    if (stopWords.has(word) || /^\d+$/.test(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  const wordHits = Array.from(counts.entries())
    .map(([value, count]) => ({
      label: titleCase(value),
      value,
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const seen = new Set<string>();
  return [...phraseHits, ...wordHits]
    .filter((keyword) => {
      if (seen.has(keyword.value)) return false;
      seen.add(keyword.value);
      return true;
    })
    .slice(0, 20);
}

function detectRole(description: string, fallback: string) {
  if (fallback.trim()) return fallback.trim();
  const explicit = description.match(
    /(job title|position|role)\s*:\s*([^\n\r|]{3,80})/i,
  );
  if (explicit?.[2]) return explicit[2].trim();
  const firstLine = description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 5 && line.length < 80);
  return firstLine ?? "Target Role";
}

function getProfileText(profile: Profile) {
  return Object.values(profile).join(" ");
}

function getKeywordMatch(keywords: Keyword[], profile: Profile) {
  const profileText = normalize(getProfileText(profile));
  const matched = keywords.filter((keyword) => profileText.includes(keyword.value));
  const missing = keywords.filter((keyword) => !profileText.includes(keyword.value));
  return { matched, missing };
}

function scoreResume(description: string, profile: Profile, keywords: Keyword[]) {
  if (description.trim().length < 40) {
    return {
      score: 0,
      keywordScore: 0,
      structureScore: 0,
      proofScore: 0,
      issues: ["Add a job description to calculate ATS readiness."],
    };
  }

  const { matched, missing } = getKeywordMatch(keywords, profile);
  const keywordScore = Math.round((matched.length / Math.max(keywords.length, 1)) * 42);
  const contactScore = [profile.email, profile.phone, profile.location].filter(Boolean).length >= 2 ? 10 : 3;
  const sectionScore =
    (profile.skills.trim() ? 9 : 0) +
    (profile.experience.trim() ? 9 : 0) +
    (profile.education.trim() || profile.certifications.trim() ? 6 : 0);
  const structureScore = Math.min(28, contactScore + sectionScore);
  const proofCount =
    (profile.experience.match(/\d+[%+]?|\$\d+|[0-9]+x/gi) ?? []).length +
    (profile.summaryFacts.match(/\d+[%+]?|\$\d+|[0-9]+x/gi) ?? []).length;
  const proofScore = Math.min(18, proofCount * 6);
  const formatScore = 10;
  const score = Math.min(98, keywordScore + structureScore + proofScore + formatScore);

  const issues = [
    missing.length > 0 ? `${missing.length} important keywords are not backed by your profile.` : "",
    proofScore < 12 ? "Add quantified outcomes where they are truthful." : "",
    contactScore < 10 ? "Complete contact details before exporting." : "",
    profile.experience.trim() ? "" : "Add recent experience bullets.",
  ].filter(Boolean);

  return { score, keywordScore, structureScore, proofScore, issues };
}

function buildSummary(profile: Profile, role: string, matched: Keyword[]) {
  const facts = profile.summaryFacts.trim();
  const matchedSkills = matched.slice(0, 5).map((keyword) => keyword.label);

  if (!facts) {
    return `Candidate targeting ${role}. Add a truthful two-line summary with role scope, tools, and measurable outcomes.`;
  }

  const firstSentence = facts.split(/(?<=[.!?])\s+/)[0]?.replace(/[.!?]$/, "") ?? facts;
  const skillPhrase = matchedSkills.length
    ? ` with relevant work across ${matchedSkills.join(", ")}`
    : "";

  return `${firstSentence}${skillPhrase}.`;
}

function getRankedSkills(profile: Profile, matched: Keyword[]) {
  const skills = splitList(profile.skills);
  if (!skills.length) return [];
  const matchedValues = new Set(matched.map((keyword) => keyword.value));
  return [...skills].sort((a, b) => {
    const aMatched = matchedValues.has(normalize(a)) ? 1 : 0;
    const bMatched = matchedValues.has(normalize(b)) ? 1 : 0;
    return bMatched - aMatched || a.localeCompare(b);
  });
}

function getExperienceLines(profile: Profile, keywords: Keyword[]) {
  const lines = profile.experience
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return [];

  const keywordValues = keywords.map((keyword) => keyword.value);
  return [...lines].sort((a, b) => {
    const aText = normalize(a);
    const bText = normalize(b);
    const aHits = keywordValues.filter((keyword) => aText.includes(keyword)).length;
    const bHits = keywordValues.filter((keyword) => bText.includes(keyword)).length;
    return bHits - aHits;
  });
}

function buildResumeText(
  profile: Profile,
  role: string,
  summary: string,
  rankedSkills: string[],
  experienceLines: string[],
) {
  const contact = [profile.email, profile.phone, profile.location, profile.links]
    .filter(Boolean)
    .join(" | ");

  return [
    profile.name || "Your Name",
    role,
    contact,
    "",
    "SUMMARY",
    summary,
    "",
    "SKILLS",
    rankedSkills.length ? rankedSkills.join(", ") : "Add verified skills that match the target role.",
    "",
    "EXPERIENCE",
    experienceLines.length
      ? experienceLines.join("\n")
      : "Add company, title, dates, and achievement bullets with truthful metrics.",
    "",
    profile.certifications.trim() ? `CERTIFICATIONS\n${profile.certifications.trim()}\n` : "",
    profile.education.trim() ? `EDUCATION\n${profile.education.trim()}` : "",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function buildSearchLinks(role: string, location: string) {
  const query = encodeURIComponent(role || "open role");
  const encodedLocation = encodeURIComponent(location || "United States");
  return jobSites.map((site) => ({
    name: site.name,
    url: site.buildUrl(query, encodedLocation),
  }));
}

function buildJobCards(role: string, location: string, keywords: Keyword[]) {
  const safeRole = role === "Target Role" ? "Relevant Role" : role;
  const places = location.trim() || "Remote";
  const keywordBonus = Math.min(12, keywords.length * 2);
  const links = buildSearchLinks(safeRole, places);
  const cards: JobCard[] = [
    {
      id: "linkedin-1",
      title: safeRole,
      company: "Northstar Labs",
      source: "LinkedIn",
      location: places,
      match: 76 + keywordBonus,
      url: links[0].url,
    },
    {
      id: "indeed-1",
      title: `Associate ${safeRole}`,
      company: "BrightPath Systems",
      source: "Indeed",
      location: places,
      match: 72 + keywordBonus,
      url: links[1].url,
    },
    {
      id: "glassdoor-1",
      title: `Senior ${safeRole}`,
      company: "HarborWorks",
      source: "Glassdoor",
      location: places,
      match: 68 + keywordBonus,
      url: links[2].url,
    },
    {
      id: "google-1",
      title: `${safeRole} - Growth Team`,
      company: "Atlas Ridge",
      source: "Google Jobs",
      location: places,
      match: 70 + keywordBonus,
      url: links[3].url,
    },
  ];

  return cards.map((card) => ({
    ...card,
    match: Math.min(97, card.match),
  }));
}

function applicationDescription(job: JobCard, keywords: Keyword[]) {
  const priorityTerms = keywords
    .slice(0, 8)
    .map((keyword) => keyword.label)
    .join(", ");

  return `Job Title: ${job.title}
Company: ${job.company}
Source: ${job.source}

Responsibilities:
- Deliver work aligned to ${job.title} priorities.
- Use evidence from the resume to show experience with ${priorityTerms || "the required tools and responsibilities"}.
- Communicate outcomes clearly with hiring stakeholders.

Requirements:
- Verified experience from the candidate profile.
- ATS-friendly single-column resume format.
- Resume statements must remain truthful and evidence-backed.`;
}

function mailtoFor(job: JobCard, recipient: string) {
  const subject = `Application recorded: ${job.title} at ${job.company}`;
  const body = [
    `Application recorded for ${job.title} at ${job.company}.`,
    `Source: ${job.source}`,
    `Location: ${job.location}`,
    `Recorded: ${new Date().toLocaleString()}`,
    "",
    "Resume packet: tailored and ready from the ATS Resume Builder.",
  ].join("\n");

  return `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}

export function ResumeBuilderApp() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState<TemplateKey>("classic");
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const role = useMemo(
    () => detectRole(description, profile.targetTitle),
    [description, profile.targetTitle],
  );
  const keywords = useMemo(() => extractKeywords(description), [description]);
  const { matched, missing } = useMemo(
    () => getKeywordMatch(keywords, profile),
    [keywords, profile],
  );
  const readiness = useMemo(
    () => scoreResume(description, profile, keywords),
    [description, profile, keywords],
  );
  const rankedSkills = useMemo(
    () => getRankedSkills(profile, matched),
    [profile, matched],
  );
  const experienceLines = useMemo(
    () => getExperienceLines(profile, keywords),
    [profile, keywords],
  );
  const summary = useMemo(
    () => buildSummary(profile, role, matched),
    [profile, role, matched],
  );
  const resumeText = useMemo(
    () => buildResumeText(profile, role, summary, rankedSkills, experienceLines),
    [profile, role, summary, rankedSkills, experienceLines],
  );
  const searchLinks = useMemo(
    () => buildSearchLinks(role, profile.location),
    [role, profile.location],
  );
  const jobCards = useMemo(
    () => buildJobCards(role, profile.location, keywords),
    [role, profile.location, keywords],
  );

  const selectedTemplate =
    templates.find((item) => item.key === template) ?? templates[0];

  function downloadResume() {
    const blob = new Blob([resumeText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = `${profile.name || "tailored"}-${role}`.replace(
      /[^a-z0-9]+/gi,
      "-",
    );
    link.href = url;
    link.download = `${safeName}-resume.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyResume() {
    await navigator.clipboard.writeText(resumeText);
  }

  function tailorForJob(job: JobCard) {
    setSelectedJobId(job.id);
    setDescription(applicationDescription(job, keywords));
    setProfile((current) =>
      current.targetTitle ? current : setField(current, "targetTitle", job.title),
    );
  }

  function recordApplied(job: JobCard) {
    const recipient = profile.notificationEmail || profile.email;
    const appliedAt = new Date().toLocaleString();
    setApplications((current) => [
      {
        id: `${job.id}-${Date.now()}`,
        title: job.title,
        company: job.company,
        source: job.source,
        appliedAt,
        emailStatus: recipient ? "Email draft opened" : "Add email first",
      },
      ...current,
    ]);

    if (recipient) {
      window.open(mailtoFor(job, recipient), "_blank", "noopener,noreferrer");
    }
  }

  return (
    <main className="app-shell">
      <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="no-print grid gap-4 border-b border-[#d9d6c8] pb-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase text-[#0f766e]">
              Resume Builder App
            </p>
            <h1 className="mt-2 max-w-4xl text-3xl font-black leading-tight text-[#18211d] sm:text-5xl">
              ATS resume and reviewed job application workspace
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="action-button action-secondary"
              onClick={() => {
                setProfile(sampleProfile);
                setDescription(sampleDescription);
              }}
              aria-label="Load sample resume and job description"
            >
              <span aria-hidden="true">+</span>
              Sample
            </button>
            <button
              type="button"
              className="action-button action-secondary"
              onClick={() => window.print()}
              aria-label="Print the tailored resume"
            >
              <span aria-hidden="true">P</span>
              Print
            </button>
            <button
              type="button"
              className="action-button action-primary"
              onClick={downloadResume}
              aria-label="Download the tailored resume as plain text"
            >
              <span aria-hidden="true">D</span>
              Download
            </button>
          </div>
        </header>

        <section className="no-print grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="metric">
            <p className="text-xs font-black uppercase text-[#53615a]">
              ATS readiness
            </p>
            <p className="mt-1 text-3xl font-black">{readiness.score}%</p>
          </div>
          <div className="metric">
            <p className="text-xs font-black uppercase text-[#53615a]">
              Keyword match
            </p>
            <p className="mt-1 text-3xl font-black">
              {matched.length}/{keywords.length || 0}
            </p>
          </div>
          <div className="metric">
            <p className="text-xs font-black uppercase text-[#53615a]">
              Evidence score
            </p>
            <p className="mt-1 text-3xl font-black">{readiness.proofScore}/18</p>
          </div>
          <div className="metric">
            <p className="text-xs font-black uppercase text-[#53615a]">
              Applications
            </p>
            <p className="mt-1 text-3xl font-black">{applications.length}</p>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)_390px]">
          <section className="panel no-print overflow-hidden">
            <div className="border-b border-[#d9d6c8] px-5 py-4">
              <h2 className="text-xl font-black">Profile and job description</h2>
            </div>
            <div className="grid gap-4 px-5 py-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <label>
                  <span className="field-label">Full name</span>
                  <input
                    className="field"
                    value={profile.name}
                    onChange={(event) =>
                      setProfile(setField(profile, "name", event.target.value))
                    }
                    placeholder="Your name"
                  />
                </label>
                <label>
                  <span className="field-label">Target role</span>
                  <input
                    className="field"
                    value={profile.targetTitle}
                    onChange={(event) =>
                      setProfile(setField(profile, "targetTitle", event.target.value))
                    }
                    placeholder="Security Analyst"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <label>
                  <span className="field-label">Email</span>
                  <input
                    className="field"
                    value={profile.email}
                    onChange={(event) =>
                      setProfile(setField(profile, "email", event.target.value))
                    }
                    placeholder="you@example.com"
                  />
                </label>
                <label>
                  <span className="field-label">Phone</span>
                  <input
                    className="field"
                    value={profile.phone}
                    onChange={(event) =>
                      setProfile(setField(profile, "phone", event.target.value))
                    }
                    placeholder="+1 555 0100"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <label>
                  <span className="field-label">Location</span>
                  <input
                    className="field"
                    value={profile.location}
                    onChange={(event) =>
                      setProfile(setField(profile, "location", event.target.value))
                    }
                    placeholder="City, state, remote"
                  />
                </label>
                <label>
                  <span className="field-label">Notification email</span>
                  <input
                    className="field"
                    value={profile.notificationEmail}
                    onChange={(event) =>
                      setProfile(
                        setField(profile, "notificationEmail", event.target.value),
                      )
                    }
                    placeholder="Where alerts go"
                  />
                </label>
              </div>

              <label>
                <span className="field-label">Links</span>
                <input
                  className="field"
                  value={profile.links}
                  onChange={(event) =>
                    setProfile(setField(profile, "links", event.target.value))
                  }
                  placeholder="LinkedIn, portfolio, GitHub"
                />
              </label>

              <label>
                <span className="field-label">Job description</span>
                <textarea
                  className="field min-h-44 resize-y"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Paste the full job description here."
                />
              </label>

              <label>
                <span className="field-label">Summary evidence</span>
                <textarea
                  className="field min-h-28 resize-y"
                  value={profile.summaryFacts}
                  onChange={(event) =>
                    setProfile(setField(profile, "summaryFacts", event.target.value))
                  }
                  placeholder="Verified scope, tools, domain, and outcomes."
                />
              </label>

              <label>
                <span className="field-label">Skills</span>
                <textarea
                  className="field min-h-24 resize-y"
                  value={profile.skills}
                  onChange={(event) =>
                    setProfile(setField(profile, "skills", event.target.value))
                  }
                  placeholder="Comma-separated verified skills."
                />
              </label>

              <label>
                <span className="field-label">Experience</span>
                <textarea
                  className="field min-h-52 resize-y"
                  value={profile.experience}
                  onChange={(event) =>
                    setProfile(setField(profile, "experience", event.target.value))
                  }
                  placeholder={
                    "Role | Company | Dates\n- Achievement with metric\n- Tool, action, result"
                  }
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <label>
                  <span className="field-label">Education</span>
                  <textarea
                    className="field min-h-20 resize-y"
                    value={profile.education}
                    onChange={(event) =>
                      setProfile(setField(profile, "education", event.target.value))
                    }
                    placeholder="Degree, school, year"
                  />
                </label>
                <label>
                  <span className="field-label">Certifications</span>
                  <textarea
                    className="field min-h-20 resize-y"
                    value={profile.certifications}
                    onChange={(event) =>
                      setProfile(
                        setField(profile, "certifications", event.target.value),
                      )
                    }
                    placeholder="Relevant certifications"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="grid gap-5 print-area">
            <div className="panel no-print px-5 py-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <h2 className="text-xl font-black">ATS analysis</h2>
                  <p className="mt-1 text-sm font-semibold text-[#53615a]">
                    Score cap is 98 because ATS behavior varies by employer system.
                  </p>
                </div>
                <button
                  type="button"
                  className="action-button action-secondary"
                  onClick={copyResume}
                  aria-label="Copy the tailored resume text"
                >
                  <span aria-hidden="true">C</span>
                  Copy resume
                </button>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="field-label">Matched keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {matched.length ? (
                      matched.map((keyword) => (
                        <span className="keyword-chip good" key={keyword.value}>
                          <span aria-hidden="true">+</span>
                          {keyword.label}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm font-semibold text-[#53615a]">
                        No verified matches yet.
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="field-label">Gaps to verify</p>
                  <div className="flex flex-wrap gap-2">
                    {missing.slice(0, 12).length ? (
                      missing.slice(0, 12).map((keyword) => (
                        <span className="keyword-chip missing" key={keyword.value}>
                          <span aria-hidden="true">!</span>
                          {keyword.label}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm font-semibold text-[#53615a]">
                        No keyword gaps detected.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {readiness.issues.length > 0 ? (
                <div className="mt-4 grid gap-2">
                  {readiness.issues.map((issue) => (
                    <div
                      className="rounded-[8px] border border-[#f2cf9f] bg-[#fff8ed] px-3 py-2 text-sm font-bold text-[#7c2d12]"
                      key={issue}
                    >
                      {issue}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="panel no-print px-5 py-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <h2 className="text-xl font-black">ATS-friendly templates</h2>
                  <p className="mt-1 text-sm font-semibold text-[#53615a]">
                    Selected: {selectedTemplate.note}
                  </p>
                </div>
                <div
                  className="flex flex-wrap gap-2"
                  role="tablist"
                  aria-label="Resume template"
                >
                  {templates.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={`action-button ${
                        template === item.key ? "action-primary" : "action-secondary"
                      }`}
                      onClick={() => setTemplate(item.key)}
                      aria-pressed={template === item.key}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <article className={`resume-page resume-template-${template}`}>
              <header>
                <h2>{profile.name || "Your Name"}</h2>
                <p className="mt-1 text-base font-bold text-[#3f4b45]">{role}</p>
                <p className="mt-2 text-sm text-[#53615a]">
                  {[profile.email, profile.phone, profile.location, profile.links]
                    .filter(Boolean)
                    .join(" | ") || "email@example.com | phone | location | links"}
                </p>
              </header>

              <section>
                <h3>Summary</h3>
                <p>{summary}</p>
              </section>

              <section>
                <h3>Skills</h3>
                <p>
                  {rankedSkills.length
                    ? rankedSkills.join(", ")
                    : "Add verified skills that match the target role."}
                </p>
              </section>

              <section>
                <h3>Experience</h3>
                {experienceLines.length ? (
                  <ul>
                    {experienceLines.map((line) => (
                      <li key={line}>{line.replace(/^-+\s*/, "")}</li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    Add company, title, dates, and achievement bullets with truthful
                    metrics.
                  </p>
                )}
              </section>

              {profile.certifications.trim() ? (
                <section>
                  <h3>Certifications</h3>
                  <p>{profile.certifications}</p>
                </section>
              ) : null}

              {profile.education.trim() ? (
                <section>
                  <h3>Education</h3>
                  <p>{profile.education}</p>
                </section>
              ) : null}
            </article>
          </section>

          <aside className="panel no-print overflow-hidden">
            <div className="border-b border-[#d9d6c8] px-5 py-4">
              <h2 className="text-xl font-black">Jobs and applications</h2>
            </div>

            <div className="grid gap-5 px-5 py-5">
              <section>
                <p className="field-label">Multi-site job search</p>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  {searchLinks.map((link) => (
                    <a
                      className="action-button action-secondary"
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      key={link.name}
                    >
                      <span aria-hidden="true">O</span>
                      {link.name}
                    </a>
                  ))}
                </div>
              </section>

              <section className="grid gap-3">
                <p className="field-label">Matched roles</p>
                {jobCards.map((job) => (
                  <article
                    className={`rounded-[8px] border bg-white p-4 ${
                      selectedJobId === job.id
                        ? "border-[#0f766e]"
                        : "border-[#d9d6c8]"
                    }`}
                    key={job.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-black">{job.title}</h3>
                        <p className="mt-1 text-sm font-bold text-[#53615a]">
                          {job.company} | {job.source}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#e9f7f4] px-2.5 py-1 text-xs font-black text-[#115e59]">
                        {job.match}%
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-[#53615a]">
                      {job.location}
                    </p>
                    <div className="mt-3 grid gap-2">
                      <a
                        className="action-button action-secondary"
                        href={job.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span aria-hidden="true">O</span>
                        Open posting search
                      </a>
                      <button
                        type="button"
                        className="action-button action-warm"
                        onClick={() => tailorForJob(job)}
                      >
                        <span aria-hidden="true">T</span>
                        Tailor resume
                      </button>
                      <button
                        type="button"
                        className="action-button action-primary"
                        onClick={() => recordApplied(job)}
                      >
                        <span aria-hidden="true">E</span>
                        Mark applied + email
                      </button>
                    </div>
                  </article>
                ))}
              </section>

              <section className="grid gap-3">
                <p className="field-label">Application log</p>
                {applications.length ? (
                  applications.map((item) => (
                    <div
                      className="rounded-[8px] border border-[#d9d6c8] bg-white p-3"
                      key={item.id}
                    >
                      <p className="font-black">{item.title}</p>
                      <p className="text-sm font-semibold text-[#53615a]">
                        {item.company} | {item.source}
                      </p>
                      <p className="mt-1 text-xs font-bold text-[#53615a]">
                        {item.appliedAt} | {item.emailStatus}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm font-semibold text-[#53615a]">
                    Reviewed applications appear here.
                  </p>
                )}
              </section>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
