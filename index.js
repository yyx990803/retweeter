require('dotenv').config()

const Twitter = require('twitter')

const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

const usernames = process.env.TARGET_USERNAME.split(',')
const regexes = process.env.TWEET_MATCH.split(',').map(re => new RegExp(re))

async function retweet(username, regex) {
  const latest = await client.get('/statuses/user_timeline', {
    screen_name: username,
    count: parseInt(process.env.POLL_COUNT || 10, 10),
    include_rts: false
  })

  let hasMatch = false
  for (const tweet of latest) {
    if (regex.test(tweet.text)) {
      hasMatch = true
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

  if (!hasMatch) {
    console.log(`No matching tweets from @${username} with regex ${regex.source}`.)
  }
}

;(async () => {
  let hasError = false
  for (let i = 0; i < usernames.length; i++) {
    try {
      await retweet(usernames[i], regexes[i])
    } catch (e) {
      if (!Array.isArray(e) || e[0].code !== 327) {
        console.log('Error encountered!')
        console.log(e)
        hasError = true
      } else {
        console.log('Already retweeted.')
      }
    }
  }
  if (hasError) {
    process.exit(1)
  }
})()
