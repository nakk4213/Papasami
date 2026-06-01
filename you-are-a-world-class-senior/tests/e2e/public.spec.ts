import { expect, test } from "@playwright/test";

test("public pages render and key controls work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Papa Sami Studio" })).toBeVisible();
  await expect(page.getByRole("link", { name: "View portfolio" })).toHaveAttribute("href", "/portfolio");
  await page.goto("/portfolio");
  await expect(page.getByRole("heading", { name: "Interactive design gallery" })).toBeVisible();
  await page.getByPlaceholder("Search portfolio").fill("Vertex");
  await expect(page.getByText("Vertex Brand Identity")).toBeVisible();
});

test("services search filters categories", async ({ page }) => {
  await page.goto("/services");
  await page.getByPlaceholder("Search services").fill("Logo");
  await expect(page.getByText("Logo Design")).toBeVisible();
  await expect(page.getByText("Religious Flyers")).toHaveCount(0);
});
