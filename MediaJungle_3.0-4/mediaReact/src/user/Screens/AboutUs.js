// import React from 'react'
// import Layout from '../Layout/Layout'
// import Head from '../Components/Head'

// const AboutUs = () => {
//   return (
//     <Layout className='container mx-auto min-h-screen  overflow-y-auto'>
//       <div className='px-2 my-6  '>
//         <Head title="About Us" />
//         <div className='xl:py-20 py-10 px-4'>
//           <div className='grid grid-flow-row xl:grid-cols-2 gap-4 xl:gap-16 items-center'>
//             <div>
//               <h3 className='text-xl lg:text-3xl mb-4 font-semibold'>
//                 Welcome to our New10Media Website
//               </h3>
//               <div className='mt-3 text-sm leading-8 text-text'>
//                 <p>
//                   It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
//                 </p>
//                 <p>
//                   It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.
//                 </p>
//               </div>
//               <div className='grid md:grid-cols-2 gap-6 mt-8'>
//                 <div className=' bg-dry rounded-lg'>
//                   <span className='text-3xl block font-extrabold mt-4'>
//                     10K
//                   </span>
//                   <h4 className='text-lg font-semibold my-2'>Listed Movies</h4>
//                   <p className='mb-0 text-text leading-7 text-sm'>
//                     Lorem Ipsum is simply dummy text of the printing and typesetting industry.
//                   </p>
//                 </div>
//                 <div className='bg-dry rounded-lg'>
//                   <span className='text-3xl block font-extrabold mt-4'>
//                     8K
//                   </span>
//                   <h4 className='text-lg font-semibold my-2'>Lovely Users</h4>
//                   <p className='mb-0 text-text leading-7 text-sm'>
//                     Completely Free without Registration
//                   </p>
//                 </div>
//               </div>
//             </div>
//             <div className='mt-10 lg:mt-0  '>
//               <img
//                 src='/images/aboutus.png'
//                 alt='aboutus'
//                 className='w-full xl:block hidden h-header rounded-lg object-cover '
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   )
// }

// export default AboutUs

import React, { useEffect, useState } from 'react'
import Layout from '../Layout/Layout'
import Head from '../Components/Head'
import API_URL from '../../Config';

const AboutUs = () => {
  const [aboutUsData, setAboutUsData] = useState({
    aboutUsHeaderScript: '',
    aboutUsBodyScript: '',
    featureBox1HeaderScript: '',
    featureBox1BodyScript: '',
    featureBox2HeaderScript: '',
    featureBox2BodyScript: '',
    aboutUsImage: '', // Will store Base64 string
    contactUsEmail: '',
    contactUsBodyScript: '',
    callUsPhoneNumber: '',
    callUsBodyScript: '',
    locationMapUrl: '',
    locationAddress: '',
    contactUsImage: '', // Will store Base64 string
    appUrlPlaystore: '',
    appUrlAppStore: '',
    copyrightInfo: '',
  });
  console.log(aboutUsData);
  useEffect(() => {
    const fetchAboutUsData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v2/footer-settings`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data); // Log the data to check its structure

        // // Convert image byte arrays to Base64 (if they exist)
        // const convertToBase64 = (bytes) => {
        //   if (bytes) {
        //     const binary = new Uint8Array(bytes);
        //     const base64 = btoa(String.fromCharCode(...binary)); // Convert binary data to Base64
        //     console.log("Converted Base64 Image: ", base64);
        //     return `data:image/png;base64,${base64}`; // Use appropriate image type (png, jpg, etc.)
        //   }
        //   return 'default_image_url'; // Return default image if no data
        // };

        setAboutUsData({
          aboutUsHeaderScript: data.aboutUsHeaderScript || '',
          aboutUsBodyScript: data.aboutUsBodyScript || '',
          featureBox1HeaderScript: data.featureBox1HeaderScript || '',
          featureBox1BodyScript: data.featureBox1BodyScript || '',
          featureBox2HeaderScript: data.featureBox2HeaderScript || '',
          featureBox2BodyScript: data.featureBox2BodyScript || '',
          aboutUsImage: data.aboutUsImage|| 'default_image_url', // Convert or fallback
          contactUsEmail: data.contactUsEmail || '',
          contactUsBodyScript: data.contactUsBodyScript || '',
          callUsPhoneNumber: data.callUsPhoneNumber || '',
          callUsBodyScript: data.callUsBodyScript || '',
          locationMapUrl: data.locationMapUrl || '',
          locationAddress: data.locationAddress || '',
          contactUsImage: data.contactUsImage || null, // Convert or fallback
          appUrlPlaystore: data.appUrlPlaystore || '',
          appUrlAppStore: data.appUrlAppStore || '',
          copyrightInfo: data.copyrightInfo || '',
        });
      } catch (error) {
        console.error('Error fetching About Us data:', error);
    throw error;

      }
    };

    fetchAboutUsData();
  }, []);
  
  return (
    <Layout className='min-height-screen container mx-auto'>
      <div className=' px-2 my-6'>
        <Head title="About Us" />
        <div className='xl:py-20 py-10 px-4'>
          <div className='grid grid-flow-row xl:grid-cols-2 gap-4 xl:gap-16 items-center'>
            <div>
              <h3 className='text-xl lg:text-3xl mb-4 font-semibold'>
               {aboutUsData.aboutUsHeaderScript}
              </h3>
              <div className='mt-3 text-sm leading-8 text-text'>
                <p>
{aboutUsData.aboutUsBodyScript}             
   </p>
              </div>
              <div className='grid md:grid-cols-2 gap-6 mt-8' style={{width:'100%'}}>
                <div className='p-8 bg-dry rounded-lg'>
                  <span className='text-3xl block font-extrabold mt-4'>
                  {aboutUsData.featureBox1HeaderScript}
                  </span>
                  
                  <p className='mb-0 text-text leading-7 text-sm'>
                    {aboutUsData.featureBox1BodyScript}
                  </p>
                </div>
                <div className='p-8 bg-dry rounded-lg'>
                  <span className='text-3xl block font-extrabold mt-4'>
                   {aboutUsData.featureBox2HeaderScript}
                  </span>
                 
                  <p className='mb-0 text-text leading-7 text-sm'>
                    {aboutUsData.featureBox2BodyScript}
                  </p>
                </div>
              </div>
            </div>
            <div className='mt-10 lg:mt-0'>
            <img
src={`data:image/png;base64,${aboutUsData.aboutUsImage}`}
                  alt="About Us"
                  className='w-full xl:block hidden h-header rounded-lg object-cover'
                />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AboutUs