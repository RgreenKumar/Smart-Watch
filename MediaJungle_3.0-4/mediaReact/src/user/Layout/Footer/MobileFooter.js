import React, { useState } from 'react';
import { BsCollectionPlay, BsMusicNote } from 'react-icons/bs';
import { CgMenuBoxed, CgUser } from 'react-icons/cg';
import { FiUserCheck } from 'react-icons/fi';
import { Navigate, NavLink, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import API_URL from '../../../Config';

const MobileFooter = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem("token");

    // const handleProfile = () => {
    //     navigate('/UserProfileScreen');
    // };

    const handleLogout = async () => {
        try {
            const confirmLogout = await Swal.fire({
                title: "Are you sure?",
                text: "You are about to logout.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#FBC740",
                cancelButtonColor: "#FBC740",
                confirmButtonText: "Yes, logout",
                cancelButtonText: "Cancel",
            });

            if (confirmLogout.isConfirmed) {
                const response = await fetch(`${API_URL}/api/v2/logout`, {
                    method: "POST",
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    sessionStorage.clear();
                    localStorage.clear();
                   window.location.href = "/UserLogin";
                // } else {
                //     Swal.fire({
                //         icon: 'error',
                //         title: 'Logout failed',
                //         text: 'Please try again later.',
                //     }); 
                }
            }
        } catch (error) {
            // Swal.fire({
            //     icon: 'error',
            //     title: 'Error',
            //     text: 'An error occurred while logging out. Please try again later.',
            // });
    throw error;

        }
    };

    const active = "bg-black text-main";
    const inActive = "transitions text-2xl flex-colo hover:bg-black hover:text-main text-white rounded-md px-4 py-3";
    const Hover = ({ isActive }) =>
        isActive
            ? `transitions text-2xl flex-colo ${active} rounded-md px-4 py-3`
            : `transitions text-2xl flex-colo hover:bg-white hover:text-main text-white rounded-md px-4 py-3`;

    return (
        <>
            <div className='flex-btn h-full bg-white rounded cursor-pointer overflow-y-scroll flex-grow w-full'>
                <footer className='lg:hidden fixed z-50 bottom-0 w-full px-1'>
                    <div className='bg-dry rounded-md flex-btn w-full p-1'>
                        <NavLink to="/" className={Hover}>
                            <BsCollectionPlay />
                        </NavLink>
                        <NavLink to='/AudioHomeScreen' className={Hover}>
                            <BsMusicNote />
                        </NavLink>
                        {token ? (
                            <NavLink 
                            to="/UserProfileScreen" 
                            className={Hover}>
                            <CgUser className="w-6 h-6" />
                        </NavLink>
                        
                        ) : (
                            <NavLink to="/UserLogin" className={Hover}>
                                <FiUserCheck className="w-6 h-6 text-white" />
                            </NavLink>
                        )}
                       <NavLink to="/libraryScreen" className={Hover}>
    <CgMenuBoxed />
</NavLink>

                    </div>
                </footer>
            </div>
        </>
    );
};

export default MobileFooter;
