'use client'
import React, { useState } from 'react'
import { Fugaz_One } from "next/font/google";
import Button from './Button';
import { useAuth } from '@/context/AuthContext';

const fugazOne = Fugaz_One({ subsets: ["latin"], weight: ['400'] });

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { signup, login, resetPassword } = useAuth();

  async function handleSubmit() {
    setErrorMsg(''); // Clear previous errors
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return; 
    }
    setAuthenticating(true);
    try {
      if (isRegister) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (error) {
      if (
        isRegister &&
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'auth/email-already-in-use'
      ) {
        setErrorMsg('This email is already registered. Please sign in instead.');
      } else {
        setErrorMsg('Authentication error. Please try again.');
      }
      console.error(error);
    } finally {
      setAuthenticating(false);
    }
  }

  async function handleResetPassword() {
    if (!email) {
      alert('Please enter your email address to reset your password.');
      return;
    }
    try {
      await resetPassword(email);
      alert('Password reset email sent!');
    } catch (error) {
      alert('Error sending password reset email.');
      console.error(error);
    }
  }

  return (
    <div className='flex flex-col flex-1 justify-center items-center gap-4'>
      <h3 className={'text-4xl sm:text-5xl md:text-6xl ' + fugazOne.className}>{isRegister ? 'Register' : 'Login'}</h3>
      <p>You&#39;re one step away!</p>
      {errorMsg && (
        <div className="text-red-600 font-bold mb-2">{errorMsg}</div>
      )}
      <input value={email} onChange={(e) => setEmail(e.target.value)} className='w-full max-w-[400px] mx-auto px-3 py-2 sm:py-3 border bprder-solid border-[#ff8000] rounded-full outline-none durations-200 hover:border-[#005247] hover:text-[#005247] focus:border-[#005247]'
        placeholder='Email' />
      <input value={password} onChange={(e) => setPassword(e.target.value)} className='w-full max-w-[400px] mx-auto px-3 py-2 sm:py-3 border bprder-solid border-[#ff8000] rounded-full outline-none durations-200 hover:border-[#005247] hover:text-[#005247] focus:border-[#005247]'
        placeholder='Password' type='password' />
      <div className='max-w-[400px] w-full mx-auto'>
        <Button clickHandler={handleSubmit} text={authenticating ? 'Submitting' : 'Submit'} full />
      </div>
      <p className='text-center'>{isRegister ? 'Already have an account? ' : 'Don\'t have an account? '}<button onClick={() => { setIsRegister(!isRegister); setErrorMsg('');}} className='text-[#ff8000]'>{ isRegister ? 'Sign In' : 'Sign Up'}</button></p>
      <p className='text-center text-[#ff8000]'>{!isRegister ? <button type='button' onClick={handleResetPassword}>Forgot Password?</button> : ''}</p>
    </div>
  )
}
