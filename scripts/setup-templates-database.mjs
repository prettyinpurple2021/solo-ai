#!/usr/bin/env node

/**
 * SoloBoss AI Templates Database Setup Script
 * 
 * This script:
 * 1. Seeds the database with template data
 * 2. Assumes tables are created via migration
 * 
 * Run with: node scripts/setup-templates-database.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTemplatesDatabase() {
  console.log('🚀 Setting up SoloBoss AI Templates database...\n');

  try {
    // Check if tables exist
    console.log('🔍 Checking if template tables exist...');
    const { data: _categories, error: categoriesError } = await supabase
      .from('template_categories')
      .select('count')
      .limit(1);

    if (categoriesError) {
      console.error('❌ Template tables do not exist. Please run the migration first:');
      console.error('   - Apply the migration: supabase/migrations/002_add_templates_schema.sql');
      console.error('   - Or run: npm run setup-db');
      return false;
    }

    console.log('✅ Template tables exist!');

    // Check if data already exists
    const { data: existingCategories, error: checkError } = await supabase
      .from('template_categories')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking existing data:', checkError);
      return false;
    }

    if (existingCategories && existingCategories.length > 0) {
      console.log('ℹ️  Template data already exists, skipping seeding...');
      console.log('✅ Templates database is ready!');
      return true;
    }

    // Seed the database with template data
    console.log('🌱 Seeding database with template data...');
    const templateData = JSON.parse(fs.readFileSync(path.resolve('data/templates.json'), 'utf-8'));

    for (const category of templateData) {
      // Insert category
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
        console.error('❌ Error inserting category:', categoryError);
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
            category_id: categoryData.id,
          });

        if (templateError) {
          console.error(`❌ Error inserting template ${template.title}:`, templateError);
        } else {
          console.log(`✅ Inserted template: ${template.title}`);
        }
      }
    }

    console.log('\n🎉 Templates database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. The templates feature should now work properly');
    console.log('   2. Visit /templates to see the template library');
    console.log('   3. Test creating and saving template data');

    return true;

  } catch (error) {
    console.error('❌ Templates database setup failed:', error);
    return false;
  }
}

// Run the setup
setupTemplatesDatabase().then((success) => {
  process.exit(success ? 0 : 1);
}); 