import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function LoginPage({ setUser, getUserInfo, logout }) {
  const [email, setEmail] = useState('')
  const [passwd, setPasswd] = useState('')
  const navigate = useNavigate()

  const handleClick = () => {
    axios
      .post('/api/account/auth/login', { email, password: passwd })
      .then(async (res) => {
        const accessToken = res.data.access_token
        const refreshToken = res.data.refresh_token
        let user
        try {
          user = await getUserInfo(accessToken)
          localStorage.setItem('access_token', accessToken)
          localStorage.setItem('refresh_token', refreshToken)
          localStorage.setItem('firstname', user.firstname)
          localStorage.setItem('lastname', user.lastname)
          localStorage.setItem('user_id', user.id)
          setUser((prev) => ({
            ...prev,
            ...user,
            userId: user.id,
            accessToken: accessToken,
            refreshToken: refreshToken,
            isLogin: true,
          }))
          navigate('/')
        } catch (err) {
          console.log(err)
          logout()
        }
      })
      .catch((err) => {
        console.log(err)
        alert('Something wrong happened when login')
      })
  }

  return (
    <div id='auth'>
      <div className='row h-100'>
        <div className='col-lg-5 col-12'>
          <div id='auth-left'>
            <div className='auth-logo'>
              <img src='assets/images/logo/logo.png' alt='Logo' />
            </div>
            <h1 className='auth-title'>Log in.</h1>

            <div className='form-group position-relative has-icon-left mb-4'>
              <input
                type='text'
                className='form-control form-control-xl'
                placeholder='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className='form-control-icon'>
                <i className='bi bi-person'></i>
              </div>
            </div>
            <div className='form-group position-relative has-icon-left mb-4'>
              <input
                type='password'
                className='form-control form-control-xl'
                placeholder='Password'
                value={passwd}
                onChange={(e) => setPasswd(e.target.value)}
              />
              <div className='form-control-icon'>
                <i className='bi bi-shield-lock'></i>
              </div>
            </div>
            <button className='btn btn-primary btn-block btn-lg shadow-lg mt-5' onClick={handleClick}>
              Log in
            </button>
            <div className='text-center mt-5 text-lg fs-4'>
              <p className='text-gray-600'>
                Don't have an account?{' '}
                <Link to='/signup' className='font-bold'>
                  Sign up
                </Link>
                .
              </p>
              <p>
                <Link to='/forgot-password' className='font-bold'>
                  Forgot password?
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
        <div className='col-lg-7 d-none d-lg-block'>
          <div id='auth-right'></div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
