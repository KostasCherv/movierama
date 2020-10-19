// init vars
var $ = window.$
let activeMovies, user, selectedUser
let sortBy = 'createdAt'
let currentPage = 1
let hasNext = false

const loaderContainer = document.getElementById('loaderContainer')
const moviesList = document.getElementById('movieList')
const loggedInBtns = document.getElementById('loggedInBtns')
const visitorBtns = document.getElementById('visitorBtns')

const previousPageBtn = document.getElementById('previousPageBtn')
const nextPageBtn = document.getElementById('nextPageBtn')

previousPageBtn.onclick = (e) => previousPage(e)
nextPageBtn.onclick = (e) => nextPage(e)

window.onload = () => {
  loadUser().then(loadAllMovies)
}

function loadUser () {
  return fetch('user').then(r => r.json().then(({ data }) => {
    user = data
    initUI()
  }))
}

function initUI () {
  if (user) {
    loggedInBtns.style.display = 'block'
    visitorBtns.style.display = 'none!important'
    document.getElementById('welcomeMessage').innerHTML = 'Welcome back <span style="font-weight: bold">' + user.username + '</span>'
  } else {
    loggedInBtns.style.display = 'none!important'
    visitorBtns.style.display = 'block'
  }
}

async function createMovie (e) {
  e.preventDefault()
  e.target.disabled = true

  // form logic
  const form = document.getElementById('createMovieForm')
  const formData = new FormData(form)
  const title = formData.get('title')
  const description = formData.get('description')
  form.reset()

  // send request
  if (title !== '') {
    await fetch('/movie', {
      method: 'POST',
      mode: 'cors',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      body: JSON.stringify({ title, description })
    }).then(r => r.json().then(({ data }) => {
      if (data === 'ok') {
        loadAllMovies()
        $('#createMovieModal').modal('hide')
        e.target.disabled = false
      }
    }))
  } else {
    e.target.disabled = false
  }
}

// eslint-disable-next-line no-unused-vars
async function editMovie (id) {
  $('#editMovieModal').modal('show')

  // form logic

  const movie = activeMovies.find(o => o._id === id)
  console.log(activeMovies, id)
  if (!movie) {
    return null
  }
  const form = document.getElementById('editMovieForm')
  form.title.value = movie.title
  form.description.value = movie.description
  console.log(form)
  form.onsubmit = async (e) => {
    e.preventDefault()
    e.target.disabled = true
    const formData = new FormData(form)
    const title = formData.get('title')
    const description = formData.get('description')

    // send request
    if (title !== '') {
      await fetch('/movie/' + movie._id, {
        method: 'PUT',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        body: JSON.stringify({ title, description })
      }).then(r => r.json().then(({ data }) => {
        if (data && data.n === 1) {
          loadAllMovies()
          $('#editMovieModal').modal('hide')
          e.target.disabled = false
        } else {
          // show error message and close
          $('#editMovieModal').modal('hide')
        }
      }))
    } else {
      e.target.disabled = false
    }
  }
}

// eslint-disable-next-line no-unused-vars
async function like (id) {
  const response = await fetch('/movie/like', {
    method: 'POST',
    mode: 'cors',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    body: JSON.stringify({ movieId: id })
  })
  if (response.redirected) {
    location.href = response.url
  } else {
    const { data } = await response.json()
    if (data === 'ok') {
      loadUser().then(selectedUser ? () => loadUserMovies(selectedUser) : loadAllMovies)
    }
  }
}

// eslint-disable-next-line no-unused-vars
async function hate (id) {
  const response = await fetch('/movie/hate', {
    method: 'POST',
    mode: 'cors',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    body: JSON.stringify({ movieId: id })
  })
  if (response.redirected) {
    location.href = response.url
  } else {
    const { data } = await response.json()
    if (data === 'ok') {
      loadUser().then(selectedUser ? () => loadUserMovies(selectedUser) : loadAllMovies)
    }
  }
}

async function loadUserMovies (id) {
  selectedUser = id
  currentPage = 1
  loadMovies()
}

async function loadAllMovies (id) {
  selectedUser = null
  loadMovies()
}

async function loadMovies () {
  let url = '/movies'
  url += '?page=' + currentPage
  url += '&createdBy=' + selectedUser
  url += '&sortBy=' + sortBy

  moviesList.innerHTML = ''
  loaderContainer.innerHTML = `  
  <div class="spinner-border" role="status">
    <span class="sr-only">Loading...</span>
  </div>`

  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow'
  })
  if (response.redirected) {
    location.href = response.url
  } else {
    const { data } = await response.json()
    hasNext = data.hasNext
    renderMovieList(data.movies)
  }
}

function renderMovieList (movies) {
  activeMovies = movies.slice()

  loaderContainer.innerHTML = ''

  switch (sortBy) {
    case 'likes':
      movies.sort((a, b) => a.likes > b.likes ? -1 : 1)
      break
    case 'hates':
      movies.sort((a, b) => a.hates > b.hates ? -1 : 1)
      break
    default:
      movies.sort((a, b) => a.createdAt > b.createdAt ? -1 : 1)
      break
  }

  movies.forEach(m => {
    const li = document.createElement('li')
    li.classList.add('list-group-item')
    const diffTime = (new Date() - new Date(m.createdAt))

    var seconds = diffTime / 1000

    var minutes = seconds / 60
    seconds = Math.round(seconds % 60)

    var hours = minutes / 60
    minutes = Math.round(minutes % 60)

    var days = Math.floor(hours / 24)
    hours = Math.round(hours % 24)

    let diff = ''
    diff += days ? days + ' days ' : ''
    diff += hours ? hours + ' hours ' : ''
    diff += minutes ? minutes + ' minutes ' : ''
    diff += seconds ? seconds + ' seconds ' : ''

    const likeIt = user && user.liked.includes(m._id)
    const hateIt = user && user.hated.includes(m._id)

    li.innerHTML = `
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">` + m.title + `</h5>
            <p class="card-text">
              Posted by
               <a href="#" onclick=loadUserMovies("` + m.createdBy._id + '")>' +
                (user ? (m.createdBy._id === user._id) ? 'me' : m.createdBy.username : m.createdBy.username) +
              '</a> ' + diff + ` ago
            </p>
            <p class="card-text">` + m.description + ` </p>
            <p class="card-text">` + m.likes.length + ' Likes | ' + m.hates.length + ' Hates | ' +
                (likeIt ? 'You like It ' : hateIt ? 'You hate it' : '') +
              `</p>
            ` + (user && (m.createdBy._id !== user._id) ? `<div style="display:flex;">
              <button onclick=like("` + m._id + '") class="btn btn-success"' + (likeIt ? 'disabled' : '') + ` style="margin:2px">Like</button>
              <button onclick=hate("` + m._id + '") class="btn btn-danger" ' + (hateIt ? 'disabled' : '') + ` style="margin:2px">Hate</button>
            </div> ` : '') + `
          </div>` +
          (user && (m.createdBy._id === user._id)
            ? `<div style="text-align: right;">
            <button type="button" onclick=editMovie("` + m._id + `") class="btn btn-outline-warning">Edit</button>
            <button type="button" onclick=deleteMovie("` + m._id + `") class="btn btn-outline-danger">Delete</button>
          </div>` : '') + `
        </div>
        `
    moviesList.appendChild(li)
  })
  setPagination()
}

function setPagination () {
  nextPageBtn.disabled = true
  previousPageBtn.disabled = true

  if (hasNext) {
    nextPageBtn.disabled = false
  }
  if (currentPage > 1) {
    previousPageBtn.disabled = false
  }
}

// When the user clicks on the button, scroll to the top of the document
function goTop () {
  document.body.scrollTop = 0 // For Safari
  document.documentElement.scrollTop = 0 // For Chrome, Firefox, IE and Opera
}

function nextPage () {
  if (hasNext) {
    currentPage += 1
    goTop()
    selectedUser ? loadUserMovies(selectedUser) : loadAllMovies()
  }
}

function previousPage () {
  if (currentPage > 1) {
    currentPage -= 1
    goTop()
    selectedUser ? loadUserMovies(selectedUser) : loadAllMovies()
  }
}

function setSortBy (value) {
  sortBy = value
  renderMovieList(activeMovies)
}

const clearActiveSortStyle = () => {
  document.querySelectorAll('.sortby').forEach(e => {
    e.classList.remove('active-sort')
  })
}

document.getElementById('sortByLikes').onclick = (e) => {
  clearActiveSortStyle()
  e.target.classList.add('active-sort')
  setSortBy('likes')
}

document.getElementById('sortByDate').onclick = (e) => {
  clearActiveSortStyle()
  e.target.classList.add('active-sort')
  setSortBy('createdAt')
}

document.getElementById('sortByHates').onclick = (e) => {
  clearActiveSortStyle()
  e.target.classList.add('active-sort')
  setSortBy('hates')
}

document.getElementById('allMoviesBtn').onclick = () => loadAllMovies()

document.getElementById('myMoviesBtn').onclick = () => loadUserMovies(user._id)

document.getElementById('createBtn').onclick = createMovie

// eslint-disable-next-line no-unused-vars
function deleteMovie (id) {
  $('#confirmationDeleteMovieModal').modal('show')
  $('#confirmationDeleteMovieModal').one('hidden.bs.modal', function () {
    $('#deleteMovieForm').off('submit')
  })
  $('#deleteMovieForm').one('submit', async (e) => {
    e.preventDefault()
    $('#confirmationDeleteMovieModal').off('hidden.bs.modal')
    await fetch('/movie/' + id, {
      method: 'DELETE',
      mode: 'cors',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow'
    }).then(r => r.json().then(({ data, error }) => {
      if (data && data._id === id) {
        loadAllMovies()
        $('#confirmationDeleteMovieModal').modal('hide')
      } else {
      // show error message and close
        console.error(error)
      }
    }))
  })
}
