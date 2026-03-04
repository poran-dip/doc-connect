import { redirect } from "react-router";
import type { Route } from "./+types/signout";

export async function action({ request }: Route.ActionArgs) {
  await fetch(`${process.env.API_URL ?? "http://localhost:3000"}/api/auth/signout`, {
    method: "POST",
    headers: { Cookie: request.headers.get("Cookie") ?? "" },
  });

  return redirect("/signin", {
    headers: { "Set-Cookie": "token=; Max-Age=0; Path=/; HttpOnly" },
  });
}
