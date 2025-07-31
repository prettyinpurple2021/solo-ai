
# Reusing Templates in a New Next.js & Supabase App

This guide provides step-by-step instructions for migrating the "Templates" feature from your original application to your new project built with Next.js (App Router) and Supabase.

**Your New Tech Stack:**

* **Frontend:** Next.js 15.2.4 (App Router), React 19, TypeScript 5+, Tailwind CSS, Radix UI, Framer Motion
* **Backend:** Supabase (PostgreSQL)

---

## Migration Steps

### Step 1: Add Files to Your Project

Place the contents of the `files-to-add` directory into your new project's source folder. The structure has been laid out to match a typical Next.js `src` directory.

```
your-new-app/
└── src/
    ├── app/
    │   └── templates/
    │       ├── [templateSlug]/
    │       │   └── page.tsx      // Dynamic page for a single template
    │       └── page.tsx          // Main page listing all templates
    ├── components/
    │   ├── templates/
    │   │   ├── decision-dashboard.tsx
    │   │   ├── delegation-list-builder.tsx
    │   │   │   // ... and all other template components
    │   │   └── vision-board-generator.tsx
    │   └── ui/
    │       └── icon.tsx          // Helper to render icons from strings
    ├── lib/
    │   ├── supabase-client.ts    // Supabase client & data fetching logic
    │   └── types.ts            // TypeScript types for your data
    └── data/
        └── templates.json      // The raw template data
```

### Step 2: Set Up Your Supabase Database

Your templates are organized into categories. We'll create two tables in your Supabase database to hold this data.

1. **Create the Tables:**
    Navigate to the **SQL Editor** in your Supabase project dashboard and run the SQL script provided in `scripts/schema.sql`. This will create the `template_categories` and `templates` tables with the correct columns and relationships.

2. **Seed the Database:**
    To load the data from `templates.json` into your new tables, you'll run a seeding script.
    * **Install Dependencies:** If you haven't already, install the Supabase JS client and `dotenv` to handle environment variables.

        ```bash
        npm install @supabase/supabase-js dotenv
        ```

    * **Configure Environment Variables:** Create a `.env.local` file in your project's root and add your Supabase project URL and anon key.

        ```.env.local
        NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        ```

    * **Run the Script:** Execute the seeding script from your terminal.

        ```bash
        node scripts/seed-supabase.mjs
        ```

    After the script finishes, you should see all your templates and categories populated in the Supabase table editor.

3. **Set Up Row Level Security (RLS) - Recommended:**
    Your `templates` table has a `required_role` column. You can use RLS to ensure that only users with the correct role can access them.
    * Go to **Authentication -> Policies** in Supabase.
    * Create a new policy on the `templates` table. Here is an example policy that allows `read` access to users whose role matches the template's `required_role` or for public templates. You will need to adapt this based on how you manage user roles.

    ```sql
    -- Example RLS Policy for allowing read access
    CREATE POLICY "Allow read access based on user role"
    ON public.templates
    FOR SELECT
    USING (
      (required_role = 'free_launchpad') OR -- Everyone can access free templates
      (auth.role() = required_role) -- Or user's role matches
    );
    ```

### Step 3: Integrate Frontend Components

The provided page components in `src/app/templates/` are already set up to fetch data from your Supabase client using Server Components.

1. **Install Icon Library:** The components use `lucide-react` for icons.

    ```bash
    npm install lucide-react
    ```

2. **Review Data Fetching:**
    * Open `src/app/templates/page.tsx`. You'll see it calls `getAllTemplates()` from our new `supabase-client.ts` file to get the data.
    * Open `src/app/templates/[templateSlug]/page.tsx`. It uses `getTemplateBySlug()` to fetch the data for a single template.
    * The `Icon` component in `src/components/ui/icon.tsx` dynamically renders the correct Lucide icon based on the string name fetched from the database (e.g., "UserCog").

### Step 4: Final Touches

* **Styling:** The components are unstyled primitives (`card`, `button`, etc.) and assume you have a UI component library set up with Tailwind CSS, similar to `shadcn/ui`. You may need to adjust component paths or styles to match your project's design system.
* **User Roles:** The `requiredRole` logic is in place. You will need to ensure your application's authentication and user management system properly assigns roles (`free_launchpad`, `pro_accelerator`, `empire_dominator`) to your users for the RLS policies to work correctly.

That's it! You should now have a fully functional "Templates" feature in your new application, powered by Supabase.
