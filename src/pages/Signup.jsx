import React from 'react'
import { Link } from 'react-router-dom'

export default function Signup() {
    return (
        <div className='p-3 max-w-lg mx-auto'>
            <h1 className='text-3xl text-center font-semibold my-7'>
                Sign Up
            </h1>
            <form className='flex flex-col gap-4'>
                <input type="text" placeholder="username"
                    className='border p-3 rounded-lg' id='username' required />
                <input type="text" placeholder="email"
                    className='border p-3 rounded-lg' id='email' required />
                <input type="text" placeholder="password"
                    className='border p-3 rounded-lg' id='password' required />
                <button className='bg-slate-700 text-white p-3 
                rounded-lg uppercase hover:opacity-75 
                disabled:opacity-80'>Sign Up</button>
            </form>
            <div className='flex gap-2 mt-5'>
                <p>Have an Account?</p>
                <Link to={"/Signin"}>
                    <span className='text-blue-700'>Sign In</span>
                </Link>
            </div>
        </div >
    )
}
