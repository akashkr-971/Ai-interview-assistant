// ...existing code...
import Link from 'next/link'
import Image from 'next/image'

const footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 relative w-full bottom-0">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center justify-center">
              <Image src={"/logo.webp"} alt="Logo" width={50} height={50} className='rounded-full mr-2'></Image>
              <span className="text-lg font-semibold">RolePrep</span>
            </div>
            <p className="text-sm mt-2 text-center">
                Your one-stop solution for interview preparation.
                Empowering you to ace your interviews.
            </p>
          </div>
          <div>
            <h6 className="font-semibold mb-4 ">Quick Links</h6>
            <ul className="list-disc pl-10">
              <li className="mb-2">
                <Link href="/" className="hover:text-gray-300">Home</Link>
              </li>
              <li className="mb-2">
                <Link href="/profile" className="hover:text-gray-300">Profile</Link>
              </li>
              <li className="mb-2">
                <Link href="#interviews" className="hover:text-gray-300">Interviews</Link>
              </li>
            </ul>
          </div>

          <div>
            <h6 className="font-semibold mb-4">Contact</h6>
            <ul className="list-none ">
              <li className="mb-2">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                    <path  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                  123-456-7890
                </div>
              </li>
              <li className="mb-2">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                    <path  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                  Prepwise@example.com
                </div>
              </li>
              <li className="mb-2">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                    <path  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  123 Main St, City, Country
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                <path  d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>

                  <Link href="https://www.linkedin.com/in/yourprofile" className="hover:text-gray-300">LinkedIn</Link>
                </div>
              </li>
            </ul>
          </div>
        </div>
        {/* Copyright */}
        <div className="text-center mt-8">
          <p className="text-sm">&copy; {new Date().getFullYear()} RolePrep. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default footer