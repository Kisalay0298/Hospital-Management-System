import Banner from "../components/Banner"
import Header from "../components/Header"
import SpecialityMenue from "../components/SpecialityMenue"
import TopDoctors from "../components/topDoctors"

const Home = () => {
  return (
    <div>
      <Header />
      <SpecialityMenue/>
      <TopDoctors />
      <Banner />
    </div>
  )
}

export default Home
