import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route, Redirect, useHistory } from 'react-router-dom'
import LoginPage from 'container/login-page.js'
import SignupPage from 'container/signup-page.js'
import ChatPage from 'container/chat-page.js'

function App() {
  const [user, setUser] = useState({
    name: '',
    accessToken: '',
    firstname: '',
    lastname: '',
    phone: '',
    isLogin: false,
  })
  const history = useHistory()

  const logout = () => {
    setUser({ name: '', accessToken: '', firstname: '', lastname: '', phone: '', isLogin: false })
    localStorage.removeItem('access_token')
    history.push('/login')
  }

  return (
    <Router>
      <CheckLocalStorage user={user} setUser={setUser} />
      <Switch>
        <Route exact path='/'>
          {user.isLogin ? <Redirect to='/chat' /> : <Redirect to='/login' />}
        </Route>
        <Route path='/login'>
          <LoginPage setUser={setUser} />
        </Route>
        <Route path='/signup'>
          <SignupPage setUser={setUser} />
        </Route>
        <Route path='/chat'>{user.isLogin ? <ChatPage logout={logout} /> : <Redirect to='/login' />}</Route>
      </Switch>
    </Router>
  )
}

function CheckLocalStorage({ user, setUser }) {
  const history = useHistory()

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token')
    if (accessToken && accessToken !== '' && accessToken !== user.accessToken) {
      setUser((prev) => ({ ...prev, accessToken, isLogin: true }))
      history.push('/chat')
    }
  }, [])

  return <></>
}

export default App
