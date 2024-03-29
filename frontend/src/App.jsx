import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import NavBarBC from './components/NavBarBC';
import SignUpPage from './pages/signup';
import LogInPage from './pages/login';
// import HomePage from './pages/homepage';
import MyBirdsPage from './pages/mybirds';

function getCookie(name) {
  // Get value of cookie passed as argument
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          console.log(`Cookie ${i}= ${cookie}`)
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
  const [user, setUser] = useState(null)

  const whoAmI = async () => {
    const response = await axios.get('/whoami')
    const user = response.data && response.data[0] && response.data[0].fields.username
    const user_email = response.data && response.data[0] && response.data[0].fields.email
    console.log(`whoAmI? username: ${user}; email: ${user_email}  `)
    setUser(user)
  }

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={<NavBarBC whoAmI={whoAmI} user={user} /> } />
          <Route path='/signup' element={<SignUpPage />} />
          <Route path='/login' element={<LogInPage /> } />
          <Route path='/myBirds' element={<MyBirdsPage/>} />
        </Routes>
      </Router>
    </div>
  )
}

export default App;