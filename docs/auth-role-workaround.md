# Quick fix: role stuck as “Member” / “Pending” (coach on `profiles` but not in the app)

The app reads **`role` from the JWT** first (then RPC, then the `profiles` table). You can set the role in **Supabase Auth** so it works immediately without waiting on RLS/RPC.

## Steps (Supabase Dashboard)

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
