import { useState, useLayoutEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import LoginPage from './components/login-page'
import SignupPage from './components/signup-page'
import ChatPage from './components/chat-page'
import JSONbig from 'json-bigint'
import axios from 'axios'

function App() {
  const accessToken = localStorage.getItem('access_token') || ''
  const refreshToken = localStorage.getItem('refresh_token') || ''
  const firstname = localStorage.getItem('firstname') || ''
  const lastname = localStorage.getItem('lastname') || ''
  const userId = localStorage.getItem('user_id') || undefined
  let isLogin = false
  if (accessToken !== '' && refreshToken !== '' && !isTokenExpired(accessToken)) {
    isLogin = true
  }
  const [user, setUser] = useState({
    accessToken: accessToken,
    refreshToken: refreshToken,
    firstname: firstname,
    lastname: lastname,
    userId: userId,
    isLogin: isLogin,
  })
  const navigate = useNavigate()

  const logout = () => {
    setUser({ accessToken: '', refreshToken: '', firstname: '', lastname: '', userId: undefined, isLogin: false })
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  const handleRefresh = (refreshToken) => {
    return axios.post('/api/account/auth/refresh', { refresh_token: refreshToken }).then(async (res) => {
      const newAccessToken = res.data.access_token
      const newRefreshToken = res.data.refresh_token
      let user
      try {
        user = await getUserInfo(newAccessToken)
        localStorage.setItem('access_token', newAccessToken)
        localStorage.setItem('refresh_token', newRefreshToken)
        localStorage.setItem('firstname', user.firstname)
        localStorage.setItem('lastname', user.lastname)
        localStorage.setItem('user_id', user.id)
        setUser((prev) => ({
          ...prev,
          ...user,
          userId: user.id,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          isLogin: true,
        }))
        navigate('/')
      } catch (err) {
        console.log(err)
      }
    })
  }

  useLayoutEffect(() => {
    if (user.accessToken !== '' && user.refreshToken !== '' && isTokenExpired(user.accessToken)) {
      handleRefresh(user.refreshToken)
    }
  }, [])

  return (
    <>
      <Routes>
        <Route exact path='/' element={user.isLogin ? <Navigate to='/chat' /> : <Navigate to='/login' />} />
        <Route path='/login' element={<LoginPage setUser={setUser} getUserInfo={getUserInfo} logout={logout} />} />
        <Route path='/signup' element={<SignupPage />} />
        <Route
          path='/chat'
          element={
            user.isLogin ? (
              <ChatPage user={user} logout={logout} handleRefresh={handleRefresh} />
            ) : (
              <Navigate to='/login' />
            )
          }
        />
      </Routes>
    </>
  )
}

const getUserInfo = (accessToken) => {
  return axios
    .get('/api/account/info/person', {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
      transformResponse: (res) => {
        return JSONbig({ storeAsString: true }).parse(res)
      },
    })
    .then((res) => {
      if (!res.data.firstname || !res.data.lastname || !res.data.id) {
        throw new Error('get account person info failed')
      } else {
        return res.data
      }
    })
}

function isTokenExpired(token) {
  let decodedToken = parseJwt(token)
  return Date.now() >= decodedToken.exp * 1000
}

function parseJwt(token) {
  var base64Url = token.split('.')[1]
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join('')
  )

  return JSON.parse(jsonPayload)
}

export default App
