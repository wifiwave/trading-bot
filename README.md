// This is the simplest way to get prices in your bot
async function getLatestPrices() {
  try {
    // Replace this URL with your actual Vercel URL
    const url = "https://crypto-price-api-username.vercel.app/api/prices"

    // Ask for the prices you want
    const response = await fetch(url + "?coins=bitcoin,ethereum")
    const data = await response.json()

    if (data.success) {
      // Here are your prices!
      console.log("Bitcoin price:", data.data.bitcoin.usd)
      console.log("Ethereum price:", data.data.ethereum.usd)
      return data.data
    } else {
      console.log("Oops! Could not get prices!")
      return null
    }
  } catch (error) {
    console.log("Something went wrong:", error)
    return null
  }
}

// Use it in your bot like this:
async function runBot() {
  // Check prices every minute
  setInterval(async () => {
    console.log("Checking latest prices...")
    const prices = await getLatestPrices()

    if (prices) {
      // Do something with the prices
      if (prices.bitcoin.usd > 50000) {
        console.log("Bitcoin is very high!")
      }
      if (prices.ethereum.usd < 2000) {
        console.log("Ethereum is low!")
      }
    }
  }, 60000) // 60000 milliseconds = 1 minute
}

// Start your bot
runBot()

