# Retweeter

> Auto retweet from another account using CircleCI scheduled workflows

## Setup

Register a Twitter app and create a `.env` file:

```
CONSUMER_KEY=xxx
CONSUMER_SECRET=xxx
ACCESS_TOKEN=xxx
ACCESS_TOKEN_SECRET=xxx

TARGET_USERNAME=UserToRetweetFrom
POLL_COUNT=10
TWEET_MATCH="You should retweet this" # can be regex
```

Adjust poll rate in `.circleci/config.yml`.
