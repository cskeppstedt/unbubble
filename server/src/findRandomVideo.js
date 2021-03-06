const axios = require('axios')
const cheerio = require('cheerio')
const querystring = require('querystring')

const extractTitle = response => {
  const $ = cheerio.load(response.data)
  const title = $('#firstHeading').text()

  return title
}

const extractVideoId = response => {
  const $ = cheerio.load(response.data)

  const id = $('.yt-uix-tile-link')
    // this stupid map with different signature is from cheerio
    .map((index, result) => $(result).attr('href'))
    .get()
    .find(url => url.match(/watch\?/))
    .replace(/\/watch\?v=/, '')

  return id
}

const fetchRandomWikipediaArticle = () => {
  const languages = ['en', 'ja', 'es', 'ru', 'fr', 'de', 'it', 'pt', 'zh', 'pl', 'sv']
  const sortedLanguage = languages[Math.floor(Math.random() * languages.length)]

  return axios.get(`https://${sortedLanguage}.wikipedia.org/wiki/Special:Random`)
}

const fetchYouTubeSearchResults = topic =>
  axios.get(`https://www.youtube.com/results?search_query=${querystring.escape(topic)}`)

module.exports = function() {
  return fetchRandomWikipediaArticle()
    .then(extractTitle)
    .then(wikipediaTitle => {
      return fetchYouTubeSearchResults(wikipediaTitle)
        .then(extractVideoId)
        .then(videoId => ({ videoId, wikipediaTitle }))
    })
}
