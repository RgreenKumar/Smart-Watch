import React from "react";
import { BsFillGridFill } from "react-icons/bs";
import { FaHeart, FaListAlt, FaUsers } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import { HiViewGridAdd } from 'react-icons/hi';
import { RiLockPasswordLine, RiMovie2Fill } from 'react-icons/ri';
import Layout from "../../Layout/Layout";
import { NavLink } from "react-router-dom";
const SideBar = ({children}) => {
    const SideLinks = [
        {
            name: "Dashboard",
            link: "/dashboard",
            icon: BsFillGridFill
        },
        {
            name: "Movies List",
            link: "/movieslist",
            icon: FaListAlt,
        },
        {
            name: "Add Movie",
            link: "/addmovie",
            icon: RiMovie2Fill,
        },
        {
            name: "Categories",
            link: "/categories",
            icon: HiViewGridAdd,
        },
        {
            name: "Users",
            link: "/users",
            icon: FaUsers,
        },
        {
            name: "Update Profile",
            link: "/profile",
            icon: FiSettings,
        },
        {
            name: "Favorite Movies",
            link: "/favorites",
            icon: FaHeart,
        },
        {
            name: "Change Password",
            link: "/password",
            icon: RiLockPasswordLine,
        },
        {
            name: "Site Settings",
            link: "/Site_Settings",
            icon: RiLockPasswordLine,
        },
        {
            name: "Video Settings",
            link: "/Video_Settings",
            icon: RiLockPasswordLine,
        },
        {
            name: "Social Settings",
            link: "/Social_Settings",
            icon: RiLockPasswordLine,
        },
        {
            name: "Payment Settings",
            link: "/Payment_Settings",
            icon: RiLockPasswordLine,
        },
        {
            name: "Email Settings",
            link: "/Email_Settings",
            icon: RiLockPasswordLine,
        },
        {
            name: "Company Site Url's",
            link: "/Company_Site_Url",
            icon: RiLockPasswordLine,
        },
        {
            name: "Banner Settings",
            link: "/Banner_Settings",
            icon: RiLockPasswordLine,
        },
        {
            name: "Footer Settings",
            link: "/Footer_Settings",
            icon: RiLockPasswordLine,
        },
        {
            name: "Contact Settings",
            link: "/Contact_Settings",
            icon: RiLockPasswordLine,
        },
        {
            name: "Other Settings",
            link: "/Other_Settings",
            icon: RiLockPasswordLine,
        },
    ];
    const active = "bg-dryGray text-subMain";
    const hover = "hover:text-white hover:bg-main";
    const inActive = "rounded font-medium text-sm transitions flex gap-3 items-center p-4";
    const Hover = ({ isActive }) => {
        return isActive ? `${active} ${inActive}` : `${inActive} ${hover}`;
    }
    
    return (
        <Layout>
            <div className="min-h-screen container mx-auto px-2">
                <div className="xl:grid grid-cols-8 gap-10 items-start md:py-12 py-6">
                    <div className="col-span-2 sticky bg-dry border border-gray-800 p-6 rounded-md xl:mb-0 mb-5">
                        {
                            //Sidebar Links
                            SideLinks.map((link, index) => (
                                <NavLink to={link.link} key={index} className={Hover}>
                                    <link.icon /> <p>{link.name}</p>
                                </NavLink>
                            ))
                        }
                    </div>
                    <div 
                    data-aos='fade-up'
                    data-aos-duration='1000'
                    data-aos-delay='10'
                    data-aos-offset='200'
                    className="col-span-6 rounded-md bg-dry border border-gray-800 p-6">
                        {children}
                    </div>
                </div>
            </div>
        </Layout>
    )
}
export default SideBar;