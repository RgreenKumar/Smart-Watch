import React, { useEffect, useState } from 'react'
import Layout from '../Layout/Layout'
import Head from '../Components/Head'
import { FaEnvelope, FaMapMarker, FaPhone } from 'react-icons/fa'
import API_URL from '../../Config'; // FIX: Use API_URL from config instead of hardcoded localhost

const ContactUs = () => {
  const [contactUsData, setContactUsData] = useState({
    contactUsEmail: '',
    contactUsBodyScript: '',
    callUsPhoneNumber: '',
    callUsBodyScript: '',
    locationMapUrl: '',
    locationAddress: '',
  });

  useEffect(() => {
    const fetchContactUsData = async () => {
      try {
        // FIX: Was hardcoded to http://localhost:8080 — now uses API_URL from config
        const response = await fetch(`${API_URL}/api/v2/footer-settings`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setContactUsData({
          contactUsEmail: data.contactUsEmail || '',
          contactUsBodyScript: data.contactUsBodyScript || '',
          callUsPhoneNumber: data.callUsPhoneNumber || '',
          callUsBodyScript: data.callUsBodyScript || '',
          locationMapUrl: data.locationMapUrl || '',
          locationAddress: data.locationAddress || '',
        });
      } catch (error) {
        // FIX: Log error instead of re-throwing to prevent unhandled promise rejection crash
        console.error('Error fetching Contact Us data:', error);
      }
    };

    fetchContactUsData();
  }, []);

  return (
    <Layout>
      <div className='min-height-screen container mx-auto px-2 my-6'>
        <Head title="Contact Us" />
        <div
          className='grid mg:grid-cols-2 gap-10 lg:my-20 my-10 lg:grid-cols-3 xl:gap-8'
          style={{ width: '100%' }}
        >
          {/* Email Card */}
          <div className='border border-border flex-colo p-10 bg-dry rounded-lg text-center'>
            <span className='flex-colo w-20 h-20 mb-4 rounded-full bg-main text-subMain text-2xl'>
              <div style={{ color: '#FFAA1D' }}><FaEnvelope /></div>
            </span>
            <h4 className='text-xl font-semibold mb-2'>Email Us</h4>
            <h6 className='text-xl font-semibold mb-2'>{contactUsData.contactUsEmail}</h6>
            <p className='mb-0 text-sm text-text leading-7'>
              {contactUsData.contactUsBodyScript}
            </p>
          </div>

          {/* Call Us Card */}
          <div className='border border-border flex-colo p-10 bg-dry rounded-lg text-center'>
            <span className='flex-colo w-20 h-20 mb-4 rounded-full bg-main text-subMain text-2xl'>
              <div style={{ color: '#FFAA1D' }}><FaPhone /></div>
            </span>
            <h4 className='text-xl font-semibold mb-2'>Call Us</h4>
            <h6 className='text-xl font-semibold mb-2'>{contactUsData.callUsPhoneNumber}</h6>
            <p className='mb-0 text-sm text-text leading-7'>
              {contactUsData.callUsBodyScript}
            </p>
          </div>

          {/* Location Card */}
          <div className='border border-border flex-colo p-10 bg-dry rounded-lg text-center'>
            <span className='flex-colo w-20 h-20 mb-4 rounded-full bg-main text-subMain text-2xl'>
              <div style={{ color: '#FFAA1D' }}><FaMapMarker /></div>
            </span>
            <h4 className='text-xl font-semibold mb-2'>Location</h4>
            <h6 className='text-xl font-semibold mb-2'>{contactUsData.locationAddress}</h6>
            {/* FIX: Was duplicating locationAddress in both h6 and p — now p shows a map link if available */}
            {contactUsData.locationMapUrl ? (
              <p className='mb-0 text-sm text-text leading-7'>
                <a
                  href={contactUsData.locationMapUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{ color: '#FFAA1D' }}
                >
                  View on Map
                </a>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactUs;