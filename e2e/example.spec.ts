import { expect, test } from "@playwright/test"

test("has title", async ({ page }) => {
  await page.goto("./")

  await expect(page).toHaveTitle(/StrangerChat/)
})

test("homepage has welcome heading", async ({ page }) => {
  await page.goto("./")

  const heading = page.locator("h1")
  await expect(heading).toContainText("Welcome")
})
