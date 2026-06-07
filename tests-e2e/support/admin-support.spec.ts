import { test, expect } from "../base-test";
import { LOCALES, getStrings, reEscape } from "../i18n-strings";
import {
  adminMessage,
  adminTicketDetail,
  adminTicketListItem,
  adminUser,
  injectSession,
  mockAdminReply,
  mockAdminTicketDetail,
  mockAdminTickets,
  mockAdminUsersList,
  mockMe,
} from "./support-helpers";

const requesterName = "Usain User";

for (const locale of LOCALES) {
  const s = getStrings(locale);

  test.describe(`Admin support queue [${locale}]`, () => {
    test("SEO - has the localized title and description", async ({ page }) => {
      await injectSession(page, adminUser, locale);
      await mockMe(page, adminUser);
      await mockAdminTickets(page, []);

      await page.goto(`/${locale}/admin/support`);

      await expect(page).toHaveTitle(new RegExp(reEscape(s.seo.adminSupport.title), "i"));
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        s.seo.adminSupport.description,
      );
    });

    test("renders the queue with subject and requester", async ({ page }) => {
      await injectSession(page, adminUser, locale);
      await mockMe(page, adminUser);
      await mockAdminTickets(page, [adminTicketListItem]);

      await page.goto(`/${locale}/admin/support`);

      await expect(page.getByRole("heading", { name: s.support.admin.title })).toBeVisible();
      await expect(page.getByText(adminTicketListItem.subject)).toBeVisible();
      await expect(page.getByText(requesterName)).toBeVisible();
    });

    test("shows the empty state when no tickets match", async ({ page }) => {
      await injectSession(page, adminUser, locale);
      await mockMe(page, adminUser);
      await mockAdminTickets(page, []);

      await page.goto(`/${locale}/admin/support`);

      await expect(page.getByText(s.support.admin.empty)).toBeVisible();
    });

    test("row click opens the admin ticket detail", async ({ page }) => {
      await injectSession(page, adminUser, locale);
      await mockMe(page, adminUser);
      await mockAdminTickets(page, [adminTicketListItem]);
      await mockAdminTicketDetail(page, adminTicketDetail);
      await mockAdminUsersList(page, [adminUser]);

      await page.goto(`/${locale}/admin/support`);
      await page.getByText(adminTicketListItem.subject).click();

      await expect(page).toHaveURL(new RegExp(`/${locale}/admin/support/${adminTicketDetail.id}`));
      await expect(page.getByRole("heading", { name: adminTicketDetail.subject })).toBeVisible();
    });
  });

  test.describe(`Admin ticket detail [${locale}]`, () => {
    test("renders the thread, owner and management controls", async ({ page }) => {
      await injectSession(page, adminUser, locale);
      await mockMe(page, adminUser);
      await mockAdminTicketDetail(page, adminTicketDetail);
      await mockAdminUsersList(page, [adminUser]);

      await page.goto(`/${locale}/admin/support/${adminTicketDetail.id}`);

      await expect(page.getByRole("heading", { name: adminTicketDetail.subject })).toBeVisible();
      await expect(page.getByText(adminTicketDetail.user.email).first()).toBeVisible();
      await expect(page.getByText(s.support.admin.controls.title)).toBeVisible();
      await expect(page.getByRole("button", { name: s.support.admin.controls.save })).toBeVisible();
    });

    test("sending an admin reply clears the input", async ({ page }) => {
      await injectSession(page, adminUser, locale);
      await mockMe(page, adminUser);
      await mockAdminTicketDetail(page, adminTicketDetail);
      await mockAdminUsersList(page, [adminUser]);
      await mockAdminReply(page, adminMessage);

      await page.goto(`/${locale}/admin/support/${adminTicketDetail.id}`);

      const input = page.getByPlaceholder(s.support.detail.replyPlaceholder);
      await input.fill("We are on it");
      await page.getByRole("button", { name: s.support.detail.send }).click();

      await expect(input).toHaveValue("");
    });
  });
}
