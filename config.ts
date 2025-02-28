export const CONFIG = {
  API_URL: "https://v0-new-project-kp8puidovfa.vercel.app",
  DEFAULT_PAIRS: "bitcoin,ethereum,solana,cardano",
  UPDATE_INTERVAL: 15000, // 15 seconds
  ERROR_RETRY_DELAY: 5000, // 5 seconds

  ALERT_THRESHOLDS: {
    PRICE_CHANGE: 5, // 5% change in 24h
    VOLUME: 1000000000, // $1B volume
    SHORT_TERM_CHANGE: 1, // 1% change since last check
  },
}

