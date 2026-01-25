# Building Concierge Chatbot

A comprehensive, accessible chatbot application built with Next.js 14+ (App Router) for building management assistance.

## Features

- 🤖 AI-powered building concierge assistant
- 💬 Real-time streaming responses
- ♿ Full accessibility support (WCAG compliant)
- 📱 Responsive design
- 🎨 Clean, minimalist UI with Tailwind CSS
- ✨ Markdown rendering for rich responses

## Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide-React
- **AI Integration:** Vercel AI SDK with Anthropic Claude
- **Markdown:** react-markdown

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Anthropic API key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tactone-building-chat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Then edit `.env.local` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # Chat API endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page
├── components/
│   └── ChatInterface.tsx     # Chat UI component
├── .env.local.example        # Environment variables template
├── tailwind.config.ts        # Tailwind configuration
└── package.json              # Dependencies
```

## Customization

### Building Data

To customize the building information, edit the `SYSTEM_PROMPT` constant in `app/api/chat/route.ts`. Look for the section marked with:

```
## Building Data
<!-- PLACEHOLDER: Insert specific building information here -->
```

Replace the placeholder content with your actual building details.

### Styling

The application uses Tailwind CSS. You can customize:

- Colors in `tailwind.config.ts`
- Global styles in `app/globals.css`
- Component styles directly in the TSX files

## Accessibility

This application follows WCAG 2.1 guidelines:

- Semantic HTML structure (`<main>`, `<section>`, `<form>`)
- ARIA labels and live regions
- Keyboard navigation support
- Visible focus states
- Screen reader friendly
- High contrast mode support
- Reduced motion support

## License

MIT
