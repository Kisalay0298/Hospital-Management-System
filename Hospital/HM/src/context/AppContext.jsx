import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import { toast } from 'react-toastify'

export const AppContext = createContext();
// export const AppContext = createContext(null); 

const AppContextProvider = (props)=>{

    const currencySymbol = '$'
    const backendURL = import.meta.env.VITE_BACKEND_URL
    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : false)
    const [userData, setUserData] = useState(false)

    const getDoctorsData = async()=>{
        try {

            const {data} = await axios.get(`${backendURL}/api/doctor/list`)
            if (data.success) {
                setDoctors(data.doctors)
                console.log(data.doctors)
            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const loadUserProfileData = async ()=>{
        try {

            const { data } = await axios.get(`${backendURL}/api/user/get-profile`, {headers:{Authorization: `Bearer ${token}`}})
            
            if (data.success) {
                // setUserData(data.userData)
                setUserData(data.user)
            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        getDoctorsData()
    },[])

    useEffect(()=>{
        if(token){
            loadUserProfileData()
        }else{
            setUserData(false)
        }
    },[token])
    
    // useEffect(() => {
    //     console.log("Updated userData in AppContext:", userData);
    // }, [userData]);

    const value = {
        doctors, getDoctorsData,
        setDoctors,
        currencySymbol,
        token, setToken,
        backendURL,
        userData,setUserData,
        loadUserProfileData
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider
