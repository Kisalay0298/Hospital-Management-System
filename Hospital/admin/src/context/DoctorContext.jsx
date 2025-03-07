import { createContext, useState } from "react";
import axios from "axios";
import {toast} from 'react-toastify'

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {

    const backendURL = "https://hospital-management-backend-4poz.onrender.com"

    const [dToken, setDToken] = useState(localStorage.getItem('dToken') ? localStorage.getItem('dToken') : '')
    const [appointments, setAppointments] = useState([])
    const [dashboardData, setDashboardData] = useState(false)
    const [profileData, setProfileData] = useState(false)

    const getAppointments = async () => {
        try {

            const {data} = await axios.get(`${backendURL}/api/doctor/appointments`, { headers: { Authorization: `Bearer ${dToken}` }})
            if(data.success){
                setAppointments(data.appointments)
                console.log(data.appointments)
            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const completeAppointment  = async (appointmentId) =>{

        try {

            const {data} = await axios.post(`${backendURL}/api/doctor/complete-appointment`, {appointmentId}, { headers: { Authorization: `Bearer ${dToken}`}})
            if(data.success){
                toast.success(data.message)
                getAppointments()
            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    
    const cancelAppointment  = async (appointmentId) =>{

        try {

            const {data} = await axios.post(`${backendURL}/api/doctor/cancel-appointment`, {appointmentId}, { headers: { Authorization: `Bearer ${dToken}`}})
            if(data.success){
                toast.success(data.message)
                getAppointments()
            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    const getDashboardData= async()=>{
        try {

            const {data} = await axios.get(`${backendURL}/api/doctor/dashboard`, { headers: { Authorization: `Bearer ${dToken}`}})
            if(data.success){
                setDashboardData(data.dashData)
                console.log(data.dashData)
            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getProfileData = async () => {
        try {

            const {data} = await axios.get(`${backendURL}/api/doctor/profile`, { headers: { Authorization: `Bearer ${dToken}`}})
            if(data.success){
                setProfileData(data.profile)
                console.log(data.profile)
            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const value={
        dToken, setDToken,
        backendURL,
        appointments, setAppointments,
        getAppointments,
        completeAppointment,
        cancelAppointment,
        getDashboardData, dashboardData, 
        setDashboardData,
        profileData, 
        setProfileData,
        getProfileData
    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider
