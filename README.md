# ATS Resume Builder and Job Copilot

An interactive resume builder that analyzes a pasted job description, scores resume readiness, highlights matched and missing ATS keywords, and generates a truthful tailored resume preview.

Live app: https://ats-resume-job-copilot.netlify.app

## Features

- Job description keyword extraction and ATS readiness scoring
- Truth-first tailoring that only boosts skills and bullets already present in the candidate profile
- Four ATS-friendly templates: Classic, Compact, Technical, and Executive
- Copy, print, and download resume actions
- Multi-site job search links for LinkedIn, Indeed, Glassdoor, Google Jobs, Wellfound, and Remote OK
- Application log with a manual review step and email draft notification

## Important Boundaries

This app does not guarantee a perfect ATS score because each employer uses different parsing and ranking rules. It also does not silently auto-apply to jobs. Applications are recorded only after the user reviews the job, and email notification uses a local mail draft.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm test
```

## Netlify

Netlify uses `netlify.toml`:

```toml
[build]
  command = "npm run build:netlify"
  publish = "out"
```
