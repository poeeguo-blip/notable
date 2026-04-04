# Notable - Note Taking Application

A full-featured note-taking application with rich text editing, folder organization, version history, and favorites.

## Features

- 📝 **Rich Text Editing** - Format notes with colors, styles, images
- 📁 **Folder Organization** - Organize notes into folders
- ⭐ **Favorites** - Mark important notes as favorites
- 🕒 **Version History** - Track and restore previous versions
- 🗑️ **Trash Management** - Soft delete with restoration option
- 🎨 **Dark Mode** - Light and dark theme support
- 👤 **User Authentication** - Secure login with Supabase
- 🔄 **Auto-save** - Changes saved automatically

## Deployed on Railway ✨

This project is now deployed on [Railway](https://railway.app/)

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn-ui + Radix UI
- **Styling**: Tailwind CSS
- **Rich Text Editor**: TipTap
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Hooks + React Query

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Git

### Setup

```sh
# 1. Clone the repository
git clone https://github.com/poeeguo-blip/notable.git
cd notable

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Add your Supabase credentials to .env
# Get these from your Supabase project settings

# 5. Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## Building for Production

```sh
npm run build
npm run preview
```

## Environment Variables

Create a `.env` file with these variables:

```
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_URL=https://your_project_id.supabase.co
```

Get these from your [Supabase Project Settings](https://app.supabase.com/)

## Deployment on Railway

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Railway automatically builds and deploys on every push

## Project Structure

```
src/
├── components/          # React components
│   ├── NotesList.tsx   # Notes sidebar
│   ├── NoteEditor.tsx  # Main editor
│   ├── RichTextEditor.tsx
│   └── ui/             # shadcn-ui components
├── pages/              # Page components
├── integrations/       # Supabase integration
├── hooks/              # Custom React hooks
└── App.tsx             # Main app component
```

## Contributing

Feel free to modify and improve the application!

## License

MIT
