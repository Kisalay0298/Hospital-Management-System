import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import appointmentModel from '../models/appointmentModel.js';
import doctorModel from '../models/doctorModel.js'
import razorpay from 'razorpay'

// api to register user
const registerUser = async (req, res) => {
    try {
        
        const { name, email, password } = req.body;

        if(!name || !email || !password){
            return res.json({ message: "Missing details" });
        }

        if(!validator.isEmail(email)){
            return res.json({success:false, message:"enter a valid email"})
        }

        if(password.length < 8){
            return res.json({success:false, message:"enter a strong password"})
        }

        const salt = await bcrypt.genSalt(8)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({id: user._id}, process.env.jwt_secret)

        res.json({success: true, token})

    } catch (error) {
        console.log(error)
        res.json({success: false, message:error.message})
        
    }
}

// api for the user login
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success:false, message:"user doesn't exist"})
        }

        const PasswordMatched = await bcrypt.compare(password, user.password)

        if(PasswordMatched){
            const token = jwt.sign({id: user._id}, process.env.jwt_secret)
            res.json({success: true, token})
        }else{
            return res.json({success:false, message:"Invalid password"})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success: false, message:error.message})
    }
}

// api to get user profile data
const getProfile = async (req, res) => {
    try {

        const  userId  = req.userId
        const user = await userModel.findById(userId).select('-password')

        res.json({success:true, user})
        
    } catch (error) {
        console.log(error)
        res.json({success: false, message:error.message})
    }
}


const updateProfile = async (req, res)=>{
    try {

        const { name, phone, address, dob, gender } = req.body
        const imageFile = req.file
        const userId = req.userId;

        if(!name || !phone || !dob || !gender){
            return res.json({success:false, message:"Please fill all the fields"})
        }

        await userModel.findByIdAndUpdate(userId, {name, phone, address:JSON.parse(address), gender, dob})

        if(imageFile){
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: 'image'})
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, {image: imageURL})
        }
        res.json({success: true, message: "Profile Updated Successfully"})
        
    } catch (error) {
        console.log(error)
        res.json({success: false, message:error.message})
    }
}

// book appointment
const bookAppointment = async (req, res) => {

    try {

        const userId = req.userId;
        const { docId, slotDate, slotTime } = req.body
        const docData = await doctorModel.findById(docId).select('-password')

        if(!docData.available){
            return res.json({success:false, message:"Doctor not available"})
        }

        let slots_booked = docData.slots_booked

        // checking for the slots availability
        if(slots_booked[slotDate]){
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({success:false, message:"Slot not available"})
            }else{
                slots_booked[slotDate].push(slotTime)
            }
        }else{
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select('-password')

        // deleting the hostory of the slots booked
        delete docData.slots_booked

        const appointmentData = {
            userId: userId,
            docId: docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slot data in docData
        await doctorModel.findByIdAndUpdate(docId, {slots_booked})

        res.json({success: true, message: 'Appointment Booked'})
        
    } catch (error) {
        console.log(error)
        res.json({success: false, message:error.message})
    }

}

// get all the appointments
const listAppointment = async (req, res) => {
    try {

        const userId = req.userId
        const appointments = await appointmentModel.find({userId})

        res.json({success: true, appointments})
        
    } catch (error) {
        console.log(error)
        res.json({success: false, message:error.message})
    }
}

// cancel appointments
import mongoose from 'mongoose';

const cancelAppointments = async (req, res) => {
    try {
        const userId = req.userId;
        const { appointmentId } = req.body;

        console.log("appointmentId:", appointmentId);
        console.log("userId:", userId);
        console.log("Received req.body:", req.body);

        // Validate if appointmentId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.json({ success: false, message: "Invalid appointment ID" });
        }

        // Find appointment
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        // Check if the user is authorized to cancel this appointment
        if (appointmentData.userId.toString() !== userId) {
            return res.json({ success: false, message: "Unauthorized action" });
        }

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



// online payment using razorpay
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

const onlinePayment = async (req, res) => {

    try {

        const {appointmentId} = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if(!appointmentData || appointmentData.cancelled){
            return res.json({success: false, message: "Appointment cancelled or not found"})
        }

        // creating options for razorpay payment
        const options = {
            amount: appointmentData.amount *100, 
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        // creating an order
        const order = await razorpayInstance.orders.create(options)
        
        res.json({success: true, order})
        
    } catch (error) {

        console.error("Error cancelling appointment:", error);
        res.json({ success: false, message: error.message });
        
    }
    
}

// verify payment
const verifyPayment = async (req, res) => {

    try {

        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        console.log(orderInfo)
        if(orderInfo.status === 'paid'){
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {payment: true})
            res.json({success: true, message: "Payment Successful"})
        }else{
            res.json({success: false, message: "Payment failed"})
        }
        
    } catch (error) {

        console.error("Error cancelling appointment:", error);
        res.json({ success: false, message: error.message });
        
    }

}

// import crypto from "crypto";

// const verifyPayment = async (req, res) => {
//     try {
//         const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

//         // 1️⃣ Fetch order details from Razorpay
//         const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
//         console.log("Order Info:", orderInfo);

//         if (!orderInfo || orderInfo.status !== "paid") {
//             return res.json({ success: false, message: "Payment failed or order not found" });
//         }

//         // 2️⃣ Verify the Razorpay signature (VERY IMPORTANT for security)
//         const secret = process.env.RAZORPAY_KEY_SECRET;
//         const expectedSignature = crypto
//             .createHmac("sha256", secret)
//             .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//             .digest("hex");

//         if (expectedSignature !== razorpay_signature) {
//             return res.status(400).json({ success: false, message: "Invalid payment signature" });
//         }

//         // 3️⃣ Update payment status in the database
//         const appointment = await appointmentModel.findByIdAndUpdate(
//             orderInfo.receipt, 
//             { payment: true }, 
//             { new: true } // Returns the updated document
//         );

//         if (!appointment) {
//             return res.status(404).json({ success: false, message: "Appointment not found" });
//         }

//         res.json({ success: true, message: "Payment verified and updated successfully" });

//     } catch (error) {
//         console.error("Payment verification failed:", error);
//         res.json({ success: false, message: error.message });
//     }
// };

// export default verifyPayment;


export {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointments,
    onlinePayment,
    verifyPayment
}