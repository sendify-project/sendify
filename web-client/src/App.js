import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import LoginPage from 'Components/login-page.js'
import SignupPage from 'Components/signup-page.js'
import ChatPage from 'Components/chat-page.js'
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
  const navigate = useNavigate()

  const logout = () => {
    setUser({ name: '', accessToken: '', firstname: '', lastname: '', phone: '', userId: undefined, isLogin: false })
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  return (
    <>
      <CheckLocalStorage user={user} setUser={setUser} />
      <Routes>
        <Route exact path='/' element={user.isLogin ? <Navigate to='/chat' /> : <Navigate to='/login' />} />
        <Route path='/login' element={<LoginPage setUser={setUser} getUserInfo={getUserInfo} logout={logout} />} />
        <Route path='/signup' element={<SignupPage setUser={setUser} getUserInfo={getUserInfo} logout={logout} />} />
        <Route
          path='/chat'
          element={user.isLogin ? <ChatPage user={user} logout={logout} /> : <Navigate to='/login' />}
        />
      </Routes>
    </>
  )
}

function CheckLocalStorage({ user, setUser }) {
  const navigate = useNavigate()

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token')
    const firstname = localStorage.getItem('firstname')
    const lastname = localStorage.getItem('lastname')
    const userId = localStorage.getItem('user_id')
    if (accessToken && accessToken !== '' && accessToken !== user.accessToken) {
      setUser((prev) => ({ ...prev, accessToken, firstname, lastname, userId, isLogin: true }))
      navigate('/chat')
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
