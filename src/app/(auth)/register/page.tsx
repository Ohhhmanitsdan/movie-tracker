"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { register as registerUser } from "@/lib/auth/mock";

function RegisterClient() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: Record<string, string>) => {
    setError(null);
    setSubmitting(true);
    try {
      await registerUser({
        username: values.username,
        email: values.email,
        password: values.password,
      });
      router.push("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      variant="register"
      onSubmit={handleSubmit}
      submitting={submitting}
      error={error}
    />
  );
}

export default RegisterClient;
