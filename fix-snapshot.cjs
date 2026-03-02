const fs = require('fs');
const path = require('path');

const snapshotPath = path.join(__dirname, 'migrations', 'meta', '0005_snapshot.json');
const data = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));

// 1. Remove duplicate uniqueness for users.email and users.stack_user_id
if (data.tables['public.users']) {
  const usersTable = data.tables['public.users'];
  if (usersTable.uniqueConstraints) {
    if (usersTable.indexes['users_email_idx']) {
      delete usersTable.uniqueConstraints['users_email_unique'];
    }
    if (usersTable.indexes['users_stack_user_id_idx']) {
      delete usersTable.uniqueConstraints['users_stack_user_id_unique'];
    }
  }
}

// 2. Enable RLS and add policies for tenant-scoped tables
for (const tableName in data.tables) {
  const table = data.tables[tableName];
  if (table.columns && table.columns['user_id']) {
    table.isRLSEnabled = true;
    if (!table.policies) table.policies = {};
    table.policies[`${table.name}_tenant_isolation`] = {
      name: `${table.name}_tenant_isolation`,
      action: "ALL",
      roles: ["authenticated"],
      as: "restrictive",
      to: "user_id = current_user_id()"
    };
  }
}

// 3. Remove redundant non-unique index notification_prefs_user_id_idx
if (data.tables['public.notification_preferences'] && data.tables['public.notification_preferences'].indexes) {
  delete data.tables['public.notification_preferences'].indexes['notification_prefs_user_id_idx'];
}

// 4. Add composite index `(status, scheduled_time)` for `notification_jobs`
if (data.tables['public.notification_jobs']) {
  if (!data.tables['public.notification_jobs'].indexes) {
    data.tables['public.notification_jobs'].indexes = {};
  }
  data.tables['public.notification_jobs'].indexes['notification_jobs_status_scheduled_idx'] = {
    name: 'notification_jobs_status_scheduled_idx',
    columns: [
      { expression: 'status', isExpression: false, asc: true, nulls: 'last' },
      { expression: 'scheduled_time', isExpression: false, asc: true, nulls: 'last' }
    ],
    isUnique: false,
    concurrently: false,
    method: 'btree',
    with: {}
  };
}

// 5. Add index for account.userId foreign key
if (data.tables['public.account']) {
  if (!data.tables['public.account'].indexes) {
    data.tables['public.account'].indexes = {};
  }
  data.tables['public.account'].indexes['account_userId_idx'] = {
    name: 'account_userId_idx',
    columns: [
      { expression: 'userId', isExpression: false, asc: true, nulls: 'last' }
    ],
    isUnique: false,
    concurrently: false,
    method: 'btree',
    with: {}
  };
}

fs.writeFileSync(snapshotPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log("Successfully patched 0005_snapshot.json");
