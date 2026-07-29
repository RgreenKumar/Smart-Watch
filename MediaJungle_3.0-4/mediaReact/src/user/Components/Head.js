import React, { useEffect, useState } from 'react'
import API_URL from '../../Config';

const Head = ({title}) => {
  const [contactUsData, setcontactUsData] = useState({
    aboutUsHeaderScript: '',
    aboutUsBodyScript: '',
    featureBox1HeaderScript: '',
    featureBox1BodyScript: '',
    featureBox2HeaderScript: '',
    featureBox2BodyScript: '',
    aboutUsImage:'null',
    contactUsEmail: '',
    contactUsBodyScript: '',
    callUsPhoneNumber: '',
    callUsBodyScript: '',
    locationMapUrl: '',
    locationAddress: '',
    contactUsImage: null, // Handle file upload
    appUrlPlaystore: '',
    appUrlAppStore: '',
    copyrightInfo: '',// default image URL
  });
  console.log(contactUsData);
  useEffect(() => {
    const fetchContactUsData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v2/footer-settings`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data); // Log the data to check its structure
        setcontactUsData({
          aboutUsHeaderScript: data.aboutUsHeaderScript || '',
          aboutUsBodyScript: data.aboutUsBodyScript || '',
          featureBox1HeaderScript: data.featureBox1HeaderScript || '',
          featureBox1BodyScript: data.featureBox1BodyScript || '',
          featureBox2HeaderScript: data.featureBox2HeaderScript || '',
          featureBox2BodyScript: data.featureBox2BodyScript || '',
          aboutUsImage: data.aboutUsImage || 'default_image_url', // Provide a default
          contactUsEmail: data.contactUsEmail || '',
          contactUsBodyScript: data.contactUsBodyScript || '',
          callUsPhoneNumber: data.callUsPhoneNumber || '',
          callUsBodyScript: data.callUsBodyScript || '',
          locationMapUrl: data.locationMapUrl || '',
          locationAddress: data.locationAddress || '',
          contactUsImage: data.contactUsImage || null, 
          appUrlPlaystore: data.appUrlPlaystore || '',
          appUrlAppStore: data.appUrlAppStore || '',
          copyrightInfo: data.copyrightInfo || '',
        });
      } catch (error) {
        console.error('Error fetching contact Us data:', error);
    throw error;

      }
    };
  
    fetchContactUsData();
  }, []);
  
  return (
    <div className='w-full bg-deepGray lg:h-64 h-40 relative overflow-hidden rounded-md'>
        <img 
         src={`data:image/png;base64,${contactUsData.contactUsImage}`} 
        className='w-full h-full object-cover' 
        alt='aboutus' 
        />
        <div className='absolute lg:top-24 top-16 w-full flex-colo'>
            <h1 className='text-2xl lg:text-h1 text-white text-center font-bold'>
                {title && title}
            </h1>
        </div>
    </div>
  )
}

export default Head