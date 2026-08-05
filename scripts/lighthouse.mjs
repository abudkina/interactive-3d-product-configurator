/**
 * Lighthouse по production-сборке (vite preview).
 */
import { preview } from 'vite'
import { build } from 'vite'
import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import net from 'node:net'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const configFile = path.join(root, 'vite.config.ts')

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        reject(new Error('Не удалось получить свободный порт.'))
        return
      }
      const { port } = address
      server.close(() => resolve(port))
    })
    server.on('error', reject)
  })
}

async function main() {
  console.warn('Сборка production…')
  await build({ configFile, logLevel: 'error' })

  const port = await getFreePort()
  const url = `http://127.0.0.1:${port}/`
  const server = await preview({
    configFile,
    preview: { port, host: '127.0.0.1', strictPort: true },
  })

  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
  })

  try {
    const result = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices'],
      formFactor: 'desktop',
      screenEmulation: {
        mobile: false,
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
        disabled: false,
      },
      throttlingMethod: 'provided',
    })

    const cats = result?.lhr.categories
    if (!cats) {
      throw new Error('Lighthouse не вернул категории.')
    }

    const scores = {
      performance: Math.round((cats.performance?.score ?? 0) * 100),
      accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((cats['best-practices']?.score ?? 0) * 100),
    }

    console.warn('Результаты Lighthouse (desktop, production):', scores)

    const ok =
      scores.performance > 90 &&
      scores.accessibility > 95 &&
      scores.bestPractices > 95

    if (!ok) {
      console.error('Пороги Lighthouse не достигнуты.')
      process.exitCode = 1
    } else {
      console.warn('Пороги Lighthouse выполнены.')
    }
  } finally {
    try {
      await chrome.kill()
    } catch {
      // Windows: chrome-launcher иногда падает на удалении temp
    }
    try {
      await new Promise((resolve) => {
        server.httpServer?.close(() => resolve(undefined))
      })
    } catch {
      // сервер уже остановлен
    }
  }
}

main()
  .then(() => {
    process.exit(process.exitCode ?? 0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
