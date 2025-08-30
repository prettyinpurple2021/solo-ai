-- Seed Default Task Categories
-- Migration: 0003_seed_default_categories.sql

-- Insert default task categories for existing users
INSERT INTO task_categories (user_id, name, color, icon, is_default)
SELECT 
    u.id,
    category.name,
    category.color,
    category.icon,
    true
FROM users u
CROSS JOIN (
    VALUES 
        ('Work', '#8B5CF6', 'briefcase'),
        ('Personal', '#EC4899', 'user'),
        ('Health', '#10B981', 'heart'),
        ('Learning', '#F59E0B', 'book'),
        ('Finance', '#EF4444', 'dollar-sign'),
        ('Home', '#6366F1', 'home'),
        ('Social', '#8B5A2B', 'users'),
        ('Creative', '#F97316', 'palette')
) AS category(name, color, icon)
WHERE NOT EXISTS (
    SELECT 1 FROM task_categories tc 
    WHERE tc.user_id = u.id AND tc.name = category.name
)
ON CONFLICT (user_id, name) DO NOTHING;