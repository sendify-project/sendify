import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route, Redirect, useHistory } from 'react-router-dom'
import LoginPage from 'container/login-page.js'
import SignupPage from 'container/signup-page.js'
import ChatPage from 'container/chat-page.js'
import axios from 'axios'

function App() {
  const [user, setUser] = useState({
    name: '',
    accessToken: '',
    firstname: '',
    lastname: '',
    phone: '',
    userId: '',
    isLogin: false,
  })
  const history = useHistory()

  // useEffect(() => {
  //   if (user.accessToken !== '' && user.firstname === '' && user.lastname === '') {
  //     const fetchData = async (accessToken) => {
  //       try {
  //         const user = await getUserInfo(accessToken)
  //         if (!user.firstname || !user.lastname) {
  //           alert('get uesr info error')
  //           return history.push('/login')
  //         } else {
  //           setUser((prev) => ({ ...prev, ...user }))
  //         }
  //       } catch (err) {
  //         console.log(err)
  //         logout()
  //         alert('get uesr info error')
  //         return history.push('/login')
  //       }
  //     }
  //     fetchData(user.accessToken)
  //   }
  // }, [user.accessToken])

  const logout = () => {
    setUser({ name: '', accessToken: '', firstname: '', lastname: '', phone: '', userId: undefined, isLogin: false })
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
          <LoginPage setUser={setUser} getUserInfo={getUserInfo} logout={logout} />
        </Route>
        <Route path='/signup'>
          <SignupPage setUser={setUser} getUserInfo={getUserInfo} logout={logout} />
        </Route>
        <Route path='/chat'>{user.isLogin ? <ChatPage user={user} logout={logout} /> : <Redirect to='/login' />}</Route>
      </Switch>
    </Router>
  )
}

function CheckLocalStorage({ user, setUser }) {
  const history = useHistory()

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token')
    const firstname = localStorage.getItem('firstname')
    const lastname = localStorage.getItem('lastname')
    const userId = localStorage.getItem('user_id')
    if (accessToken && accessToken !== '' && accessToken !== user.accessToken) {
      setUser((prev) => ({ ...prev, accessToken, firstname, lastname, userId, isLogin: true }))
      history.push('/chat')
    }
  }, [])

  return <></>
}

function getUserInfo(accessToken) {
  return axios
    .get('/api/account', {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
    })
    .then((res) => {
      if (!res.data.firstname || !res.data.lastname) {
        throw new Error('get user info failed')
      } else {
        return res.data
      }
    })
}

export default App
