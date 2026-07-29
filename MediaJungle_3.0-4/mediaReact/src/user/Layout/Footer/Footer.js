import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../../../Config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faYoutube, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';

function Footer() {
  const [getall, setGetAll] = useState([]);
  const [contact, setContact] = useState([]);
  const [socialLinks, setSocialLinks] = useState({
    fbUrl: '',
    xUrl: '',
    youtubeUrl: '',
    linkedinUrl: ''
  });

  // Fetch site settings
  useEffect(() => {
    fetch(`${API_URL}/api/v2/GetsiteSettings`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setGetAll(data);
      })
      .catch(error => {
        console.error('Error fetching site settings:', error);
      });
  }, []);

  // Fetch social settings
  useEffect(() => {
    fetch(`${API_URL}/api/v2/social-settings`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const socialData = data[0];
          setSocialLinks({
            fbUrl: socialData.fbUrl || '',
            xUrl: socialData.xurl || '',
            youtubeUrl: socialData.youtubeUrl || '',
            linkedinUrl: socialData.linkedinUrl || ''
          });
        }
      })
      .catch(error => {
        console.error('Error fetching social settings:', error);
      });
  }, []);

  // Fetch contact settings
  useEffect(() => {
    fetch(`${API_URL}/api/v2/GetcontactSettings`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setContact(data);
      })
      .catch(error => {
        console.error('Error fetching contact settings:', error);
      });
  }, []);

  // ✅ FIX: Corrected route links to match App.js routes exactly
  // Movies → '/'  (the root route renders MoviesPage)
  // Music  → '/AudioHomescreen'  (matches the route casing in App.js)
  const Links = [
    {
      title: 'Company',
      links: [
        { name: 'Movies', link: '/' },
        { name: 'Music', link: '/AudioHomescreen' },
        { name: 'About Us', link: '/AboutUs' },
        { name: 'Contact-Us', link: '/Contactus' }
      ]
    },
    {
      title: 'My Account',
      links: [
        { name: 'Profile', link: '/UserProfileScreen' },
        { name: 'Privacy Policy', link: '/PrivacyPolicy' }
      ]
    }
  ];

  return (
    <div className="bg-dry py-3 border-t-2 border-black">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 xl:grid-cols-12 gap-5 sm:gap-9 lg:gap-11 xl:gap-7 py-10 justify-between" style={{ margin: '0 30px' }}>
        {Links.map((link, index) => (
          <div key={index} className="col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-3 pb-3.5 sm:pb-0 sm:text-left">
            <h3 className="text-lg lg:leading-7 font-bold mb-4 sm:mb-5 lg:mb-6 pb-0.5">{link.title}</h3>
            <ul className="text-sm flex flex-col space-y-3">
              {link.links.map((text, index) => (
                <li key={index} className="flex items-center sm:justify-start sm:text-center">
                  <Link to={text.link} className="text-border hover:text-subMain">
                    {text.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-3 text-center">
          {getall.length > 0 && getall[0].logo && (
            <Link to="/" className="flex justify-start">
              <img src={`data:image/png;base64,${getall[0].logo}`} alt="logo" className="w-1/2 h-25 mx-auto" />
            </Link>
          )}
          <div className="flex justify-center space-x-4 mt-4">
            {socialLinks.fbUrl && (
              <a href={socialLinks.fbUrl} target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faFacebookF} className="text-blue-600 text-2xl" />
              </a>
            )}
            {socialLinks.xUrl && (
              <a href={socialLinks.xUrl} target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faTwitter} className="text-blue-400 text-2xl" />
              </a>
            )}
            {socialLinks.youtubeUrl && (
              <a href={socialLinks.youtubeUrl} target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faYoutube} className="text-red-600 text-2xl" />
              </a>
            )}
            {socialLinks.linkedinUrl && (
              <a href={socialLinks.linkedinUrl} target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faLinkedinIn} className="text-blue-700 text-2xl" />
              </a>
            )}
          </div>

          {contact.length > 0 && (
            <p className="leading-7 text-sm text-border mt-3 text-center">
              <span>{contact[0].contact_address}</span><br />
              <span>{contact[0].contact_mobile}</span><br />
              <span>{contact[0].contact_email}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col mt-4 space-y-4 justify-center items-center sm:items-start">
          <a href="" target="_blank" className="w-full" rel="noopener noreferrer">
            <button className="text-white rounded w-full">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/512px-Google_Play_Store_badge_EN.svg.png"
                alt="Get it on Google Play"
                className="w-32 h-12 mx-auto lg:h-8 lg:w-full"
              />
            </button>
          </a>
          <a href="" target="_blank" className="w-full" rel="noopener noreferrer">
            <button className="text-white rounded w-full">
              <img
                src="https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us?releaseDate=1522022400"
                alt="Download on the App Store"
                className="w-32 h-12 mx-auto lg:h-8 lg:w-full"
              />
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Footer;