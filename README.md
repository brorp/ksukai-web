# KSUKAI-web

A modern web application built with [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), and [Radix UI](https://www.radix-ui.com/).

## 🚀 Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A package manager: `pnpm` (recommended), `npm`, or `yarn`

## 💻 Getting Started

### 1. Install Dependencies

Navigate to the project directory and install the required dependencies using your preferred package manager:

```bash
pnpm install
# or
npm install
# or
yarn install
```

### 2. Environment Variables

If there are any environment variables required by the project, make sure to set them up. Look for a `.env.example` file and copy it to `.env.local`:

```bash
cp .env.example .env.local
```
*(Populate the `.env.local` file with your specific local configuration values if needed).*

### 3. Run the Development Server

Start the local development server:

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application running. You can start editing the project by modifying files in the `app/` directory. The page will auto-update as you edit and save your files.

## 🛠️ Building for Production

To create an optimized production build of your application, run:

```bash
pnpm build
# or
npm run build
```

This command will compile the application and prepare it for deployment in the `.next` folder.

After the build completes, you can test the production build locally:

```bash
pnpm start
# or
npm run start
```

## 🧹 Linting

To run the linter and ensure code quality and consistency:

```bash
pnpm lint
# or
npm run lint
```

## 📚 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [Radix UI primitives](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
