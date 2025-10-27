
import sys
from playwright.sync_api import sync_playwright, expect

def run(url="http://localhost:3000"):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url)

        # Wait for the map to be somewhat loaded
        expect(page.locator("canvas.maplibregl-canvas")).to_be_visible(timeout=20000)
        page.wait_for_timeout(2000) # additional wait for styles to settle

        page.screenshot(path="jules-scratch/verification/01_initial_view.png")

        # Click the orthophoto button. This is the large button.
        # Initially, it shows the 'orto' image.
        page.locator('button:has(img[alt="orto"])').click()
        page.wait_for_timeout(1000) # wait for map transition
        page.screenshot(path="jules-scratch/verification/02_orthophoto_view.png")

        # Now we are on orto view. The main toggle button shows the 'standard' style image.
        # Click the layers button to reveal the profile buttons
        page.locator('button[aria-label="Toggle map profiles"]').click()
        page.wait_for_timeout(500)

        # The profile buttons for 'standard', 'speed', 'bicycle' are now visible.
        # Click the speed profile button
        page.locator('button:has(img[alt="speed"])').click()
        page.wait_for_timeout(1000) # wait for map transition

        page.screenshot(path="jules-scratch/verification/03_speed_profile_view.png")

        browser.close()

if __name__ == "__main__":
    target_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000"
    run(target_url)
