
# IdeaSpark AI 💡

IdeaSpark AI is a professional innovation engine that transforms raw product thoughts into technical blueprints.

## 🚀 Cloud Setup (Supabase)

To enable persistent data and authentication, follow these steps:

### 1. Database Schema
Run the following SQL in your Supabase SQL Editor to create the necessary table and security policies:

```sql
create table public.ideas (
  id text primary key,
  user_id uuid references auth.users not null default auth.uid(),
  title text not null,
  raw_idea text,
  problem text,
  solution text,
  features jsonb default '[]'::jsonb,
  status text default 'draft',
  analysis jsonb,
  improvements jsonb,
  accepted_improvements jsonb default '[]'::jsonb,
  srs text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.ideas enable row level security;

create policy "Users can CRUD their own ideas" on public.ideas
  for all using (auth.uid() = user_id);
```

### 2. Social Login Configuration
In the Supabase Dashboard, go to **Authentication -> Providers**:
- **GitHub**: Create a GitHub OAuth App and paste the Client ID and Secret.
- **Google**: Create credentials in Google Cloud Console and paste the Client ID and Secret.
- **Redirect URI**: Use the one provided in the Supabase Dashboard.

### 3. Environment Variables
Ensure your `.env` file contains:
```text
API_KEY=your_gemini_key
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```

## ✨ Key Features
- **Auth Guard**: Secure login via GitHub, Google, or Email.
- **Cloud Persistence**: All data is stored in your private Supabase instance.
- **Gemini 3 Reasoning**: Market analysis, feature refinement, and full SRS generation.
