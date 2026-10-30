import test from "node:test";
import assert from "node:assert/strict";
import { contactSchema, projectSchema, settingsSchema } from "./index.js";

test("project data requires a safe shareable slug and summary", () => {
  const parsed = projectSchema.safeParse({
    title: "A small project",
    slug: "a-small-project",
    summary: "A short, honest summary."
  });
  assert.equal(parsed.success, true);
  assert.equal(projectSchema.safeParse({
    title: "Unsafe slug",
    slug: "../admin",
    summary: "A summary"
  }).success, false);
});

test("contact form rejects invalid email and undersized messages", () => {
  assert.equal(contactSchema.safeParse({
    name: "Aalok Bhatta",
    email: "not-an-email",
    subject: "Hello",
    message: "Too short"
  }).success, false);
});

test("settings only allow supported availability states and valid profile URLs", () => {
  const parsed = settingsSchema.safeParse({
    introduction: "A short introduction.",
    availability: "available",
    resumeUrl: "",
    socialLinks: { github: "https://github.com/example", linkedin: "", email: "" }
  });
  assert.equal(parsed.success, true);
  assert.equal(settingsSchema.safeParse({
    introduction: "Hello",
    availability: "maybe",
    socialLinks: { github: "not-a-url", linkedin: "", email: "" }
  }).success, false);
  assert.equal(projectSchema.safeParse({
    title: "Bad link",
    slug: "bad-link",
    summary: "A summary",
    liveUrl: "javascript:alert(1)"
  }).success, false);
});
