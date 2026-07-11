"use client";

import { useActionState } from "react";
import { adminLogin, type ActionResult } from "@/lib/actions/admin";
import { Input, Label, Button } from "@/components/ui";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    adminLogin,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <p role="alert" className="rounded-xl bg-coral/10 px-4 py-3 text-sm font-semibold text-coral-dark">
          {state.error}
        </p>
      ) : null}
      <div>
        <Label htmlFor="login-email">E-mail</Label>
        <Input id="login-email" name="email" type="email" required autoComplete="username" />
      </div>
      <div>
        <Label htmlFor="login-password">Lozinka</Label>
        <Input id="login-password" name="password" type="password" required autoComplete="current-password" />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Prijava…" : "Prijavi se"}
      </Button>
    </form>
  );
}
