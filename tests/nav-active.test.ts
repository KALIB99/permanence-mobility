import assert from "node:assert/strict";
import test from "node:test";
import { isNavItemActive } from "../lib/nav-active.ts";

const ADMIN = [
  "/admin",
  "/admin/partners",
  "/admin/vehicles",
  "/admin/renters",
] as const;

test("highlights dashboard only on exact /admin", () => {
  assert.equal(isNavItemActive("/admin", "/admin", ADMIN), true);
  assert.equal(isNavItemActive("/admin/partners", "/admin", ADMIN), false);
});

test("highlights nested admin route by longest prefix", () => {
  assert.equal(isNavItemActive("/admin/partners", "/admin/partners", ADMIN), true);
  assert.equal(isNavItemActive("/admin/vehicles", "/admin/partners", ADMIN), false);
});

test("returns false when no nav item matches", () => {
  assert.equal(isNavItemActive("/login", "/admin", ADMIN), false);
});
