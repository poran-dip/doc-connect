import { redirect, Outlet } from "react-router";
import type { Route } from "./+types/protected";
import { getUserFromRequest } from "../lib/auth";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserFromRequest(request);
  if (!user) throw redirect("/signin");
  return { user };
}

export default function ProtectedLayout() {
  return <Outlet />;
}
