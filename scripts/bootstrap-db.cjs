// One-time production database bootstrap, run from the Vercel build command.
//
// Applies the initial migration, creates the three least-privilege Postgres
// roles from infra/db/roles.sql, rotates their passwords to fresh random
// secrets, seeds demo data, and prints the resulting per-role connection
// strings so the operator can set them as permanent Vercel env vars.
//
// Gated by RUN_DB_BOOTSTRAP=true so it is a no-op on every ordinary build;
// remove it from the Vercel build command once it has run successfully.

if (process.env.RUN_DB_BOOTSTRAP !== 'true') {
  console.log('[bootstrap-db] RUN_DB_BOOTSTRAP not set, skipping.');
  process.exit(0);
}

const { execFileSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ownerUrl = process.env.MIGRATE_DATABASE_URL;
if (!ownerUrl) {
  console.error('[bootstrap-db] MIGRATE_DATABASE_URL is not set.');
  process.exit(1);
}

function redact(s) {
  return s.replace(/postgresql:\/\/[^\s]+/g, '<redacted-url>');
}

function run(cmd, args, opts = {}) {
  console.log('[bootstrap-db] $', redact([cmd, ...args].join(' ')));
  execFileSync(cmd, args, { stdio: 'inherit', ...opts });
}

function genPassword() {
  return crypto.randomBytes(24).toString('base64').replace(/[^A-Za-z0-9]/g, '');
}

function roleUrl(baseUrl, role, password) {
  const u = new URL(baseUrl);
  u.username = role;
  u.password = password;
  return u.toString();
}

console.log('[bootstrap-db] Applying migrations...');
run('npx', ['prisma', 'migrate', 'deploy']);

console.log('[bootstrap-db] Creating least-privilege roles (idempotent)...');
run('npx', ['prisma', 'db', 'execute', '--file', 'infra/db/roles.sql', '--url', ownerUrl]);

console.log('[bootstrap-db] Rotating role passwords...');
const appPw = genPassword();
const identityPw = genPassword();
const platformPw = genPassword();

const rotateSqlPath = path.join(os.tmpdir(), 'rotate-roles.sql');
fs.writeFileSync(
  rotateSqlPath,
  [
    `ALTER ROLE chnnl_app WITH PASSWORD '${appPw}';`,
    `ALTER ROLE chnnl_identity WITH PASSWORD '${identityPw}';`,
    `ALTER ROLE chnnl_platform WITH PASSWORD '${platformPw}';`,
  ].join('\n'),
);
run('npx', ['prisma', 'db', 'execute', '--file', rotateSqlPath, '--url', ownerUrl]);
fs.unlinkSync(rotateSqlPath);

const appUrl = roleUrl(ownerUrl, 'chnnl_app', appPw);
const identityUrl = roleUrl(ownerUrl, 'chnnl_identity', identityPw);
const platformUrl = roleUrl(ownerUrl, 'chnnl_platform', platformPw);

console.log('[bootstrap-db] Seeding demo data...');
run('npx', ['prisma', 'db', 'seed'], {
  env: {
    ...process.env,
    DATABASE_URL: appUrl,
    IDENTITY_DATABASE_URL: identityUrl,
    PLATFORM_DATABASE_URL: platformUrl,
  },
});

console.log('[bootstrap-db] Done. Set these as permanent Vercel project env vars:');
console.log('BOOTSTRAP_RESULT_DATABASE_URL=' + appUrl);
console.log('BOOTSTRAP_RESULT_IDENTITY_DATABASE_URL=' + identityUrl);
console.log('BOOTSTRAP_RESULT_PLATFORM_DATABASE_URL=' + platformUrl);
