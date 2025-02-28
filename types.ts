export interface CryptoPrice {
  price: number
  change: number
  volume: string
  last_updated: string
}

export interface CryptoData {
  [key: string]: CryptoPrice
}

export interface ApiResponse {
  success: boolean
  source: string
  timestamp: number
  data: CryptoData
}

