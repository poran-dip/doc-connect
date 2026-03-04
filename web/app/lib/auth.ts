import * as jose from "jose";
import type { User, Role } from "./types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev_secret"
);

export async function getUserFromRequest(request: Request): Promise<User | null> {
  const cookieHeader = request.headers.get("Cookie");
  const token = cookieHeader
    ?.split(";")
    .find((c) => c.trim().startsWith("token="))
    ?.split("=")[1];

  if (!token) return null;

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return {
      _id: payload.id as string,
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}
