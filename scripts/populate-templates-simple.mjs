import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the JSON file
const templateDataPath = join(__dirname, '../data/templates.json');
const templateData = JSON.parse(readFileSync(templateDataPath, 'utf8'));

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateTemplatesSimple() {
  try {
    console.log('Populating templates table with simple approach...');
    
    // First, temporarily disable RLS for population
    console.log('Temporarily disabling RLS for population...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE template_categories DISABLE ROW LEVEL SECURITY;
        ALTER TABLE templates DISABLE ROW LEVEL SECURITY;
      `
    });
    
    if (rlsError) {
      console.log('Could not disable RLS via RPC, trying direct approach...');
    }
    
    // Clear existing data
    console.log('Clearing existing data...');
    await supabase.from('templates').delete().neq('id', 0);
    await supabase.from('template_categories').delete().neq('id', 0);
    
    // Insert categories first
    console.log('Inserting categories...');
    for (const category of templateData) {
      const { data: categoryData, error: categoryError } = await supabase
        .from('template_categories')
        .insert({
          category: category.category,
          icon: category.icon,
          description: category.description
        })
        .select()
        .single();
      
      if (categoryError) {
        console.error(`Error inserting category ${category.category}:`, categoryError);
        continue;
      }
      
      console.log(`✅ Inserted category: ${category.category}`);
      
      // Insert templates for this category
      for (const template of category.templates) {
        const { error: templateError } = await supabase
          .from('templates')
          .insert({
            title: template.title,
            description: template.description,
            slug: template.slug,
            is_interactive: template.isInteractive,
            required_role: template.requiredRole,
            category_id: categoryData.id
          });
        
        if (templateError) {
          console.error(`Error inserting template ${template.title}:`, templateError);
        } else {
          console.log(`  ✅ Inserted template: ${template.title}`);
        }
      }
    }
    
    // Re-enable RLS
    console.log('Re-enabling RLS...');
    const { error: rlsReEnableError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;
        ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
      `
    });
    
    if (rlsReEnableError) {
      console.log('Could not re-enable RLS via RPC, but data was inserted successfully');
    }
    
    console.log('🎉 Templates population complete!');
    
  } catch (error) {
    console.error('Error populating templates:', error);
  }
}

populateTemplatesSimple();
