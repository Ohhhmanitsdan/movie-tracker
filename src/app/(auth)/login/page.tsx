"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { signIn } from "@/lib/auth/mock";

function LoginClient() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: Record<string, string>) => {
    setError(null);
    setSubmitting(true);
    try {
      await signIn({ username: values.username, password: values.password });
      router.push("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return <AuthCard variant="login" onSubmit={handleSubmit} submitting={submitting} error={error} />;
}

export default LoginClient;
