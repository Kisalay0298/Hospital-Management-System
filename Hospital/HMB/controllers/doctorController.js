import doctorModel from "../models/doctorModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js";

const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body;

        const docData = await doctorModel.findById(docId);
        if (!docData) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available }, { new: true });

        res.json({ success: true, message: "Availability changed successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const doctorList = async (req, res)=>{
    try {

        const doctors = await doctorModel.find({}).select(['-password', '-email'])
        res.json({success: true, doctors})
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// doctor login
const loginDoctor = async(req, res)=>{
    try {

        const {email, password} = req.body
        const doctor = await doctorModel.findOne({email})

        if(!doctor){
            return res.json({success: false, message: "Invalid credentials"})
        }

        const passwordIsMached = await bcrypt.compare(password, doctor.password)

        if(!passwordIsMached){
            return res.json({success: false, message: "Invalid Password"})
        }

        const token = jwt.sign({id:doctor._id}, process.env.jwt_secret)

        res.json({success: true, token})
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// get doctor appointments
const getAppointments = async (req, res) => {
    try {

        const token = req.headers.authorization.split(" ")[1]; 
        const decoded = jwt.verify(token, process.env.jwt_secret);

        const doctorId = decoded.id; // Extract doctor's ID from token

        // Find all appointments for the logged-in doctor
        const appointments = await appointmentModel.find({ docId: doctorId });

        res.json({ success: true, appointments });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// appointment complted
const appointmentCompleted = async (req, res) => {
    try {

        const { appointmentId } = req.body
        console.log(req.docId)
        const docId = req.docId;

        const appointmentData = await appointmentModel.findById(appointmentId)
        if(appointmentData && String(appointmentData.docId) === String(docId) ){
            await appointmentModel.findByIdAndUpdate(appointmentId, {isCompleted: true})
            return res.json({success: true, message: "Appointment Completed"})
        }else{
            return res.json({success: false, message: "Appointment completion failed"})
        }
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// cancel appointment
const cancelAppointment = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const docId = req.docId

        const appointmentData = await appointmentModel.findById(appointmentId)
        if(appointmentData && String(appointmentData.docId) === String(docId) ){
            await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled: true})
            return res.json({success: true, message: "Appointment Cancelled"})
        }else{
            return res.json({success: false, message: "Cancellation failed"})
        }
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// dashboard
const dashboard = async (req, res) => {
    try {

        const docId = req.docId
        const appointments = await appointmentModel.find({docId})
        let earnings = 0;
        appointments.map((item)=>{
            if(item.isCompleted || item.payment){
                earnings+=item.amount
            }
        })

        let patients = []
        appointments.map((item)=>{
            if(!patients.includes(item.userId.toString())){
                patients.push(item.userId.toString())
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients:patients.length,
            latestAppointments: appointments.reverse().slice(0,5)
        }
        res.json({success: true, dashData})
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


// view profile
const getProfile = async (req, res) => {
    try {

        const docId = req.docId
        const profile = await doctorModel.findById(docId).select('-password')
        res.json({success: true, profile})
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
// update profile
const updateProfile = async (req, res) => {
    try {

        const docId = req.docId
        const { fees, address, available } = req.body
        
        await doctorModel.findByIdAndUpdate(docId, {fees, address, available})
        res.json({success: true, message: 'Profile Updated'})
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


export { 
    changeAvailability, 
    doctorList,
    loginDoctor,
    getAppointments,
    appointmentCompleted,
    cancelAppointment,
    dashboard,
    getProfile,
    updateProfile
};
