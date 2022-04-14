import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function SignupPage() {
  const [email, setEmail] = useState('')
  const [passwd, setPasswd] = useState('')
  const [confirmPasswd, setConfirmPasswd] = useState('')
  const [firstname, setFirstName] = useState('')
  const [lastname, setLastName] = useState('')
  const navigate = useNavigate()

  const handleClick = () => {
    if (passwd.length < 8) {
      alert('Length of password must be > 8')
      return
    }
    axios
      .post('/api/account/auth/signup', {
        email,
        password: passwd,
        firstname,
        lastname,
      })
      .then(async (res) => {
        if (res.data.access_token) {
          alert('sign up success')
          navigate('/login')
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
                email === '' || firstname === '' || lastname === '' || passwd === '' || passwd !== confirmPasswd
              }
            >
              Sign Up
            </button>
            <div className='text-center mt-5 text-lg fs-4'>
              <p className='text-gray-600'>
                Already have an account?{' '}
                <Link to='/login' className='font-bold'>
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
