import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./config/mongodb.js"
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRoute from './routes/userRoute.js'



// api config
const app = express();
const port = process.env.PORT || 3000;
connectDB()
connectCloudinary()




// middlewares
app.use(express.json());
app.use(cors());





// api endpoints
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRoute)
app.get('/', (req, res) => {
    res.send('Api working!')
})




app.listen(port, (e)=>{
    if(e) console.log(e)
    console.log(`Server running at  http://localhost:${port}`)
})
