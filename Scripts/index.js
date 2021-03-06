const LoginForm = document.querySelector(".overlay-form");
const ConfirmBtn = document.querySelector(".confirmBtn");
const OverlayLogin = document.querySelector(".overlay-for-login");
const ProfileSpan = document.querySelector(".profile");
const slideSec = document.querySelector(".slideshow");
const TV_POPULAR = document.querySelector("#tvPopular");
const TV_TOP_RATED = document.querySelector("#tvTopRated");
const TV_ON_AIR = document.querySelector("#tvOnAir");

const state = {
  config: {
    api_key: sessionStorage.getItem("user-api"),
    base_url: "https://api.themoviedb.org/3",
    request_token: null,
    sessionId: sessionStorage.getItem("edgemonix_session"),
    images: null,
  },
  user: {
    username: null,
    avatar: null,
    name: null,
  },
  popular: null,
  top_rated: null,
  on_air: null,
};

/* ----------------------------START OF UTILITIES---------------------------------- */

// function for the url
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
    console.log(errorMessage);
  }
}

/* ----------------------------END OF UTILITIES---------------------------------- */

async function getRequestToken() {
  const UserInput = document.querySelector("input");
  state.config.api_key = UserInput.value;
  const sessionApi = sessionStorage.setItem("user-api", UserInput.value);
  try {
    const requestTokenUrl = getUrl("/authentication/token/new");
    const response = await getData(requestTokenUrl);
    if (!response.ok) {
      state.config.request_token = response.request_token;
      window.open(
        `https://www.themoviedb.org/authenticate/${state.config.request_token}/allow`
      ); /* Apertura finestra di autenticazione */
    }
  } catch (error) {
    console.log(error);
  }
  return true;
}

async function getSession() {
  const { base_url, api_key, request_token } = state.config;
  const result = await fetch(
    `${base_url}/authentication/session/new?api_key=${api_key}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        request_token: request_token,
      }),
    }
  );
  const response = await result.json();
  // receive the session id
  state.config.sessionId = response.session_id;
  // store the session id in storage
  const sessionDataString = response.session_id;
  sessionStorage.setItem("edgemonix_session", sessionDataString);
  return true;
}

async function getPopular() {
  const popularTvUrl = getUrl("/tv/popular");
  const rawResponse = await getData(popularTvUrl);
  state.popular = rawResponse.results;
  return rawResponse;
}

async function getTopRated() {
  const topRatedTvUrl = getUrl("/tv/top_rated");
  const rawResponse = await getData(topRatedTvUrl);
  state.top_rated = rawResponse.results;
  return rawResponse;
}

async function getOnAir() {
  const onAirTvUrl = getUrl("/tv/on_the_air");
  const rawResponse = await getData(onAirTvUrl);
  state.on_air = rawResponse.results;
  return rawResponse;
}

let greeting = null;

function greetingUser() {
  const today = new Date();
  const hourNow = today.getHours();
  if (hourNow > 18) {
    greeting = "Buonasera";
  } else if (hourNow > 12) {
    greeting = "Buon pomeriggio";
  } else if (hourNow > 0) {
    greeting = "Buongiorno";
  } else {
    greeting = "Benvenuto";
  }
}

function createAvatar() {
  const message = document.createElement("h3");
  message.textContent = `${greeting}`;
  ProfileSpan.appendChild(message);
}

// function to create elements of the main slideshow
function createMainSlideshow(imgUrl, maintitle, description, id) {
  let imgcompleteUrl = `https://image.tmdb.org/t/p/original/${imgUrl}`;

  // Creo gli elementi per lo slideshow
  const divSlides = document.createElement("div");
  const img = document.createElement("img");
  const container = document.createElement("div");
  const title = document.createElement("h3");
  const content = document.createElement("p");

  // Assegno le classi
  divSlides.classList.add("contentSlides");
  img.classList.add("mySlidesBackdrop");
  container.classList.add("contentText");
  title.classList.add("headerSlides");
  content.classList.add("descriptionSlides");

  // Assegno il contenuto
  img.src = imgcompleteUrl;
  title.textContent = maintitle;
  content.textContent = description;

  // Appendo gli elementi

  title.appendChild(content);
  container.appendChild(title);
  divSlides.append(img, container);

  return divSlides;
}

// function to render the elements of the main slideshow
function renderMainSlideshow() {
  const filteredSeries = state.on_air.filter((item) => item.popularity > 350);

  filteredSeries.forEach((item) => {
    const slide = createMainSlideshow(
      item.backdrop_path,
      item.name,
      item.overview,
      item.id
    );
    slideSec.appendChild(slide);
  });
}

/* Automatic main slideshow */
let slideIndex = 0;

function slideshow() {
  let i;
  let x = document.getElementsByClassName("contentSlides");
  for (i = 0; i < x.length; i++) {
    x[i].style.opacity = 0;
  }
  slideIndex++;
  if (slideIndex > x.length) {
    slideIndex = 1;
  }
  x[slideIndex - 1].style.opacity = 1;
  setTimeout(slideshow, 5000);
}

// function to create cards of the carousel
function getTvCard(imgURL, title, id) {
  let imgcompleteUrl = `https://image.tmdb.org/t/p/w342/${imgURL}`;
  const cardWrap = document.createElement("div");
  const coverImg = document.createElement("img");
  const textWrap = document.createElement("div");
  const text = document.createElement("h3");
  const link = document.createElement("a");

  link.classList.add("cardLink");
  cardWrap.classList.add("card");
  textWrap.classList.add("card__title_wrap");
  text.textContent = title;
  coverImg.src = imgcompleteUrl;
  link.id = id;
  link.href = `./tv-series.html?id=${id}`;

  textWrap.appendChild(text);
  cardWrap.append(coverImg, textWrap, link);

  return cardWrap;
}

function renderCarousel(list, sectionNode) {
  list.forEach((item) => {
    const seriesCard = getTvCard(
      item.backdrop_path || item.poster_path,
      item.name,
      item.id
    );
    sectionNode.append(seriesCard);
  });
}

// Function that handles the carousel buttons

function handleScrollRight() {
  if (event.target.id === "nextFirst") {
    TV_POPULAR.parentNode.scrollTo({
      left:
        TV_POPULAR.parentNode.scrollLeft + TV_POPULAR.childNodes[1].offsetWidth,
      behavior: "smooth",
    });
  } else if (event.target.id === "nextSecond") {
    TV_TOP_RATED.parentNode.scrollTo({
      left:
        TV_TOP_RATED.parentNode.scrollLeft +
        TV_TOP_RATED.childNodes[1].offsetWidth,
      behavior: "smooth",
    });
  } else if (event.target.id === "nextThird") {
    TV_ON_AIR.parentNode.scrollTo({
      left:
        TV_ON_AIR.parentNode.scrollLeft + TV_ON_AIR.childNodes[1].offsetWidth,
      behavior: "smooth",
    });
  }
}

function handleScrollLeft() {
  if (event.target.id === "prevFirst") {
    TV_POPULAR.parentNode.scrollTo({
      left:
        TV_POPULAR.parentNode.scrollLeft - TV_POPULAR.childNodes[1].offsetWidth,
      behavior: "smooth",
    });
  } else if (event.target.id === "prevSecond") {
    TV_TOP_RATED.parentNode.scrollTo({
      left:
        TV_TOP_RATED.parentNode.scrollLeft -
        TV_TOP_RATED.childNodes[1].offsetWidth,
      behavior: "smooth",
    });
  } else if (event.target.id === "prevThird") {
    console.log(event.target.id);
    TV_ON_AIR.parentNode.scrollTo({
      left:
        TV_ON_AIR.parentNode.scrollLeft - TV_ON_AIR.childNodes[1].offsetWidth,
      behavior: "smooth",
    });
  }
}

document.querySelectorAll(".prev").forEach((item) => {
  item.addEventListener("click", (event) => {
    handleScrollLeft();
  });
});

document.querySelectorAll(".next").forEach((item) => {
  item.addEventListener("click", (event) => {
    handleScrollRight();
  });
});

async function handleDatas() {
  await Promise.all([getPopular(), getTopRated(), getOnAir()]);
  greetingUser(),
    createAvatar(),
    renderMainSlideshow(),
    slideshow(),
    renderCarousel(state.popular, TV_POPULAR);
  renderCarousel(state.top_rated, TV_TOP_RATED);
  renderCarousel(state.on_air, TV_ON_AIR);
  const carousel = document.querySelector(".sectCarousel");
  carousel.classList.remove("sectCarousel-is-hidden");
}

function showOverlayLogin() {
  OverlayLogin.classList.add("overlay-is-visible");
}

async function handleSession(e) {
  e.preventDefault();

  await Promise.all([getRequestToken()]).then(() => {
    getSession();
  });
}

async function verifySession() {
  const sessionData = sessionStorage.getItem("edgemonix_session");
  if (sessionData === undefined || !sessionData) {
    showOverlayLogin();

    handleSession();
  } else {
    handleDatas();
  }
}

document.addEventListener("DOMContentLoaded", verifySession, { once: true });
LoginForm.addEventListener("submit", handleSession, { once: true });
