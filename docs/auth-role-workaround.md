# Quick fix: role stuck as “Member” / “Role not set” / “Pending” (coach on `profiles` but not in the app)

## Stuck on “Role not set” (badge) or “Pending”

The UI shows **Role not set** when the app cannot read `coach` or `member` from any of:

1. **JWT** (`user_metadata` / `app_metadata` `role`) — requires **sign out + sign in** after you change metadata in the dashboard.  
2. **RPC** `get_my_role()` — deploy **`supabase_get_my_role.sql`**.  
3. **`public.profiles`** — you need a row for your user id with `role` set.

### “I see coach rows in `profiles` but the app still says Role not set”

The app only reads the row where **`profiles.id` = your logged-in user id** (same as **Authentication → Users** → UUID). Other people’s rows do not apply.

1. In the app, use **Copy id** on the dashboard (or copy UUID from Auth).  
2. In **Table Editor → `profiles`**, confirm a row exists with **`id` = that exact UUID**.  
3. If not, run **`supabase_profiles_upsert_for_user.sql`** (replace the one `uid` line with your UUID from Auth), then sign out and sign in.

---

Most common: **no row in `public.profiles`** for that account. Fix:

1. Run **`supabase_backfill_profiles_from_auth.sql`** (adds missing `profiles` rows for everyone in `auth.users`, default `member`).  
2. Run **`profiles_rls.sql`** so authenticated users can read/update their own row.  
3. For **coaches**, set `role` to `coach` (Auth metadata and/or `UPDATE public.profiles …`, or use **`supabase_set_user_coach.sql`** with your user id).  
4. **Sign out** and **sign in** so the JWT picks up metadata changes.

Use **Retry sync** in the app header after fixing Supabase.

**Production site still shows old help text or “Role not set” after SQL?**

1. **Redeploy** the latest app (e.g. `eco-cla.com`) so the bundle includes the role fix and the **“Your user id”** panel on the dashboard.  
2. Confirm hosting **environment variables** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` point at the **same** Supabase project where you edited `profiles` / Auth.  
3. **Sign out** and **sign in** again after changing `auth.users` metadata.

---

## Set `role` in Auth (JWT) so the app picks it up fast

The app reads **`role` from the JWT** first (then RPC, then the `profiles` table). You can set the role in **Supabase Auth** so it works immediately without waiting on RLS/RPC.

### Steps (Supabase Dashboard)

1. Open your project: **Authentication** → **Users**.
2. Click the user (e.g. `catchjiujitsu`).
3. Scroll to **User metadata** (or **Raw User Meta Data** / `raw_user_meta_data` in the DB).
4. **Merge** `role` into whatever is already there — do **not** delete existing keys like `email_verified`.

   Example: if you currently only have `email_verified`, the full user metadata JSON should look like:

```json
{
  "email_verified": true,
  "role": "coach"
}
```

   Or use the **Add field** UI: key `role`, value `coach` (plain text).

   For a **member**, use `"role": "member"` instead.

5. **Save** the user.
6. In the app: **Sign out** and **sign in again** (or hard refresh). The new JWT will include `role` and the UI should show **Coach**.

## Optional: App metadata

If your project only exposes **App metadata** for this user, you can set the same key there:

```json
{
  "role": "coach"
}
```

The client checks both `user_metadata` and `app_metadata` for `role` / `user_role`.

## After things are stable

Keep `public.profiles.role` in sync with Auth (or rely on `get_my_role` + RLS) so you don’t depend on metadata forever.

## “Second user works, first user doesn’t”

The **first** account often logged in **before** `role` existed on the JWT, so the browser keeps an **old session**.

1. Run **`supabase_fix_first_user_coach.sql`** in the SQL Editor for user `4d0cf250-ad7d-47fe-b4ca-092fe1126e26` (same pattern as the second user).
2. On the device where the first account is broken: **Sign out** → **Sign in** again, or use a **private/incognito** window, or clear **site data** for your app domain so a **new** access token is issued.
