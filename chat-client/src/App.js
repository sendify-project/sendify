import { useState } from 'react'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
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

  return (
    <Router>
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
        <Route path='/chat'>{user.isLogin ? <ChatPage /> : <Redirect to='/login' />}</Route>
      </Switch>
    </Router>
  )
}

export default App
