import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function AppHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  redirect("/app/watchlists");
}
