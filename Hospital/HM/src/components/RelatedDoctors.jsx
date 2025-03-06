import { useContext, useState, useEffect } from "react"
import { AppContext } from "../context/AppContext"
import { useNavigate } from "react-router-dom"


function RelatedDoctors({speciality, docId}) {

    const { doctors } = useContext(AppContext)
    const navigate = useNavigate()

    const [relDoc, setRelDoc] = useState([])

    useEffect(()=>{
        if(doctors.length > 0 && speciality){
            const doctorsData = doctors.filter((doc) => doc.speciality === speciality && doc._id !== docId)
            setRelDoc(doctorsData)
        }
    },[doctors, speciality, docId])

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h1 className="text-3xl font-medium">Top Doctors to Book</h1>
      <p className="sm:w-1/3 text-center text-sm">Simply browse through our extensive list or trust doctors.</p>
      <div className="w-full grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))]  gap-4 pt-5 gap-y-6 px-3 sm:px-0">
        {
          relDoc.slice(0,5).map((doc, idx)=>(
              <div onClick={() =>{scrollTo(0,0), navigate(`/appointment/${doc._id}`)}} className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500 " key={idx}>
                  <img className="bg-blue-50" src={doc.image} alt="" />
                  <div className="p-4">
                    <div className={`flex items-center gap-2 text-sm text-center ${doc.available ? 'text-green-500' : 'text-gray-500'} `}>
                      <p className={`w-2 h-2 ${doc.available ? 'bg-green-500' : 'bg-gray-500'}  rounded-full inline-block`}></p><p>{doc.available ? 'Available' : 'Unavailable'}</p>
                    </div>
                      <p className="text-gray-900 text-lg font-medium">{doc.name}</p>
                      <p className="text-gray-600 text-sm">{doc.speciality}</p>
                  </div>
              </div>
          ))
        }
      </div>
      <button onClick={()=>{ navigate('/doctors'); scrollTo(0,0) }} className="bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10 hover:scale-105 transition-all cursor-pointer">more</button>
    </div>
  )
}

export default RelatedDoctors
