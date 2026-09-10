# Portfolio Website + Admin Panel — Build Plan

Reference: https://www.katiavannoy.com/
Goal: Replicate the UI/UX and functionality of the reference site, but with the section list itself made dynamic — your client can add, remove, and reorder nav sections from the admin panel, not just edit content within fixed pages.

**Update from v1:** the reference site's exact page list (Editing / Voiceover / Resumé / About / Book Me) is now treated as a *default*, not a fixed structure. The real requirement is a small content system where "a section of the site" is itself a manageable, addable/removable thing.

---

## 1. What the reference site does (audit, for design reference only)

Pulled from the live pages — used here to inform the UI, not to fix the site's structure:

- Sticky nav, small tracked-out labels; thin horizontal-rule dividers between sections with small uppercase labels; consistent footer (site URL, email, phone, Instagram + Vimeo)
- **Home**: hero (name + tagline + portrait), bio summary, "quick links" grid of press/work mentions, philosophy text block, repeated CTA line, Book Me button
- **Portfolio-style pages** (Editing, Voiceover): a heading, then a repeating unit — bold title (`Client // Project // Year`), short description, one embedded video (or a linked article instead)
- **Content pages** (About): photo + bio text, nothing else
- **Resume**: standalone page, text or embedded PDF

That gives three *reusable page templates*, which is exactly what the new dynamic system below is built around: **Gallery** (repeating work-item units), **Content** (freeform text + image), **Resume** (structured CV entries + optional PDF).

---

## 2. What's changing: dynamic sections instead of fixed pages

Instead of hardcoding routes for Editing/Voiceover/Resume/About/Booking, the site has one generic concept — a **Section** — stored in the database:

- Each Section has a nav label, a URL slug, an order, a visibility toggle, and a **type** (`GALLERY`, `CONTENT`, or `RESUME`) that determines which template renders it and which admin form manages it.
- The public navbar is rendered by querying visible Sections, ordered by `order` — not by reading a hardcoded list.
- The admin panel gets a **"Manage Sections"** screen: add a new section (pick a name + type), delete a section, drag to reorder, toggle a section on/off without deleting it.
- **Home stays fixed** — every site needs a landing page, so it isn't a deletable Section. Its content (hero, bio, quick links, philosophy, CTA) is still fully editable in admin, just under its own dedicated screen rather than the Section system. Flag if you'd rather Home be manageable/removable too — it's a small change to generalize it into a fourth Section type.

**Seeded for launch (as requested):** `Editing portfolio` (Gallery), `Resume` (Resume), `About` (Content). Voiceover and Book Me are left out of the nav by default but the system supports adding them — or anything else entirely — back at any time with no code changes, since they're just new rows, not new routes to build.

---

## 3. Recommended stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14+ (App Router, TypeScript)** | One codebase for the public site (dynamic `[slug]` routing) and the admin panel |
| Styling | **Tailwind CSS** | Matches the reference's minimal, whitespace-driven layout |
| Database | **PostgreSQL** (Neon or Supabase) | Relational fit for sections → items/entries, with ordering |
| ORM | **Prisma** | Type-safe, easy migrations |
| Auth | **NextAuth.js, Credentials provider, single admin user** | Client is the only admin — no multi-role complexity needed |
| Media storage | **Cloudinary** | Drag-and-drop upload UX for a non-technical client; auto-optimizes images |
| Video — pasted link | YouTube/Vimeo URL, rendered as an embed | Matches the reference exactly, zero hosting cost |
| Video — uploaded file | **Cloudflare Stream** | Client can upload a raw video file directly (not just paste a link). See note below on why this isn't Cloudinary. |
| Audio (if a voiceover/audio-type gallery is added later) | Uploaded file → Cloudinary, played with `<audio>` | Handled generically by the Gallery item's media type, no schema change needed |
| Email (booking, if re-added) | **Resend** | Simple transactional email for inquiry notifications |
| Hosting | **Vercel** + Neon/Supabase + Cloudinary + Cloudflare Stream | Free/cheap tiers cover a portfolio site |

**Why not just upload video files to Cloudinary?** Cloudinary's video handling is billed strictly per second of *delivered* output against a shared monthly credit pool (25 credits on the free plan) — a portfolio with a few embedded showreels being watched by prospective clients burns through that fast, and the next tier up is $89–99/month, which is a lot for a personal site. Cloudflare Stream is purpose-built for this instead: **$5 per 1,000 minutes stored + $1 per 1,000 minutes delivered**, no free tier but no minimum plan either — a realistic portfolio (a few hours of reels, modest traffic) runs a few dollars a month. It also auto-generates adaptive-bitrate renditions and thumbnails, so the client doesn't need to export multiple qualities themselves. Cloudinary stays in the stack for images, PDFs, and audio, which are cheap and fine on it.

---

## 4. Data model

```prisma
// schema.prisma

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}

// Fixed, non-deletable home page content + global settings
model SiteSettings {
  id             String  @id @default("singleton")
  heroImageUrl   String?
  heroNameLine1  String  @default("Katia")
  heroNameLine2  String  @default("Vannoy")
  heroTagline    String  @default("")
  bioImageUrl    String?
  bioText        String  @db.Text
  philosophyText String  @db.Text
  ctaText        String  @default("Let's make something together!")
  email          String
  phone          String
  instagramUrl   String?
  vimeoUrl       String?
}

model QuickLink {
  id           String @id @default(cuid())
  url          String
  thumbnailUrl String?
  order        Int    @default(0)
}

enum SectionType {
  GALLERY   // repeating work-item units (Editing portfolio, Voiceover portfolio, etc.)
  CONTENT   // freeform text + image (About, or any custom page)
  RESUME    // structured CV entries + optional PDF
}

// The addable/removable/reorderable nav sections
model Section {
  id        String      @id @default(cuid())
  slug      String      @unique   // e.g. "editing-portfolio" -> /editing-portfolio
  navLabel  String                 // e.g. "Editing portfolio"
  type      SectionType
  order     Int         @default(0)
  isVisible Boolean     @default(true)   // hidden = stays in DB, drops off nav + route 404s
  createdAt DateTime    @default(now())

  content     SectionContent?
  galleryItems GalleryItem[]
  resume      ResumeData?
}

model SectionContent {
  id        String  @id @default(cuid())
  sectionId String  @unique
  section   Section @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  heading   String?
  bodyText  String  @db.Text
  imageUrl  String?
}

enum MediaType {
  EMBED         // pasted YouTube/Vimeo URL
  VIDEO_UPLOAD  // video file uploaded directly, hosted on Cloudflare Stream
  AUDIO         // uploaded audio file (Cloudinary)
  LINK          // external article, no player
}

model GalleryItem {
  id            String    @id @default(cuid())
  sectionId     String
  section       Section   @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  title         String
  roleLabel     String?               // e.g. "Narration voiceover" — optional, reusable for any gallery
  description   String    @db.Text
  mediaType     MediaType @default(EMBED)
  mediaUrl      String?               // embed URL or article link
  streamVideoId String?               // Cloudflare Stream video UID, set when mediaType = VIDEO_UPLOAD
  thumbnailUrl  String?               // auto-filled from Stream's generated thumbnail when uploaded
  order         Int       @default(0)
  published     Boolean   @default(true)
}

model ResumeData {
  id            String        @id @default(cuid())
  sectionId     String        @unique
  section       Section       @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  resumeFileUrl String?                // optional uploaded PDF, shown as a download/embed
  entries       ResumeEntry[]
}

model ResumeEntry {
  id           String     @id @default(cuid())
  resumeDataId String
  resumeData   ResumeData @relation(fields: [resumeDataId], references: [id], onDelete: Cascade)
  heading      String                  // "Experience", "Education", "Skills"...
  body         String     @db.Text
  order        Int        @default(0)
}

model ContactSubmission {
  id        String   @id @default(cuid())
  name      String
  email     String
  message   String   @db.Text
  createdAt DateTime @default(now())
  read      Boolean  @default(false)
}
```

Deleting a `Section` cascades to its `SectionContent` / `GalleryItem`s / `ResumeData` — the admin "Delete section" action should confirm this clearly since it's destructive.

---

## 5. Site map

**Public**
```
/                       Home (fixed)
/[slug]                 Every other page — resolved at request time:
                          - looks up Section by slug
                          - 404s if not found or isVisible = false
                          - renders <GalleryTemplate>, <ContentTemplate>, or <ResumeTemplate>
                          - navbar is rendered from the same Section list, filtered to isVisible, ordered by `order`
```
Launch state: `/editing-portfolio` (Gallery), `/resume` (Resume), `/about` (Content).

**Admin**
```
/admin/login
/admin                     Dashboard
/admin/home                Edit hero, bio, philosophy, CTA, quick links
/admin/sections            Manage Sections: list (drag reorder), add, delete, toggle visibility
/admin/sections/[id]       Edit one section:
                             - Gallery type -> item list (add/edit/delete/reorder), each item's title,
                               role label, description, media — the admin form gives a choice per item:
                               paste an embed URL, OR upload a video file directly (goes to Cloudflare
                               Stream, with upload progress + auto-generated thumbnail), OR upload audio,
                               OR link to an external article
                             - Content type -> heading, body text, image upload
                             - Resume type -> entries list (heading/body, reorder) + PDF upload
/admin/settings            Global contact info, socials, SEO meta
/admin/messages            Booking/contact submissions (if a booking-type section is added later)
```

---

## 6. UI reference notes

Same visual direction as before — this is a replication brief, not an open design brief:

- Minimal, near-monochrome palette; photography carries the color
- Two-tier typography: display face for headings/name, clean sans for body/nav
- Thin horizontal rules + small uppercase section labels between blocks (a genuine content sequence, so the labels earn their place)
- One repeating **Gallery item** component (title → role label → description → media) used across any gallery-type section — since sections are now dynamic, this component must not assume it's specifically "editing" or "voiceover" content
- Navbar renders whatever Sections are currently visible — build it to handle 1 section or 6 equally gracefully, since the client controls the count

---

## 7. Build phases

1. **Scaffold**: Next.js + TS + Tailwind + ESLint, git init, folder structure (Section 8).
2. **Design system**: shared components — `Header` (renders nav from data, not hardcoded links), `Footer`, `SectionDivider`, `GalleryItemCard`.
3. **Database**: Prisma schema (Section 4), migrate, seed script creating: SiteSettings singleton + the 3 launch Sections (Editing portfolio / Resume / About) with placeholder content.
4. **Dynamic public routing**: `/app/(public)/[slug]/page.tsx` — fetch Section by slug, 404 on missing/hidden, dispatch to the right template component by `type`. Build Home separately at `/app/(public)/page.tsx` from `SiteSettings`.
5. **Auth**: NextAuth Credentials, single seeded admin user, middleware protecting `/admin/*`.
6. **Admin shell**: sidebar nav, login page.
7. **Admin — Manage Sections screen**: list + add (name, slug auto-generated, type picker) + delete (with confirm) + drag reorder + visibility toggle. Build and review this one before the per-type editors — it's the piece that makes the rest possible.
8. **Admin — per-type editors**: Gallery item CRUD + reorder, Content editor, Resume entries CRUD + PDF upload. Build Gallery first (covers Editing portfolio), then Resume, then Content (About) — matches your launch priority.
9. **Admin — Home settings screen**: hero, bio, philosophy, CTA, quick links.
10. **Media upload**: Cloudinary widget wired into every image/PDF/audio field; Cloudflare Stream direct-creator-upload flow wired into the Gallery item form's video-upload option (request a one-time upload URL from your API route, upload client-side, poll/webhook for "ready," store the returned video UID + thumbnail).
11. **Live-reflect wiring**: `revalidatePath('/[slug]')` and `revalidatePath('/')` after every admin save (section content, section list changes, home settings) so edits go live immediately.
12. **QA**: responsive check, keyboard nav, empty states ("No sections yet — add your first one," "No items in this gallery yet"), confirm-before-delete on destructive actions.
13. **Deploy**: Vercel + env vars (DB URL, NextAuth secret, Cloudinary keys) + domain.
14. **Handover**: short walkthrough showing the client how to add/remove a section and upload into each type.

---

## 8. Folder structure

```
/app
  /(public)
    /page.tsx                     Home (fixed, reads SiteSettings)
    /[slug]/page.tsx               Dynamic: any Section, dispatches by type
  /admin
    /login/page.tsx
    /layout.tsx                   auth-gated shell + sidebar
    /page.tsx                     dashboard
    /home/page.tsx
    /sections/page.tsx             Manage Sections (add/remove/reorder/visibility)
    /sections/[id]/page.tsx        Per-section editor (renders Gallery/Content/Resume form by type)
    /settings/page.tsx
    /messages/page.tsx
  /api
    /auth/[...nextauth]/route.ts
    /upload/route.ts               Cloudinary signed upload
    /contact/route.ts
/components
  /public
    Header.tsx                    reads visible Sections, renders nav
    Footer.tsx
    SectionDivider.tsx
    GalleryTemplate.tsx
    ContentTemplate.tsx
    ResumeTemplate.tsx
  /admin
    SectionList.tsx                drag-reorder + add/delete/visibility
    GalleryItemForm.tsx
    ContentForm.tsx
    ResumeEntryForm.tsx
    ImageUploader.tsx
/lib
  prisma.ts
  auth.ts
  cloudinary.ts
  cloudflareStream.ts             direct-upload URL creation, status polling
/prisma
  schema.prisma
  seed.ts
```

---

## 9. Skills / capabilities Claude Code will need

Unchanged from before, plus one addition specific to the dynamic system:

- Next.js App Router (server components, dynamic `[slug]` routes, middleware)
- Prisma schema design + migrations, including cascading deletes
- NextAuth.js credentials auth + route protection
- Tailwind design-system implementation from a written spec
- React Hook Form + Zod for admin forms
- `dnd-kit` for drag-reorder (both the Section list and items within a Gallery)
- Cloudinary signed uploads (images, PDFs, audio)
- Cloudflare Stream direct-creator-upload flow for video files (request upload URL server-side → upload client-side → track ready state → store the video UID), including large-file handling (files over 200MB need the tus resumable-upload protocol, not a plain POST)
- On-demand ISR revalidation
- **Polymorphic/type-dispatch rendering** — one route and one admin editor that branch by `Section.type` rather than three separate hardcoded page implementations. This is the main new pattern in this version of the plan; worth calling out explicitly to Claude Code since it's easy to accidentally re-hardcode per-page components out of habit.

**Recommended `CLAUDE.md` additions for this version:**
- "Sections are data, not routes — never add a new hardcoded page for a content type; add a new `SectionType` and template component instead."
- "Any admin write to Section, SectionContent, GalleryItem, ResumeData/Entry, or SiteSettings must revalidate the affected public path(s)."
- If you build the Gallery editor first and it works well, capture it as a Skill (`.claude/skills/admin-crud-pattern/SKILL.md`) — the Resume and Content editors follow the same shape (list/detail form + Cloudinary field + reorder) and Claude Code can reuse the pattern instead of reinventing it per type.

---

## 10. Suggested first prompts for Claude Code

1. *"Read docs/build-plan.md. Scaffold the Next.js project per Section 8's folder structure with Tailwind configured per Section 6."*
2. *"Add the Prisma schema from Section 4, migrate, and seed: a SiteSettings singleton, plus three Sections — Editing portfolio (Gallery, with 2-3 placeholder items), Resume (Resume type, with placeholder entries), About (Content type, with placeholder text)."*
3. *"Build the dynamic /[slug] route that fetches a Section and dispatches to a Gallery, Content, or Resume template based on type. Build Home separately from SiteSettings."*
4. *"Build the Header component so it renders nav links from visible Sections ordered by `order`, instead of a hardcoded list."*
5. *"Add NextAuth with a single credentials-based admin user, protect /admin/* via middleware."*
6. *"Build the admin Manage Sections screen — list with drag reorder, add-section modal (label + type picker, auto-slug), delete with confirmation, visibility toggle. I want to review this before you build the per-type editors."*
7. *"Build the Gallery item editor (CRUD + reorder + Cloudinary upload for thumbnail, a toggle between embed URL and direct video upload, audio upload field). Wire revalidation so admin edits show up on the public /editing-portfolio page immediately."*
8. *"Add the Cloudflare Stream direct-creator-upload flow: an API route that requests a one-time upload URL, a client-side uploader with progress, and polling/webhook handling to mark the GalleryItem ready once Stream finishes processing."*

---

## 11. Open questions to settle before/while building

- Should **Home** also become a manageable/removable Section, or stay fixed as planned?
- Resume: editable structured text (entries), an uploaded PDF, or both side by side?
- Any section types beyond Gallery/Content/Resume you can already foresee needing (e.g., a testimonials list, a pricing/services page)? Easier to name the type now than to retrofit later.
- **Video upload limits**: do you want a max file size / max duration enforced in the admin form (e.g., reject anything over 500MB or 10 minutes) to keep storage costs predictable, or leave it open? Cloudflare Stream's `maxDurationSeconds` param can enforce this server-side at upload-URL creation time.
- Does the client need to see upload progress/processing status in the admin UI (Stream takes a short time to finish encoding after upload completes), or is a simple "uploading… / processing… / ready" indicator enough?
