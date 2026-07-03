# EcoCity Ghana

EcoCity Ghana is a civic technology and smart community reporting platform for Ghanaian communities. It is designed to help residents and local stakeholders report, organize, and track community issues such as flooding, blocked drains, poor drainage, illegal dumping, sanitation concerns, unsafe roads, broken streetlights, public infrastructure issues, and community safety risks.

The project uses Next.js and Tailwind CSS to present the public product experience, including a frontend citizen reporting flow, community reports tracking, issue categories, an interactive community map, dashboard analytics, and upcoming capabilities such as Flood & Drainage Watch.

This repository does not include authentication, databases, APIs, image uploads, AI features, or production deployment configuration.

## Run Locally

```bash
npm install
npm run dev
```

Create a local `.env.local` file with a MapTiler browser key for the interactive map:

```bash
NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key_here
```

Open `http://localhost:3000` in your browser.
