# EcoCity Ghana

EcoCity Ghana is a civic technology and smart community reporting platform for Ghanaian communities. It is designed to help residents and local stakeholders report, save, organize, and track community issues such as flooding, blocked drains, poor drainage, illegal dumping, sanitation concerns, unsafe roads, broken streetlights, public infrastructure issues, and community safety risks.

The project uses Next.js, Tailwind CSS, MapTiler, MapLibre, and Supabase to present the public product experience, including a citizen reporting flow with real report persistence, community reports tracking, issue categories, an interactive community map, dashboard analytics, and upcoming capabilities such as Flood & Drainage Watch.

This repository does not include authentication, private server APIs, image uploads, AI features, or production deployment configuration.

## Run Locally

```bash
npm install
npm run dev
```

Create a local `.env.local` file with the browser keys required by the map and Supabase:

```bash
NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Run the SQL in `supabase-schema.sql` in the Supabase SQL editor before submitting reports. The schema creates the `reports` table, sensible defaults, indexes, and public insert/select policies for the MVP.

Reports can be submitted with a community or landmark description, browser-captured current location, a selected map pin, location search, or manually entered coordinates. Reports without map coordinates still appear in the community reports register and dashboard analytics, but map markers require current location, map pin selection, or latitude and longitude; reports without map location are listed separately on the map page.

Open `http://localhost:3000` in your browser.
