import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on('connected', (e)=> {
        if(e){
            console.log('Error connecting to MongoDB')
        }
        console.log("Database Connected Successfully.")
    })

    await mongoose.connect(`${ process.env.mongoDB_URI }/prescripto`)
}

export default connectDB