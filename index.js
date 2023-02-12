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
    include_rts: false,
    tweet_mode: 'extended'
  })

  let hasMatch = false
  latest.map(async (tweet, i) => {

    console.log(tweet)
    if (regex.test(tweet.full_text)) {
      hasMatch = true
      console.log()
      console.log('!!! Matched tweet !!!')
      console.log({
        text: tweet.full_text,
        created_at: tweet.created_at,
        id: tweet.id_str
      })
      console.log()

      await client.post(`/statuses/retweet/${tweet.id_str}`, {}).catch((e) => {
        console.log(e)
      })

    } else if (!process.env.CI) {
      console.log()
      console.log('Non-matching tweet:')
      console.log(tweet)
      console.log()
    }

  })


  if (!hasMatch) {
    console.log(`No matching tweets from @${username} with regex ${regex.source}.`)
  }
}

; (async () => {
  let hasError = false
  for (let i = 0; i < usernames.length; i++) {
    try {
      console.log('Start time:', Date.now())
      await retweet(usernames[i], regexes[i])
      console.log('Finish time:', Date.now())
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
