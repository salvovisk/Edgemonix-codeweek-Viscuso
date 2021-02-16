// f77033c1d0b6830581c0191d91ecddb7


// dev Function Skip login
const skipBtn = document.querySelector('.skiplogin')
function skip() {
  OverlayLogin.classList.add('overlay-is-hidden')
}
skipBtn.addEventListener('click', skip)
// 

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
  }
}


/* Utilities */
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
  return `${base_url}${pathname}?api_key=${api_key}`;
}

/* --------------END OF UTILITIES------------------------------------- */

// get the api key from the user in the login form
async function getUserInputApi(e) {
  const { base_url } = state.config
  e.preventDefault();
  const UserInput = document.querySelector('input')
  const userApi = UserInput.value
  state.config.api_key = userApi;
  // console.log(api_key);
  fetch(`${base_url}/authentication/token/new?api_key=${state.config.api_key}`) /* Chiamata che invia l'api key inserita nell'input */
    .then((r) => r.json())
    .then((data) => {
      console.log(data)
      state.config.request_token = data.request_token /* Ricezione del request token e scrittura su state */
      console.log(state.config.request_token)
      window.open(`https://www.themoviedb.org/authenticate/${state.config.request_token}`) /* Apertura finestra di autenticazione */
      ConfirmBtn.style.display = "block"
    })
  ConfirmBtn.addEventListener("click", confirmLogin)
}


/* conferma login per rimuovere la modale */
/* da aggiungere l'effettivo controllo sull'autenticazione tramite local storage(?) */
async function confirmLogin() {
  const { base_url, api_key, request_token } = state.config
  fetch(`${base_url}/authentication/session/new?api_key=${api_key}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8"
    },
    body: JSON.stringify({
      request_token: request_token
    })
  })
    .then((r) => r.json())
    .then((data) => {
      console.log(data)
      state.config.sessionId = data.session_id
    })
    /* chiamata per ricevere dati dell'account quali username e avatar */
    .then(() => OverlayLogin.classList.add('overlay-is-hidden')) /* nascondo la modale */
    .then(() => handleHTMLMounted())
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



// // Call to receive user datas such as avatar and username and renders the profile span
async function getUserData() {
  fetch((getUrl("/account") + `&session_id=${state.config.sessionId}`))
    .then((r) => r.json())
    .then((data) => {
      state.user.username = data.username;
      state.user.avatar = data.gravatar;
      state.user.name = data.name
      console.log(data)
    })
    .then(() => {
      greetingUser(),
        createAvatar(state.user.name, state.user.username)
    })

}



function handleHTMLMounted() {
  getUserData()
}




// LoginForm.addEventListener('submit', getUserInputApi)

document.addEventListener('DOMContentLoaded', handleHTMLMounted)



/* 

// https://api.themoviedb.org/3//suopoADq0k8YZr4dQXcU6pToj6s.jpg
${base_url}${backdrop_sizes[0]}${item.backdrop_path}`
*/


let slideIndex = 0;
carousel();

function carousel() {
  let i;
  let x = document.getElementsByClassName("contentSlides");
  for (i = 0; i < x.length; i++) {
    x[i].style.opacity = 0;
  }
  slideIndex++;
  if (slideIndex > x.length) { slideIndex = 1 }
  x[slideIndex - 1].style.opacity = 1;
  setTimeout(carousel, 5000); 
}


