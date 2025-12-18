import { expect, test } from "@playwright/test"

test("has title", async ({ page }) => {
  await page.goto("./")

  await expect(page).toHaveTitle(/StrangerChat/)
})

test("demo page has messages heading", async ({ page }) => {
  await page.goto("./demo")

  const heading = page.getByRole("heading", { name: "Messages" })
  await expect(heading).toBeVisible()
})
