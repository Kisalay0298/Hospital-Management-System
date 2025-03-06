import bcrypt from 'bcrypt'
import validator from 'validator'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'
import dotenv from 'dotenv';
dotenv.config();


// API for adding doctor
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, address, speciality, degree, experience, about, fees } = req.body;
        const imageFile = req.file;

        // Checking all required fields
        if (!name || !email || !password || !address || !speciality || !degree || !experience || !about || !fees || !imageFile) {
            return res.json({ success: false, message: "Please fill all the fields." });
        }

        // Validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter valid email." });
        }
        // Check if doctor with the same email already exists
        const existingDoctor = await doctorModel.findOne({ email });
        if (existingDoctor) {
            return res.json({ success: false, message: "Email user already exists." });
        }

        // Validating strong password (min 8 characters)
        if (password.length < 8) {
            return res.json({ success: false, message: "Password is very sort." });
        }

        // Hashing password
        const salt = await bcrypt.genSalt(8);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Upload image to Cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageURL = imageUpload.secure_url;

        // Ensure `address` is parsed correctly
        let parsedAddress;
        try {
            parsedAddress = typeof address === "string" ? JSON.parse(address) : address;
        } catch (error) {
            return res.json({ success: false, message: "Invalid address format." });
        }

        // Save the data into the database
        const doctorData = {
            name,
            email,
            password: hashedPassword,
            // address: JSON.parse(address),
            address: parsedAddress,
            speciality,
            degree,
            experience,
            about,
            fees,
            image: imageURL,
            date: Date.now(),
        };

        const newDoctor = new doctorModel(doctorData);
        console.log(doctorData)
        await newDoctor.save();

        res.json({ success: true, message: "New doctor added successfully." });

    } catch (err) {
        console.error("Error adding doctor:", err);
        res.json({ success: false, message: "Oops! Something went wrong." });
    }
};

// api for the admin login
const loginAdmin = async (req, res)=>{
    try{
        const { email, password } = req.body;
        if( email === process.env.admin_email && password === process.env.admin_password ){

            const token = jwt.sign( email+password, process.env.jwt_secret)
            res.json({ success: true, token });

        }else{
            res.json({ success: false, message: "Invalid credentials." });
        }
    }catch(err){
        console.error("Error logging in admin:", err);
        res.status(500).json({ success: false, message: "Oops! Something went wrong."})
    }
}


// api to get all doe=ctors list on the admin side
const allDoctors = async( req, res )=>{
    try{
        const doctors = await doctorModel.find({}).select('-password')
        res.json({success:true, doctors})
    }catch(err){
        console.log(err)
        res.json({success:false, message: err.message})
    }
}


// get all appointments
const getAllAppointments = async(req, res)=>{
    try {

        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })
        
    } catch (error) {
        console.log(err)
        res.json({success:false, message: err.message})
    }
}


// appointment cancillation
const cancelAppointmentByAdmin = async (req, res) => {
    try {
        // const userId = req.userId;
        const { appointmentId } = req.body;

        // console.log("appointmentId:", appointmentId);
        // console.log("userId:", userId);
        // console.log("Received req.body:", req.body);

        // // Validate if appointmentId is a valid ObjectId
        // if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        //     return res.json({ success: false, message: "Invalid appointment ID" });
        // }

        // // Find appointment
        const appointmentData = await appointmentModel.findById(appointmentId);
        // if (!appointmentData) {
        //     return res.json({ success: false, message: "Appointment not found" });
        // }

        // // Check if the user is authorized to cancel this appointment
        // if (appointmentData.userId.toString() !== userId) {
        //     return res.json({ success: false, message: "Unauthorized action" });
        // }

        // Cancel appointment
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        // Remove doctor's slot
        const { docId, slotDate, slotTime } = appointmentData;
        const doctorData = await doctorModel.findById(docId);
        if (doctorData) {
            let slots_booked = doctorData.slots_booked || {};
            if (slots_booked[slotDate]) {
                slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
                await doctorModel.findByIdAndUpdate(docId, { slots_booked });
            }
        }

        res.json({ success: true, message: "Appointment Cancelled" });

    } catch (error) {
        console.error("Error cancelling appointment:", error);
        res.json({ success: false, message: error.message });
    }
};

// get dashboard data for the admin panel
const getAdminDashboardData = async(req, res)=>{
    try {

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse().slice(0,5)
        }
        res.json({success: true, dashData})
        
    } catch (error) {
        console.error("Error cancelling appointment:", error);
        res.json({ success: false, message: error.message });
    }
}



export { addDoctor, loginAdmin, allDoctors, getAllAppointments, cancelAppointmentByAdmin, getAdminDashboardData };
