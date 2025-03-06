import express from 'express'
import { doctorList, getAppointments, loginDoctor, appointmentCompleted, cancelAppointment, dashboard, updateProfile, getProfile } from '../controllers/doctorController.js'
import authDoctor from '../middlewares/authDoctor.js'



const doctorRouter = express.Router()

doctorRouter.get('/list', doctorList)
doctorRouter.post('/login', loginDoctor)
doctorRouter.get('/appointments', authDoctor, getAppointments)
doctorRouter.post('/complete-appointment', authDoctor, appointmentCompleted)
doctorRouter.post('/cancel-appointment', authDoctor, cancelAppointment)
doctorRouter.get('/dashboard', authDoctor, dashboard)
doctorRouter.get('/profile', authDoctor, getProfile)
doctorRouter.put('/update-profile', authDoctor, updateProfile)

export default doctorRouter