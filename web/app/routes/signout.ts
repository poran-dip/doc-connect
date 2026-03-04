import { redirect } from "react-router";
import type { Route } from "./+types/signout";
import { API_URL } from "~/lib/server";

export async function action({ request }: Route.ActionArgs) {
  await fetch(`${API_URL}/api/auth/signout`, {
    method: "POST",
    headers: { Cookie: request.headers.get("Cookie") ?? "" },
  });

  return redirect("/signin", {
    headers: { "Set-Cookie": "token=; Max-Age=0; Path=/; HttpOnly" },
  });
}
