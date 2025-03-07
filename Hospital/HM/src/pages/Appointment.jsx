import { useContext, useEffect, useState,  } from "react";
import { useParams, useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios' 

const Appointment = () => {

  const { docId } = useParams();
  const { doctors, currencySymbol, backendURL, token, getDoctorsData } = useContext(AppContext)
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const navigate = useNavigate()

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')

  const fetchDocInfo = async () =>{
    const docInfo = doctors.find(doc => doc._id === docId)
    setDocInfo(docInfo)
  }

  const getAvailableSlots = async () => {
    setDocSlots([])
    // get cuttent datae
    let today = new Date()

    for(let i=0;i<7;i++){
      // get the date
      let currDate = new Date(today);
      currDate.setDate(today.getDate()+ i)
      // set endtime of the date with index
      let endTime = new Date()
      endTime.setDate(today.getDate()+i)
      endTime.setHours(21, 0, 0, 0)

      // set hours
      if(today.getDate() === currDate.getDate()){
        currDate.setHours(today.getHours() > 10 ? today.getHours() + 1 : 10);

        currDate.setMinutes(currDate.getMinutes() > 30 ? 30 : 0)
      }else{
        currDate.setHours(10, 0, 0, 0)
      }

      let timeSlots = []

      while(currDate < endTime){
        let formattedTime = currDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})

        let day = currDate.getDate();
        let month = currDate.getMonth() + 1;
        let year = currDate.getFullYear();

        const slotDate = day + '_' + month + '_' + year;
        const slotTime = formattedTime;

        const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true;

        if(isSlotAvailable){
          // add slots to array
          timeSlots.push({
            datetime: new Date(currDate),
            time: formattedTime
          })
        }
        
        
        // increase time by 30 min
        currDate.setMinutes(currDate.getMinutes() + 30)
      }
      setDocSlots(prev => ([...prev, timeSlots]))
    }

    // const response = await fetch(`http://localhost:3001/api/slots/${docId}`)
  }

  const bookAppointment = async()=>{
    if(!token){
      toast.warn('Login to book appointment')
      return navigate('/login')
    }

    try {

      const date = docSlots[slotIndex][0].datetime
      
      let day = date.getDate()
      let month = date.getMonth() + 1
      let year = date.getFullYear()

      const slotDate = day + "_" + month + "_" + year

      if (!slotTime) {
        toast.warn('Please select a time slot before booking.');
        return;
      }

      const { data } = await axios.post(`${backendURL}/api/user/book-appointment`, {docId, slotDate, slotTime}, {headers: {Authorization: `Bearer ${token}`}})
      if(data.success){
        toast.success(data.message)
        getDoctorsData()
        navigate('/my-appointments')
      }else{
        toast.error(data.message)
      }
      
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }

  }

  useEffect(()=>{
    fetchDocInfo()
  }, [doctors, docId])

  // // instead of the above fetchInfo fun
  // const fetchDocInfo = useCallback(() => {
  //   const docInfo = doctors.find(doc => doc._id === docId);
  //   setDocInfo(docInfo);
  // }, [doctors, docId]);
  
  // useEffect(() => {
  //   fetchDocInfo();
  // }, [fetchDocInfo]);
  

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo]);
  

  useEffect(() => {
    console.log(docSlots)
  },[docSlots])

  return docInfo && (
    <div>
      {/* doctots details */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <img className="bg-primary w-full sm:max-w-72 rounded-lg" src={docInfo?.image} alt="" />
        </div>
        <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
          {/* doc info like name degree and experience */}
          <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
            {docInfo.name} 
            <img className="w-5" src={assets.verified_icon} alt="" />
          </p>

          <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
            <p>{ docInfo.degree } - { docInfo.speciality }</p>
            <button className="py-0.5 px-2 border text-xs rounded-full">{ docInfo.experience }</button>
          </div>

          {/* add an about section */}
          <div>
            <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
              About <img src={assets.info_icon} alt="" />
            </p>
            <p className="text-sm text-gray-500 max-w-[700px] mt-1">
              {docInfo.about}
            </p>
          </div>

          <p className="text-gray-500 max-w-[700px] mt-1">
            Appointment fee: <span className="text-gray-600">{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>
      {/* booking slots */}
      <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
        <p>Booking Slots</p>
        <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
          {
            docSlots.length && docSlots.map((item, ind) => (
              <div onClick={() => setSlotIndex(ind)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === ind ? 'bg-primary text-white' : 'border border-gray-200'}`} key={ind}>
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            ))
          }
        </div>
        <div className="flex items-center gap-3 w-full overflow-x-auto scrollbar-hide mt-4">
          {docSlots.length && docSlots[slotIndex].map((item, ind)=>(
            <p onClick={() => setSlotTime(item.time)} className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300'}`} key={ind}>
              {item.time.toLowerCase()}
            </p>
          ))}
        </div>
        <button onClick={bookAppointment} className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6 hover:cursor-pointer hover:scale-105 transition-all cursor-pointer">Book an appointment</button>
      </div>
      {/* list related doctors */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  )
}

export default Appointment
