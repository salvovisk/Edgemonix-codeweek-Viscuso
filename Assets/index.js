// f77033c1d0b6830581c0191d91ecddb7


/* 
Fix the span and user data
*/

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
    avatar: null
  }
}


/* Utilities */

function getUrl(pathname) {
  const { api_key, base_url } = state.config;

  return `${base_url}${pathname}?api_key=${api_key}`;
}


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
    .then(() => getUserData()) /* chiamata per ricevere dati dell'account quali username e avatar */
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


function renderUserData(img, name) {
  const avatarImg = document.createElement('img')
  const message = document.createElement('h3')
  message.textContent = `${greeting}, ${name}`
  avatarImg.src = img
  ProfileSpan.append(avatarImg, message)
}



// https://api.themoviedb.org/3/account?api_key=f77033c1d0b6830581c0191d91ecddb7&session_id=null

// // Call to receive user datas such as avatar and username
async function getUserData() {
  fetch((getUrl("/account") + `&session_id=${state.config.sessionId}`))
    .then((r) => r.json())
    .then((data) => {
      state.user.username = data.username;
      state.user.avatar = data.gravatar;
      state.user.name = data.name
      console.log(data)
      renderUserData(state.user.avatar, state.user.username)
    })

}

function handleHTMLMounted() {
  getUserData(),
    greetingUser()
}



LoginForm.addEventListener('submit', getUserInputApi)


