import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be defined in .env.local');
}

const supabase = createClient(supabaseUrl, supabaseKey);
const templateData = JSON.parse(fs.readFileSync(path.resolve('data/templates.json'), 'utf-8'));

async function seedDatabase() {
  for (const category of templateData) {
    const { data: categoryData, error: categoryError } = await supabase
      .from('template_categories')
      .insert({
        category: category.category,
        icon: category.icon,
        description: category.description,
      })
      .select('id')
      .single();

    if (categoryError) {
      console.error('Error inserting category:', categoryError);
      continue;
    }

    for (const template of category.templates) {
      const { error: templateError } = await supabase.from('templates').insert({
        ...template,
        category_id: categoryData.id,
      });

      if (templateError) {
        console.error('Error inserting template:', templateError);
      }
    }
  }

  console.log('Database seeded successfully!');
}

seedDatabase(); 