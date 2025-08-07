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

async function populateTemplates() {
  try {
    console.log('Populating templates table...');
    
    // First, check if the tables exist
    const { data: categoriesCheck, error: categoriesError } = await supabase
      .from('template_categories')
      .select('*')
      .limit(1);
    
    if (categoriesError && categoriesError.code === 'PGRST205') {
      console.error('❌ template_categories table does not exist. Please run the migrations first.');
      return;
    }
    
    const { data: templatesCheck, error: templatesError } = await supabase
      .from('templates')
      .select('*')
      .limit(1);
    
    if (templatesError && templatesError.code === 'PGRST205') {
      console.error('❌ templates table does not exist. Please run the migrations first.');
      return;
    }
    
    console.log('✅ Tables exist, proceeding with population...');
    
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
    
    console.log('🎉 Templates population complete!');
    
  } catch (error) {
    console.error('Error populating templates:', error);
  }
}

populateTemplates();
