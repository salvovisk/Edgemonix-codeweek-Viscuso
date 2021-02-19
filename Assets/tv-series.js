



const ERROR_OVERLAY = document.querySelector('.overlay-404')
const CONTENT_SECTION = document.querySelector('.wrapper')
const sideContent = document.querySelector('.sideContent')
const closeArrow = document.querySelector('.fa-angle-right')
const openArrow = document.querySelector('.openArrow')

const state = {
  config: {
    base_url: "https://api.themoviedb.org/3",
    api_key: "f77033c1d0b6830581c0191d91ecddb7"
  },
  query_id: null,
  details: null,
  id: null
}

async function getIdfromUrl() {
  const query = location.search;
  // const pageUrl = window.location.href
  const params = new URLSearchParams(query)
  for (const param of params) {
    state.query_id = parseInt(param[1])
  }
  return state.query_id
}

async function verifyIdFromUrl() {
  try {
    if (state.query_id === Number) {
      console.log('è un numero')
    } else throw new Error('errore')
  } catch (error) {
    return error
  }
}


function getUrl(pathname) {
  const { api_key, base_url } = state.config;
  return `${base_url}${pathname}?api_key=${api_key}&language=it-IT`;
}

async function getData(url) {
  try {
    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok) {
      throw result;
    }
    return result;
  } catch (errorMessage) {
    // console.log(errorMessage);
    return errorMessage
  }
}


async function getTvDetails(id) {
  const tvDetailsUrl = getUrl(`/tv/${id}`);
  const rawResponse = await getData(tvDetailsUrl);
  state.details = rawResponse
  console.log(rawResponse)
  return rawResponse
}

function handleReject() {
  ERROR_OVERLAY.classList.remove('overlay-is-hidden')
}



function renderSideContent(imgUrl, maintitle, description, voteAverage) {
  const vote = voteAverage / 2
  console.log(vote)
  const ratings = {
    series: vote
  }
  const sideContainer = document.querySelector('.sideContent');
  const img = document.querySelector('.backdrop');
  const textContainer = document.querySelector('.textContent');
  const title = document.querySelector('.title')
  const genresList = document.querySelector('.genres')
  const ratingsList = document.querySelector('.ratings')
  const paragraph = document.querySelector('.description')
  const starsInner = document.querySelector('.stars-inner')

  let imgcompleteUrl = `https://image.tmdb.org/t/p/original/${imgUrl}`

  // gli assegno le classi
  img.classList.add('backdrop')
  sideContainer.classList.add('sideContent')
  textContainer.classList.add('textContent')
  title.classList.add('title')
  genresList.classList.add('genres')
  ratingsList.classList.add('ratings')
  paragraph.classList.add('description')

  // Genero il contenuto
  img.src = imgcompleteUrl
  title.textContent = maintitle
  paragraph.textContent = description

  const starTotal = 5
  for (const rating in ratings) {
    const starPercentage = (ratings[rating] / starTotal) * 100;
    const starPercentageRounded = `${(Math.round(starPercentage / 10) * 10)}%`;
    starsInner.style.width = starPercentageRounded;
  }
}

function handleSidecontentClose() {
  sideContent.classList.add('sideContent-move-out')
  openArrow.classList.add('openArrow-is-visible')
}

function handleSidecontentOpen(){
  sideContent.classList.remove('sideContent-move-out')
  openArrow.classList.remove('openArrow-is-visible')
}

closeArrow.addEventListener('click', handleSidecontentClose)
openArrow.addEventListener('mouseenter',handleSidecontentOpen)

function handleHTMLMounted() {
  getTvDetails(state.query_id).then(() => {
    renderSideContent(state.details.backdrop_path, state.details.name, state.details.overview, state.details.vote_average)
  })
}



const promise = new Promise(function (resolve, reject) {
  getIdfromUrl()
  if (!isNaN(state.query_id)) {
    resolve(handleHTMLMounted());
  }
  else {
    reject(handleReject());
  }
});

document.addEventListener("DOMContentLoaded", promise)