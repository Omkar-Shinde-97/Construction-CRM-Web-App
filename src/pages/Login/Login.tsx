import React, { FormEvent, useState } from 'react';
import { Building2, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (email === 'om@crm.com' && password === '12345') {
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className='min-h-screen flex bg-slate-100'>
      {/* Left Side */}
      <div className='hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 text-white p-16 flex-col justify-between'>
        <div>
          <div className='flex items-center gap-3'>
            <Building2 size={40} />
            <div>
              <h1 className='text-4xl font-bold'>BuildCRM</h1>
              <p className='text-blue-100'>Construction OS</p>
            </div>
          </div>

          <div className='mt-20'>
            <h2 className='text-5xl font-bold leading-tight'>
              Manage Your
              <br />
              Construction
              <br />
              Business
            </h2>

            <p className='mt-6 text-lg text-blue-100'>
              Complete CRM platform for project management, employee tracking,
              finance and reporting.
            </p>
          </div>
        </div>

        <div className='space-y-4 text-lg'>
          <p>✓ Project Tracking</p>
          <p>✓ Employee Management</p>
          <p>✓ Financial Reports</p>
          <p>✓ Construction Analytics</p>
        </div>
      </div>

      {/* Right Side */}
      <div className='flex-1 flex items-center justify-center p-8'>
        <div className='w-full max-w-md bg-white rounded-3xl shadow-xl p-10'>
          <h2 className='text-3xl font-bold text-slate-800'>Welcome Back</h2>

          <p className='text-slate-500 mt-2'>Sign in to continue</p>

          <form onSubmit={handleLogin} className='mt-8 space-y-5'>
            <div>
              <label className='block mb-2 text-sm font-medium'>
                Email Address
              </label>

              <div className='relative'>
                <Mail
                  size={18}
                  className='absolute left-4 top-4 text-slate-400'
                />

                <input
                  type='email'
                  placeholder='Enter email'
                  className='w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500'
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <label className='block mb-2 text-sm font-medium'>Password</label>

              <div className='relative'>
                <Lock
                  size={18}
                  className='absolute left-4 top-4 text-slate-400'
                />

                <input
                  type='password'
                  placeholder='Enter password'
                  className='w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500'
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                />
              </div>
            </div>

            {error && <div className='text-red-500 text-sm'>{error}</div>}

            <button
              type='submit'
              className='w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition'>
              Sign In
            </button>
          </form>

          <div className='mt-8 rounded-xl bg-slate-50 p-4 border'>
            <p className='font-semibold text-slate-700'>Demo Credentials</p>

            <p className='text-sm mt-2'>
              Email: <strong>om@crm.com</strong>
            </p>

            <p className='text-sm'>
              Password: <strong>12345</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
