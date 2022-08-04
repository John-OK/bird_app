import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import NavBarBC from './components/NavBarBC';
import SignUpPage from './pages/signup';
import LogInPage from './pages/login';
import Search from './pages/search';
import HomePage from './pages/homepage';

function getCookie(name) {
  // Get value of cookie passed as argument
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}
// Get csrftoken value
const csrftoken = getCookie('csrftoken');
// Set X-CSRFToken header for all axios calls
axios.defaults.headers.common['X-CSRFToken'] = csrftoken

function App() {
  const [count, setCount] = useState(0)
  const [user, setUser] = useState(null)

  const whoAmI = async () => {
    const response = await axios.get('/whoami')
    const user = response.data && response.data[0] && response.data[0].fields
    // const user = response.data[0].fields
    console.log('user from whoami? ', user, response)
    setUser(user)
  }  

  useEffect(()=>{
    whoAmI()
  }, [])

  const handleSubmit = (event) => {
    console.dir(`authentication submit: ${event.target[0].value}, ${event.target[1].value}`);
    event.preventDefault;
  }

  return (
    <div className="App">
      <NavBarBC />
      <h1>Bird Confirm&trade;</h1>
      <Router>
        <Routes>
          <Route path='/' element={<HomePage whoAmI={whoAmI} /> } />
          <Route path='/signup' element={<SignUpPage />} />
          <Route path='/login' element={<LogInPage /> } />
          <Route path='/search' element={<Search /> } />
        </Routes>
      </Router>
    </div>
  )
}

export default App;










  // const submitSignupForm = function(event){
  //   //CHECK IF SUCCESS/FAIL AND RETURN PROPER BEHAVIOR
  //   event.preventDefault()
  //   axios.post('/signup', {email: event.target[0].value, password: event.target[1].value})
  //     .then((response)=>{
  //       console.log('signup response from server: ', response)
  //   })
  // }

  // const submitLogin = function(event){
  //   event.preventDefault()
  //   axios.post('/login', {email: 'jeff@amazon.com', password:'dragons'}).then((response)=>{
  //     console.log('login response from server: ', response)
  //     window.location.reload()
  //   })
  // }
  
  // const submitLogout = function(event){
  //   // this isn't actually necessary, since this isn't in a form. but if it WAS a form, we'd need to prevent default.
  //   event.preventDefault()
  //   axios.post('/logout').then((response)=>{
  //     console.log('logout response from server: ', response)
  //     whoAmI()
  //   })
  // }
