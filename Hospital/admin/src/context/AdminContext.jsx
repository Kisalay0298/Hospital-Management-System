import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {

    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken') : '')
    const [doctors, setDoctors] = useState([])
    const [appointments, setAppointments] = useState([])
    const [dashboardData, setDashboardData] = useState(false)

    const backendURL = "https://hospital-management-backend-4poz.onrender.com"

    const getAllDoctors = async()=>{
        try {
            const{data} = await axios.post(`${backendURL}/api/admin/all-doctors`, {}, { headers:{ Authorization: `Bearer ${aToken}` }})
            console.log(data)
            if(data.success){
                setDoctors(data.doctors)
                console.log(data.doctors)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getAllAppointments = async () => {
        try {
            
            const { data } = await axios.get(`${backendURL}/api/admin/appointments`, { headers:{ Authorization: `Bearer ${aToken}` }})


            if(data.success){
                setAppointments(data.appointments)
                console.log(data.appointments)
            }else{
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    // const getAllAppointments = async () => {
    //     try {
    //         // const { data } = await axios.get(`${backendURL}/api/admin/appointments`, { 
    //         //     headers: { Authorization: `Bearer ${aToken}` }
    //         // });
    //         const{data} = await axios.get(`${backendURL}/api/admin/appointments`, {}, { headers:{ Authorization: `Bearer ${aToken}` }})
    
    //         console.log("Fetched Appointments Data:", data); // Debugging
    
    //         if (data.success) {
    //             setAppointments(data.appointments);
    //             console.log("Appointments List:", data.appointments); // Debugging
    //         } else {
    //             toast.error(data.message);
    //         }
    //     } catch (error) {
    //         console.error("Error fetching appointments:", error);
    //         toast.error(error.message);
    //     }
    // };
    

    const changeAvailability = async (docId)=>{
        try {

            const { data } = await axios.post(`${backendURL}/api/admin/change-availability`, {docId}, {headers:{ Authorization: `Bearer ${aToken}`}})
            if(data.success){
                toast.success(data.message)
                getAllDoctors()
            }else{
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    const cancelAppointment = async (appointmentId) => {
        try {

            const {data} = await axios.post(`${backendURL}/api/admin/cancel-appointment`, {appointmentId}, {headers:{ Authorization: `Bearer ${aToken}`}})
            if(data.success){
                toast.success(data.message)
                getAllAppointments()
            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getDashData = async () => {
        try {

            const {data} = await axios.get(`${backendURL}/api/admin/dashboard`, {headers:{ Authorization: `Bearer ${aToken}`}})
            
            if(data.success){
                setDashboardData(data.dashData)
                console.log(data.dashData)
                console.log("Dashboard Data Set:", data.dashData); 
            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
            toast.error(error.message)
        }
    }

    const value={
        aToken, 
        setAToken, 
        backendURL, 
        doctors, 
        getAllDoctors, 
        changeAvailability, 
        appointments, 
        setAppointments, 
        getAllAppointments, 
        cancelAppointment, 
        dashboardData,
        getDashData
    }

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider
