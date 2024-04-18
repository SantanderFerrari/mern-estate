import { useState } from 'react';
import { Await, Link, useNavigate } from 'react-router-dom';


export default function Signin() {
    const [formData, setFormData] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const handleChange = (e) => {
        setFormData(
            {
                ...formData,
                [e.target.id]: e.target.value,
            }
        );
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await fetch('/api/auth/signin',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                }
            );
            const data = await res.json();
            if (data.success === false) {
                setLoading(false);
                setError(data.message);
                return;
            };
            setLoading(false);
            console.log(data);
            setError(null);
            navigate('/');
        } catch (error) {
            setLoading(false);
            setError(error.message);
        }

    };
    console.log(formData);
    return (
        <div className='p-3 max-w-lg mx-auto'>
            <h1 className='text-3xl text-center font-semibold my-7'>
                Sign In
            </h1>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>

                <input type="email" placeholder="email"
                    className='border p-3 rounded-lg' id='email' required
                    onChange={handleChange} />
                <input type="password" placeholder="password"
                    className='border p-3 rounded-lg' id='password' required
                    onChange={handleChange} />
                <button disabled={loading} className='bg-slate-700 text-white p-3 
                rounded-lg uppercase hover:opacity-75 
                disabled:opacity-80'>
                    {loading ? 'Getting you signed in...' : 'Sign In'}
                </button>
            </form>
            <div className='flex gap-2 mt-5'>
                <p>Don't have an Account?</p>
                <Link to={"/Signup"}>
                    <span className='text-blue-700'>Sign Up</span>
                </Link>
            </div>
            {error && <p className='text-red-700 mt-5'>{error}</p>}
        </div >
    )
}
