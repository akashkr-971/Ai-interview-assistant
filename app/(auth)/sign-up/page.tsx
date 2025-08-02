'use client'

import { useState } from 'react';
import Link from "next/link";
import InputField from '../../components/InputField'
import Button from '../../components/button'
import AuthLayout from '../authlayout'
import { supabase } from "@/lib/supabaseClient";

const SignIn = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password
    });

    if (error) {
      console.error("Auth Signup Error:", error.message);
      setError(error.message);
      return;
    }

    if (data.user) {
      const { error: dbError } = await supabase.from('users').insert([
        {
          id: data.user.id,
          name: formData.name,
          email: formData.email,
          role: formData.role 
        }
      ]);
      if (dbError) {
        console.error("Inserting user data Error:", dbError.message);
        setError(dbError.message);
        return;
      }

      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("role", data.user.role||'user');
      console.log("User signed up successfully:", data.user.id);
      console.log("User role:", data.user.role);
      if(data.user.role === 'admin'){
        window.location.href = "/admin";
      }else if(data.user.role === 'interviewer'){
        window.location.href = "/interviewer";
      }else{
        window.location.href = "/";
      }

    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit}>
        <div className='flex items-center justify-center min-h-screen'>
          <div className="max-w-md w-full mx-auto p-6 bg-white shadow-md rounded-lg space-y-4 justify-center align-middle">
            <h1 className="text-2xl font-semibold text-gray-800 text-center">Sign Up</h1>
            <p className="text-sm text-gray-500 text-center">Please fill in your credentials to sign up.</p>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose your role</label>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div
                  onClick={() => setFormData(prev => ({ ...prev, role: 'user' }))}
                  className={`flex-1 border rounded-xl p-4 cursor-pointer transition-all duration-200
                    ${formData.role === 'user' 
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' 
                      : 'border-gray-300 bg-white'} hover:shadow-sm`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">🧑‍🎓</div>
                    <div>
                      <h3 className="text-md font-semibold">Candidate</h3>
                      <p className="text-xs text-gray-500">I&apos;m here to practice interviews</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setFormData(prev => ({ ...prev, role: 'interviewer' }))}
                  className={`flex-1 border rounded-xl p-4 cursor-pointer transition-all duration-200
                    ${formData.role === 'interviewer' 
                      ? 'border-green-600 bg-green-50 ring-2 ring-green-200' 
                      : 'border-gray-300 bg-white'} hover:shadow-sm`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">🧑‍💼</div>
                    <div>
                      <h3 className="text-md font-semibold">Interviewer</h3>
                      <p className="text-xs text-gray-500">I&apos;m here to take interviews</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <InputField
              label="Name"
              placeholder="Enter your name here"
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
            />
            <InputField
              label="Email"
              placeholder="Enter your Email"
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
            />
            <InputField
              label="Password"
              placeholder="Enter your Password"
              type='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
            />
            <InputField
              label="Confirm Password"
              placeholder="Confirm your Password"
              type='password'
              name='confirmPassword'
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <div className='flex flex-col space-y-4'>
              <Button text="Sign Up" onClick={() => {}} />
              <p className="text-sm text-center text-gray-600">
                Already have an account?{" "}
                <Link href="/log-in" className="text-blue-500 hover:underline">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignIn;
