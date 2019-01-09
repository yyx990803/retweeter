require('dotenv').config()

const Twitter = require('twitter')

const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

const matchRegex = new RegExp(process.env.TWEET_MATCH)

;(async () => {
  try {
    const latest = await client.get('/statuses/user_timeline', {
      screen_name: process.env.TARGET_USERNAME,
      count: parseInt(process.env.POLL_COUNT, 10),
      include_rts: false
    })

    for (const tweet of latest) {
      if (matchRegex.test(tweet.text)) {
        console.log('Matched tweet:')
        console.log({
          text: tweet.text,
          created_at: tweet.created_at,
          id: tweet.id_str
        })
        await client.post(`/statuses/retweet/${tweet.id_str}`, {})
        break
      }
    }
  } catch (e) {
    const { code } = e[0]
    if (code !== 327) {
      console.log('Error encountered!')
      console.log(e)
      process.exit(1)
    } else {
      console.log('Already retweeted.')
    }
  }
})()
