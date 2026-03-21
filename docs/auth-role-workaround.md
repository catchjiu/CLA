# Quick fix: role stuck as “Member” / “Pending” (coach on `profiles` but not in the app)

The app reads **`role` from the JWT** first (then RPC, then the `profiles` table). You can set the role in **Supabase Auth** so it works immediately without waiting on RLS/RPC.

## Steps (Supabase Dashboard)

1. Open your project: **Authentication** → **Users**.
2. Click the user (e.g. `catchjiujitsu`).
3. Scroll to **User metadata** (or **Raw User Meta Data** in older UI).
4. Add or merge this JSON (use valid JSON — double quotes):

```json
{
  "role": "coach"
}
```

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
