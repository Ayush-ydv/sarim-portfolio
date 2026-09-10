import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

async function login(formData: FormData) {
  "use server";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/admin/login?error=1");
    }
    throw error;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <form action={login} className="flex w-full max-w-sm flex-col gap-5">
        <h1 className="font-display text-2xl text-foreground">Admin login</h1>
        {error && (
          <p className="text-sm text-red-700">
            Invalid email or password.
          </p>
        )}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="email"
            className="text-xs uppercase tracking-[0.18em] text-muted"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="password"
            className="text-xs uppercase tracking-[0.18em] text-muted"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>
        <button
          type="submit"
          className="mt-2 bg-foreground px-4 py-2 text-xs uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
