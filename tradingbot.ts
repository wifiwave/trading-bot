import { CONFIG } from "./config"
import type { CryptoData, ApiResponse } from "./types"

export class TradingBot {
  private readonly apiUrl: string
  private lastPrices: CryptoData | null = null
  private isRunning = false

  constructor() {
    this.apiUrl = "https://v0-new-project-kp8puidovfa.vercel.app"
  }

  async getPrices(coins: string = CONFIG.DEFAULT_PAIRS): Promise<CryptoData | null> {
    try {
      const response = await fetch(`${this.apiUrl}/api/crypto?coins=${coins}`)
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data: ApiResponse = await response.json()
      if (!data.success) {
        throw new Error("API request failed")
      }

      this.lastPrices = data.data
      return data.data
    } catch (error) {
      console.error("Error fetching prices:", error)
      return null
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/health`)
      const data = await response.json()
      return data.status === "ok"
    } catch {
      return false
    }
  }

  private analyzePrices(prices: CryptoData) {
    for (const [coin, data] of Object.entries(prices)) {
      // Price alerts
      if (Math.abs(data.change) > CONFIG.ALERT_THRESHOLDS.PRICE_CHANGE) {
        console.log(`🚨 ${coin} moved ${data.change.toFixed(2)}% in 24h`)
      }

      // Volume alerts
      const volumeNum = Number.parseFloat(data.volume.replace(/[BMK]/g, ""))
      if (volumeNum > CONFIG.ALERT_THRESHOLDS.VOLUME) {
        console.log(`📊 High volume: ${coin} at ${data.volume}`)
      }

      // Compare with last check
      if (this.lastPrices?.[coin]) {
        const shortTermChange = ((data.price - this.lastPrices[coin].price) / this.lastPrices[coin].price) * 100
        if (Math.abs(shortTermChange) > CONFIG.ALERT_THRESHOLDS.SHORT_TERM_CHANGE) {
          console.log(
            `📈 ${coin}: ${shortTermChange > 0 ? "↗️" : "↘️"} ${Math.abs(shortTermChange).toFixed(2)}% in last check`,
          )
        }
      }
    }
  }

  async start(interval: number = CONFIG.UPDATE_INTERVAL) {
    this.isRunning = true
    console.log("🤖 Bot starting...")

    if (!(await this.checkHealth())) {
      throw new Error("API health check failed")
    }

    console.log("✅ API connected")

    while (this.isRunning) {
      try {
        const prices = await this.getPrices()
        if (prices) {
          console.log("\n📊 Current Prices:")
          Object.entries(prices).forEach(([coin, data]) => {
            console.log(
              `${coin}: $${data.price.toFixed(2)} (${data.change >= 0 ? "↗️" : "↘️"} ${data.change.toFixed(2)}%)`,
            )
          })
          this.analyzePrices(prices)
        }
        await new Promise((resolve) => setTimeout(resolve, interval))
      } catch (error) {
        console.error("Bot error:", error)
        await new Promise((resolve) => setTimeout(resolve, CONFIG.ERROR_RETRY_DELAY))
      }
    }
  }

  stop() {
    this.isRunning = false
    console.log("🛑 Bot stopped")
  }
}

