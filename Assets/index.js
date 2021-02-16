// f77033c1d0b6830581c0191d91ecddb7




const LoginForm = document.querySelector('.overlay-form')
const ConfirmBtn = document.querySelector('.confirmBtn')
const OverlayLogin = document.querySelector('.overlay-for-login')

const ProfileSpan = document.querySelector('.profile')


const state = {
  config: {
    api_key: null,
    base_url: "https://api.themoviedb.org/3",
    request_token: null,
    sessionId: null,
    images: null
  },
  user: {
    username: null,
    avatar: null,
    name: null,
  },
  popular: null,
  top_rated: null,
  on_air: null,
}


/* ----------------------------START OF UTILITIES---------------------------------- */
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// FUNC to genate a number between min and max (max not included!)
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

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


async function getUserInputApi(e) {
  e.preventDefault();
  const UserInput = document.querySelector('input')
  state.config.api_key = UserInput.value
  try {
    const requestTokenUrl = getUrl("/authentication/token/new")
    const response = await getData(requestTokenUrl);
    if (!response.ok) {
      state.config.request_token = response.request_token
      // console.log(response)
      window.open(`https://www.themoviedb.org/authenticate/${state.config.request_token}`) /* Apertura finestra di autenticazione */
      // console.log(state.config)
      ConfirmBtn.style.display = "block"
      // console.log(state.config)
    }
  } catch (error) {
    console.log(error)
  }
  ConfirmBtn.addEventListener('click', confirmLogin)
}

async function confirmLogin() {
  const { base_url, api_key, request_token } = state.config

  const result = await fetch(`${base_url}/authentication/session/new?api_key=${api_key}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8"
    },
    body: JSON.stringify({
      request_token: request_token
    })
  })
  const response = await result.json()
  state.config.sessionId = response.session_id
  // console.log(result)
  if (state.config.sessionId === response.session_id) {
    OverlayLogin.classList.add('overlay-is-hidden')
    handleHTMLMounted()
  }

}

async function getPopular() {
  const popularTvUrl = getUrl("/tv/popular");
  const rawResponse = await getData(popularTvUrl);
  state.popular = rawResponse.results;
  return rawResponse
}

async function getTopRated() {
  const topRatedTvUrl = getUrl("/tv/top_rated");
  const rawResponse = await getData(topRatedTvUrl);
  state.top_rated = rawResponse.results;
  return rawResponse
}

async function getOnAir() {
  const onAirTvUrl = getUrl("/tv/on_the_air");
  const rawResponse = await getData(onAirTvUrl);
  state.on_air = rawResponse.results;
  return rawResponse
}

// Function to create a personalized message in the navbar according to the time
let greeting = null

function greetingUser() {
  const today = new Date();
  const hourNow = today.getHours();
  if (hourNow > 18) {
    greeting = "Buonasera"
  } else if (hourNow > 12) {
    greeting = "Buon pomeriggio";
  } else if (hourNow > 0) {
    greeting = "Buongiorno"
  } else {
    greeting = "Benvenuto"
  }
}

// Function to generate a avatar with initials letters of the name and random background color,
// it also render the profile span message

function createAvatar(name, username) {
  const nameAndSurname = name.split(" ")
  console.log(nameAndSurname)
  const avatarImg = document.createElement('div')
  avatarImg.classList.add('avatar')
  avatarImg.style.backgroundColor = getRandomColor()
  const newThumbnail = document.createTextNode(((nameAndSurname[0])[0]) + ((nameAndSurname[1])[0]));
  avatarImg.appendChild(newThumbnail)
  ProfileSpan.appendChild(avatarImg)
  console.log('avatar')
  const message = document.createElement('h3')
  message.textContent = `${greeting}, ${username}`
  ProfileSpan.append(message, avatarImg)
  console.log('messaggio')
}

/* Carosello */
let slideIndex = 0;

function carousel() {
  let i;
  let x = document.getElementsByClassName("contentSlides");
  for (i = 0; i < x.length; i++) {
    x[i].style.opacity = 0;
  }
  slideIndex++;
  if (slideIndex > x.length) { slideIndex = 1 }
  x[slideIndex - 1].style.opacity = 1;
  setTimeout(carousel, 10000);
}


// // Call to receive user datas such as avatar and username and renders the profile span

async function getUserData() {
  const requestProfileUrl = `${state.config.base_url}/account?api_key=${state.config.api_key}&session_id=${state.config.sessionId}`
  const response = await getData(requestProfileUrl)
  /*   console.log('test')
    console.log(response) */
  state.user.username = response.username;
  state.user.name = response.name
  return response
}

async function handleHTMLMounted() {
  await getUserData()
    .then(() => {
      greetingUser()
    })
    .then(() => {
      createAvatar(state.user.name, state.user.username)
    })
    .then(() => {
      carousel()
    })
    .then(()=>{
      handlingDatas()
    })
}

async function handlingDatas(){
  Promise.all([getPopular(), getTopRated(), getOnAir()]).then(
    ()=>{
      console.log(state)
    }
  )
}

LoginForm.addEventListener('submit', getUserInputApi)
