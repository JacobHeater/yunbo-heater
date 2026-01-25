# Copilot Instructions for yunboheater.github.io

This repository hosts a Next.js application using the App Router, TypeScript, and Tailwind CSS v4.

## Big Picture Architecture

- **Framework**: Next.js 16 with React 19, App Router for file-based routing.
- **Language**: TypeScript for type safety.
- **Styling**: Tailwind CSS v4 with custom CSS variables for theming.
- **Directory Structure**:
  - `src/app/`: App Router pages and layouts (e.g., `page.tsx`, `layout.tsx`)
  - `src/components/`: Reusable React components (create as needed)
  - `public/`: Static assets (images, icons)
  - `src/app/globals.css`: Global styles with Tailwind imports
- **Build Output**: `.next/` directory (auto-generated).
- **Deployment**: Can be deployed to Vercel, Netlify, or GitHub Pages (with adapter).

## Developer Workflows

- **Local Development**: Run `npm run dev` (starts on http://localhost:3000)
- **Build**: `npm run build` (produces optimized production build)
- **Start Production**: `npm run start` (serves built app)
- **Linting**: `npm run lint` (ESLint with Next.js config)
- **No Custom Scripts**: Stick to standard Next.js scripts.

## Project Conventions

- **Routing**: Use App Router; pages in `src/app/[route]/page.tsx`, layouts in `layout.tsx`
- **Components**: Functional components with TypeScript, e.g.:
  ```tsx
  export default function MyComponent({ prop }: { prop: string }) {
    return <div>{prop}</div>;
  }
  ```
- **Styling**: Tailwind utility classes, e.g., `className="flex items-center justify-center"`
- **Fonts**: Google Fonts loaded in `layout.tsx` (Geist Sans and Mono)
- **Metadata**: Export `metadata` object in page/layout files for SEO
- **Images**: Use Next.js `<Image>` component for optimization
- **Naming**: PascalCase for components, camelCase for variables/functions

## Integration Points

- **Tailwind**: Configured in `globals.css` with custom theme variables
- **ESLint**: Config in `eslint.config.mjs`, follows Next.js rules
- **TypeScript**: Config in `tsconfig.json`, strict mode enabled
- **PostCSS**: Config in `postcss.config.mjs` for Tailwind processing

## Key Files

- `src/app/layout.tsx`: Root layout with metadata and global styles
- `src/app/page.tsx`: Home page component
- `src/app/globals.css`: Tailwind imports and custom variables
- `next.config.ts`: Next.js configuration
- `package.json`: Scripts and dependencies

## Additional Patterns

- **Import Aliases**: Use `@/*` for imports from `src/`, e.g., `import Component from '@/components/MyComponent'`
- **Theming**: CSS variables in `globals.css` for colors, supports dark mode via `prefers-color-scheme`
- **Fonts**: Geist fonts loaded via `next/font` for optimized loading
- **Images**: Always use `<Image>` component with `priority` for above-the-fold images
- **SEO**: Define `metadata` exports in pages/layouts for title, description, etc.
- **Routing**: Add new pages by creating `page.tsx` in `src/app/[route]/`
- **Components**: Create reusable components in `src/components/`, follow PascalCase naming

## Deployment to GitHub Pages

- Set `output: 'export'` in `next.config.ts` for static export
- Build with `npm run build`, output in `out/` directory
- Deploy `out/` to GitHub Pages (main branch for user sites)

Focus on React best practices, server/client components, and App Router patterns for scalable development.</content>
<parameter name="filePath">c:\Users\jacob\dev\yunboheater.github.io\.github\copilot-instructions.md