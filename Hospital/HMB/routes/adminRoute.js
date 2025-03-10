import express from 'express'
import { addDoctor, allDoctors, loginAdmin, getAllAppointments, cancelAppointmentByAdmin, getAdminDashboardData } from '../controllers/adminController.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js';
import { changeAvailability } from '../controllers/doctorController.js';

const adminRouter = express.Router();

adminRouter.post('/add-doctor', authAdmin, upload.single('image'), addDoctor )
adminRouter.post('/login', loginAdmin )
adminRouter.post('/all-doctors', authAdmin, allDoctors )
adminRouter.post('/change-availability', authAdmin, changeAvailability )
adminRouter.get('/appointments', authAdmin, getAllAppointments )
adminRouter.post('/cancel-appointment', authAdmin, cancelAppointmentByAdmin )
adminRouter.get('/dashboard', authAdmin, getAdminDashboardData )

export default adminRouter