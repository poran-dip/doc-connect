import {
  type RouteConfig,
  route,
  layout,
  index,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("signin", "routes/signin.tsx"),
  route("register", "routes/register.tsx"),

  layout("layouts/protected.tsx", [route("dashboard", "routes/dashboard.tsx")]),

  route("signout", "routes/signout.ts"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
