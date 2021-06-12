import { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import axios from 'axios'

function SignupPage({ setUser, getUserInfo, logout }) {
  const [email, setEmail] = useState('')
  const [passwd, setPasswd] = useState('')
  const [confirmPasswd, setConfirmPasswd] = useState('')
  const [firstname, setFirstName] = useState('')
  const [lastname, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const history = useHistory()

  const handleClick = (e) => {
    if (passwd.length < 8) {
      alert('Length of password must be > 8')
      return
    }
    axios
      .post('/api/signup', { email, password: passwd, firstname, lastname, address: 'taipei', phone_number: phone })
      .then(async (res) => {
        if (res.data.access_token) {
          const accessToken = res.data.access_token
          console.log(accessToken)
          let user
          try {
            user = await getUserInfo(accessToken)
            if (!user.firstname || !user.lastname) {
              alert('login fail')
              return history.push('/login')
            }
          } catch (err) {
            console.log(err)
            logout()
            alert('login fail')
            return history.push('/login')
          }
          localStorage.setItem('access_token', accessToken)
          setUser((prev) => ({
            ...prev,
            ...user,
            accessToken: res.data.access_token,
            isLogin: true,
          }))
          history.push('/chat')
        } else {
          alert('Sign up fail')
        }
      })
      .catch((err) => {
        console.log(err)
        alert('Something wrong occurs')
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
            <h1 className='auth-title'>Sign Up</h1>

            <div className='form-group position-relative has-icon-left mb-4'>
              <input
                type='text'
                className='form-control form-control-xl'
                placeholder='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className='form-control-icon'>
                <i className='bi bi-envelope'></i>
              </div>
            </div>
            <div className='form-group position-relative has-icon-left mb-4'>
              <input
                type='text'
                className='form-control form-control-xl'
                placeholder='First Name'
                value={firstname}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <div className='form-control-icon'>
                <i className='bi bi-person'></i>
              </div>
            </div>
            <div className='form-group position-relative has-icon-left mb-4'>
              <input
                type='text'
                className='form-control form-control-xl'
                placeholder='Last Name'
                value={lastname}
                onChange={(e) => setLastName(e.target.value)}
              />
              <div className='form-control-icon'>
                <i className='bi bi-person'></i>
              </div>
            </div>
            <div className='form-group position-relative has-icon-left mb-4'>
              <input
                type='text'
                className='form-control form-control-xl'
                placeholder='Phone Number'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <div className='form-control-icon'>
                <i className='bi bi-phone'></i>
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
            <div className='form-group position-relative has-icon-left mb-4'>
              <input
                type='password'
                className='form-control form-control-xl'
                placeholder='Confirm Password'
                value={confirmPasswd}
                onChange={(e) => setConfirmPasswd(e.target.value)}
              />
              <div className='form-control-icon'>
                <i className='bi bi-shield-lock'></i>
              </div>
            </div>
            <button
              className='btn btn-primary btn-block btn-lg shadow-lg mt-5'
              onClick={handleClick}
              disabled={
                email === '' ||
                firstname === '' ||
                lastname === '' ||
                phone === '' ||
                passwd === '' ||
                passwd !== confirmPasswd
              }
            >
              Sign Up
            </button>
            <div className='text-center mt-5 text-lg fs-4'>
              <p className='text-gray-600'>
                Already have an account?{' '}
                <Link to='login' className='font-bold'>
                  Log in
                </Link>
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

export default SignupPage
