import { assets } from "../assets/assets"


const Footer = () => {
  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        {/* left */}
        <div>
            <img className="mb-5 w-40" src={assets.logo} alt="" />
            <p className="w-full md:w-2/3 text-gray-600 leading-6">Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, cupiditate eaque. Distinctio quaerat, illum mollitia dolor ullam non sunt cupiditate possimus dignissimos molestias illo repellat sapiente provident, laboriosam atque explicabo.</p>
        </div>
        {/* center */}
        <div>
            <p className="text-xl font-medium mb-5">COMPANY</p>
            <ul className="flex flex-col gap-2 text-gray-600">
                <li>Home</li>
                <li>About Us</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
            </ul>
        </div>
        {/* right */}
        <div>
            <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
            <ul className="flex flex-col gap-2 text-gray-600">
                <li>+91-887-793-9393</li>
                <li>kisalaykomal2767@gmail.com</li>
            </ul>
        </div>
      </div>
      {/* lower footer section */}
      <div>
        <hr />
        <p className="py-5 text-sm text-center">Copyright 2025&copy; Prescripto - All Rights Reserved.</p>
      </div>
    </div>
  )
}

export default Footer
