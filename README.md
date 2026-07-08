# 📡 TechDebt Radar

> AI-powered codebase health scanner. Paste any GitHub repo URL and get a full tech debt audit — outdated dependency risks explained in plain English, complexity hotspots, and a prioritized fix roadmap — in under 30 seconds.

[![Live Demo](https://img.shields.io/badge/Live-Demo-cyan)](https://techdebt-radar.vercel.app/)
[![React](https://img.shields.io/badge/React-18-blue)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)]()
[![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-orange)]()

---

## Features

- 📦 **Dependency Health** — checks top 20 packages against npm registry, flags outdated ones by severity
- 🔒 **Security Risk Analysis** — AI explains actual exploit risk per package in plain English, not just CVE numbers
- 🔥 **Complexity Hotspots** — identifies large stale files that are hardest to maintain and test
- 🧪 **Test Coverage Signal** — detects test file ratio across the codebase
- 🗺️ **Prioritized Roadmap** — AI generates a "fix this first" action plan with effort estimates
- 📡 **Radar Chart** — animated SVG spider chart showing 4 health dimensions at a glance
- 🔒 Privacy-first — keys stored in session only, never logged

## Tech Stack

- React 18 + TypeScript + Vite
- Groq API (LLaMA 3.3 70B) — free tier
- GitHub REST API — no auth needed for public repos
- npm Registry API — live version checks
- Pure SVG radar chart — no chart library needed
- Deployed on Vercel

## Running Locally

git clone https://github.com/SaadKhan17223/techdebt-radar
cd techdebt-radar
npm install
npm run dev

Get a free Groq API key at https://console.groq.com

## Usage

1. Paste any public GitHub repo URL
2. Enter your free Groq API key
3. Optionally add a GitHub token for private repos or higher rate limits
4. Hit Scan — results in ~20 seconds

## Examples

Try scanning these repos to see it in action:
- https://github.com/facebook/react
- https://github.com/vitejs/vite
- https://github.com/vercel/next.js
