"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpIcon, ArrowDownIcon, RefreshCcw } from "lucide-react"

interface CryptoPrice {
  price: number
  change: number
  volume: string
  last_updated: string
}

interface CryptoData {
  [key: string]: CryptoPrice
}

export default function Home() {
  const [prices, setPrices] = useState<CryptoData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPrices = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/crypto?coins=bitcoin,ethereum,solana,cardano")
      if (!response.ok) {
        throw new Error("API request failed")
      }
      const data = await response.json()
      if (data.success) {
        setPrices(data.data)
      } else {
        throw new Error(data.error || "Failed to fetch prices")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, 15000)
    return () => clearInterval(interval)
  }, []) // Removed fetchPrices from dependencies

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const formatChange = (change: number) => {
    return `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Crypto Prices</h1>
          <Button onClick={fetchPrices} disabled={loading} variant="outline" size="sm">
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-4">{error}</div>}

        <div className="grid gap-4 md:grid-cols-2">
          {prices &&
            Object.entries(prices).map(([symbol, data]) => (
              <Card key={symbol} className="p-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold">{symbol}</h2>
                  <span className="text-sm text-gray-500">Vol: {data.volume}</span>
                </div>
                <div className="text-2xl font-bold my-2">{formatPrice(data.price)}</div>
                <div className={`flex items-center ${data.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {data.change >= 0 ? (
                    <ArrowUpIcon className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 mr-1" />
                  )}
                  {formatChange(data.change)}
                </div>
              </Card>
            ))}
        </div>
      </div>
    </main>
  )
}

