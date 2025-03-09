import { useContext, useState } from "react"
import { AppContext } from "../context/AppContext"
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { useEffect } from "react"

const Login = () => {

  const { backendURL, token, setToken } = useContext(AppContext)

  const navigate = useNavigate()

  const [state, setState] = useState('Sign Up')
  const [email, setEmail] = useState('test@gmail.com')
  const [password, setPassword] = useState('Test@123')
  const [name, setName] = useState('')

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {

      if(state === 'Sign Up'){

        const { data } = await axios.post(`${backendURL}/api/user/register`, {name, password, email})
        
        if(data.success){
          toast.success(state === 'Sign Up' ? 'User created successfully' : 'Logged in successfully');
          localStorage.setItem('token', data.token)
          setToken(data.token)
        }else{
          toast.error(data.message)
        }

      }else{
        
        const { data } = await axios.post(`${backendURL}/api/user/login`, {password, email})
        
        if(data.success){
          toast.success(state === 'Sign Up' ? 'User created successfully' : 'Logged in successfully');
          localStorage.setItem('token', data.token)
          setToken(data.token)
        }else{
          toast.error(data.message)
        }

      }
      
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    if(token){
      navigate('/')
    }
  })

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">{state === 'Sign Up' ? "Create Account" : "Login"}</p>
        <p>Please {state === 'Sign Up' ? "sign up" : "log in"} to book appointment</p>
        {
          state === 'Sign Up' && 
          <div className="w-full">
            <div>Full Name</div>
            <input className="border border-zinc-300 rounded w-full p-2 mt-1" type="text" onChange={(e) => setName(e.target.value)} value={name} required />
          </div>
        }
        
        <div className="w-full">
          <div>Email</div>
          <input className="border border-zinc-300 rounded w-full p-2 mt-1" type="email" onChange={(e) => setEmail(e.target.value)} value={email} required />
        </div>
        <div className="w-full">
          <div>Password</div>
          <input className="border border-zinc-300 rounded w-full p-2 mt-1" type="password" onChange={(e) => setPassword(e.target.value)} value={password} required />
        </div>
        <button type="submit" className="bg-primary text-white w-full py-2 rounded-md text-base cursor-pointer">{state === 'Sign Up' ? "Create Account" : "Login"}</button>
        {
          state === 'Sign Up'
          ? <p>Already have an account? <span onClick={() => setState('Login')} className="text-primary underline cursor-pointer">Login here</span></p>
          : <p>Create a new account? <span onClick={() => setState('Sign Up')} className="text-primary underline cursor-pointer">click here</span></p>
        }
      </div>
    </form>
  )
}

export default Login
