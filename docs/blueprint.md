# **App Name**: Msen Track Notely

## Core Features:

- Static Export Compliance: Ensures the entire application is built as a static site to prevent Netlify 404 errors, using configurations like 'output: export' and 'trailingSlash: true' in next.config.ts.
- Local Storage Persistence: Implements a 'useLocalStorage' hook for reading and saving data to local storage, with a loading state managed by React Context to ensure UI components wait for data load before rendering.
- Challenge Archiving: Allows users to archive challenges without deleting them by adding an 'isArchived' field to the Challenge interface, and provides filtering options on the management page.
- Local Search and Filtering: Enhances the Challenge List page with a search input to filter challenges by title (case-insensitive) and a toggle to filter by status (Active, Completed, or Archived).
- Dashboard Quote Display: Displays a random quote (EN/HI) from a static quotes file (src/lib/quotes.ts) on each load of the dashboard.
- Timer Accuracy: Calculates timer values at the millisecond level for challenge durations and displays both elapsed and remaining times.
- Mood-Based Note Highlighting: Highlights notes in the UI with background or border colors based on the mood emoji selected when submitting the note.

## Style Guidelines:

- Primary color: Indigo (#4F46E5) for a premium and trustworthy feel.
- Background color: Light gray (#F9FAFB), nearly white, providing ample whitespace.
- Accent color: Purple (#A3A1F7) for interactive elements and highlights, creating contrast with the primary color.
- Headline Font: 'Poppins', a geometric sans-serif for a contemporary and fashionable look.
- Body Font: 'PT Sans', a humanist sans-serif, pairing nicely with Poppins.
- Use rounded icons that match the rounded corner design philosophy. Icons should be simple and easy to understand.
- Employ rounded corners and ample whitespace throughout the application for a 'premium' look. Ensure UI components reflect the theme settings (Light/Dark) correctly.