import { type NextRequest, NextResponse } from "next/server"

// Types for our crypto data
interface CryptoPrice {
  price: number
  change: number
  volume: string
  last_updated: string
}

interface CryptoData {
  [key: string]: CryptoPrice
}

// Cache interface
interface CacheData {
  data: any
  timestamp: number
}

// In-memory cache
let priceCache: CacheData | null = null
const CACHE_DURATION = 15000 // 15 seconds cache to ensure fresh data

export async function GET(req: NextRequest) {
  try {
    // Check cache first
    if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        source: "cache",
        timestamp: priceCache.timestamp,
        data: priceCache.data,
      })
    }

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams
    const coins = searchParams.get("coins") || "bitcoin,ethereum"
    const currency = searchParams.get("currency") || "usd"

    // Log request details
    console.log(`Fetching prices for ${coins} in ${currency}`)

    // Fetch from CoinGecko Pro API
    const response = await fetch(
      `https://pro-api.coingecko.com/api/v3/simple/price?ids=${coins}&vs_currencies=${currency}&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`,
      {
        headers: {
          "x-cg-pro-api-key": process.env.COINGECKO_API_KEY!,
          "Content-Type": "application/json",
        },
        next: { revalidate: 15 }, // Revalidate cache every 15 seconds
      },
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Raw API response:", JSON.stringify(data, null, 2))

    // Transform data to match expected format
    const transformedData: CryptoData = Object.entries(data).reduce((acc, [coin, details]: [string, any]) => {
      acc[coin.toUpperCase()] = {
        price: details[currency],
        change: details[`${currency}_24h_change`] || 0,
        volume: formatVolume(details[`${currency}_24h_vol`] || 0),
        last_updated: new Date(details.last_updated_at * 1000).toISOString(),
      }
      return acc
    }, {} as CryptoData)

    // Update cache
    priceCache = {
      data: transformedData,
      timestamp: Date.now(),
    }

    return NextResponse.json({
      success: true,
      source: "api",
      timestamp: Date.now(),
      data: transformedData,
    })
  } catch (error) {
    console.error("Error fetching crypto prices:", error)

    // Return error details
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      },
      { status: 500 },
    )
  }
}

function formatVolume(volume: number): string {
  if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`
  return volume.toString()
}

