import { chromium, devices } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(__dirname, '../docs')
const BASE = 'http://127.0.0.1:5188'

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1800)
  await page.screenshot({
    path: path.join(outDir, 'screenshot-desktop.png'),
    fullPage: false,
  })

  const mobile = await browser.newPage({ ...devices['Pixel 5'] })
  await mobile.goto(BASE, { waitUntil: 'networkidle' })
  await mobile.waitForTimeout(1200)
  await mobile.screenshot({
    path: path.join(outDir, 'screenshot-mobile.png'),
    fullPage: false,
  })

  await page.getByRole('button', { name: 'Изменить цвет: Корпус' }).click()
  await page.waitForTimeout(400)
  await page.screenshot({
    path: path.join(outDir, 'screenshot-palette.png'),
    fullPage: false,
  })

  await browser.close()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
