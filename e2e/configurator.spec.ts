import { test, expect, type Page } from '@playwright/test'

async function ensurePanelOpen(page: Page) {
  const openBtn = page.getByRole('button', { name: 'Открыть панель настройки' })
  if (await openBtn.isVisible().catch(() => false)) {
    await openBtn.click()
  }
  await expect(page.locator('#side-panel')).toBeVisible()
}

test.describe('Конфигуратор 3D', () => {
  test('открывает приложение на русском', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Конфигуратор 3D')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Сделать скриншот' })).toBeVisible()
  })

  test('открывает палитру и меняет цвет корпуса', async ({ page }) => {
    await page.goto('/')
    await ensurePanelOpen(page)

    await page.getByRole('button', { name: 'Изменить цвет: Корпус' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/Цвет: Корпус/)).toBeVisible()

    const option = page.getByRole('option').first()
    await option.click()

    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByRole('status').filter({ hasText: /Назначен/ })).toBeVisible()
  })

  test('валидирует адрес модели', async ({ page }) => {
    await page.goto('/')
    await ensurePanelOpen(page)

    await page.getByLabel('Адрес модели').fill('не адрес')
    await page.getByRole('button', { name: 'Загрузить модель по адресу' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
  })

  test('сбрасывает цвета', async ({ page }) => {
    await page.goto('/')
    await ensurePanelOpen(page)

    await page.getByRole('button', { name: 'Сбросить цвета к исходным' }).click()
    await expect(
      page.getByRole('status').filter({ hasText: /сброшены/i }),
    ).toBeVisible()
  })

  test('переключает палитру RAL', async ({ page }) => {
    await page.goto('/')
    await ensurePanelOpen(page)

    await page.getByRole('button', { name: 'RAL', exact: true }).click()
    await page.getByRole('button', { name: 'Изменить цвет: Подошва' }).click()
    await expect(page.getByRole('option').first()).toContainText('RAL')
  })

  test('открывает галерею пресетов и применяет схему', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Открыть галерею пресетов' }).click()
    await expect(page.getByRole('heading', { name: 'Галерея пресетов' })).toBeVisible()

    await page.getByRole('button', { name: /Применить пресет/ }).first().click()
    await expect(page.getByRole('status').filter({ hasText: /Применён пресет/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Сделать скриншот' })).toBeVisible()
  })

  test('открывает технические характеристики', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Открыть технические характеристики' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Технические характеристики' }),
    ).toBeVisible()
    await expect(page.getByText('Демонстрационный кроссовок')).toBeVisible()
    await expect(page.getByText('LocalStorage')).toBeVisible()

    await page.getByRole('button', { name: 'Закрыть технические характеристики' }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })
})
