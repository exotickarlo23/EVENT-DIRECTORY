import { test, expect } from "@playwright/test";

test("naslovnica se učitava s herojem i pretragom", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Sve za događaj koji se pamti");
  await expect(page.getByLabel("Što tražiš?")).toBeVisible();
});

test("korisnik odabire kategoriju i grad te otvara oglas", async ({ page }) => {
  await page.goto("/usluge/napuhanci-i-atrakcije/zagreb");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Napuhanci i atrakcije — Zagreb");
  await page.getByRole("link", { name: "Skočko napuhanci" }).click();
  await expect(page).toHaveURL(/\/ponudaci\/skocko-napuhanci/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Skočko napuhanci");
});

test("spremanje oglasa u favorite", async ({ page }) => {
  await page.goto("/ponudaci/skocko-napuhanci");
  await page.getByRole("button", { name: "Spremi u favorite" }).first().click();
  await page.goto("/favoriti");
  await expect(page.getByRole("link", { name: "Skočko napuhanci" })).toBeVisible();
});

test("slanje kontaktnog obrasca (lead)", async ({ page }) => {
  await page.goto("/ponudaci/skocko-napuhanci");
  await page.getByLabel("Ime i prezime *").fill("Test Testić");
  await page.getByLabel("E-mail *").fill("test@example.com");
  await page.getByRole("checkbox", { name: /Slažem se/ }).check();
  await page.getByRole("button", { name: "Pošalji upit" }).click();
  await expect(page.getByText("Upit je poslan!")).toBeVisible();
});

test("claim forma se otvara s nazivom oglasa", async ({ page }) => {
  await page.goto("/preuzmi-oglas?listing=studio-trenutak-fotografija");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Preuzmi ovaj profil");
  await expect(page.getByRole("link", { name: "Studio Trenutak fotografija" })).toBeVisible();
});
