
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:3000")

        # Wait for the map to be somewhat loaded
        expect(page.locator("canvas.maplibregl-canvas")).to_be_visible(timeout=20000)
        page.wait_for_timeout(2000) # additional wait for styles to settle

        page.screenshot(path="jules-scratch/verification/01_initial_view.png")

        # Click the orthophoto button. It's the one without aria-haspopup
        page.locator('button:not([aria-haspopup="menu"]):has(img[alt="orto"])').click()
        page.wait_for_timeout(1000) # wait for map transition
        page.screenshot(path="jules-scratch/verification/02_orthophoto_view.png")

        # Now we are on orto view. The dropdown trigger still shows the 'standard' style.
        # Click the dropdown trigger to open the menu. It's the one WITH aria-haspopup.
        page.locator('button[aria-haspopup="menu"]:has(img[alt="standard"])').click()

        # Click the speed profile menu item
        speed_menu_item = page.locator('div[role="menuitem"]:has(img[alt="speed"])')
        expect(speed_menu_item).to_be_visible()
        speed_menu_item.click()
        page.wait_for_timeout(1000) # wait for map transition

        page.screenshot(path="jules-scratch/verification/03_speed_profile_view.png")

        browser.close()

if __name__ == "__main__":
    run()
