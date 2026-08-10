import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import {
  CContainer,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilContrast,
  cilMoon,
  cilSun,
  cilMenu,
  cilAccountLogout,
  cilUser,
} from '@coreui/icons'
import VITE_API_URL from '../Config';

const AppHeader = () => {
  const headerRef = useRef()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const adminname = sessionStorage.getItem("name")
  const [imageUrl, setImageUrl] = useState(null)

  // ✅ Fetch profile image from backend
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const token = sessionStorage.getItem("token")
        const res = await fetch(`${VITE_API_URL}/api/profiles/image`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        if (res.ok) {
          const blob = await res.blob()
          const url = URL.createObjectURL(blob)
          setImageUrl(url)
        } else {
          setImageUrl(null)
        }
      } catch (err) {
        console.error("Image fetch error:", err)
        setImageUrl(null)
      }
    }

    fetchImage()
  }, [])

  // ✅ Scroll shadow effect
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        headerRef.current.classList.toggle(
          'shadow-sm',
          document.documentElement.scrollTop > 0
        )
      }
    }
    document.addEventListener('scroll', handleScroll)
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

  // ✅ Logout FIXED
  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${VITE_API_URL}/chatbot/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        sessionStorage.clear()
        localStorage.clear()
        navigate("/login")
      } else {
        toast.error("Logout failed. Please try again.")
      }
    } catch (err) {
      toast.error("Something went wrong.")
    }
  }

  return (
    <CHeader position="sticky" className="mb-2 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>

        {/* Sidebar Toggle */}
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        {/* Navigation */}
        <CHeaderNav className="d-none d-md-flex">
          <CNavItem>
            <CNavLink to="/dashboard" as={NavLink}>
              Dashboard
            </CNavLink>
          </CNavItem>
        </CHeaderNav>

        {/* Notifications */}
        <CHeaderNav className="ms-auto">
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilBell} size="lg" />
            </CNavLink>
          </CNavItem>
        </CHeaderNav>

        {/* Theme Toggle */}
        <CHeaderNav>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>

          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false}>
              {colorMode === 'dark' ? (
                <CIcon icon={cilMoon} size="lg" />
              ) : colorMode === 'auto' ? (
                <CIcon icon={cilContrast} size="lg" />
              ) : (
                <CIcon icon={cilSun} size="lg" />
              )}
            </CDropdownToggle>

            <CDropdownMenu>
              <CDropdownItem onClick={() => setColorMode('light')}>
                <CIcon className="me-2" icon={cilSun} /> Light
              </CDropdownItem>
              <CDropdownItem onClick={() => setColorMode('dark')}>
                <CIcon className="me-2" icon={cilMoon} /> Dark
              </CDropdownItem>
              <CDropdownItem onClick={() => setColorMode('auto')}>
                <CIcon className="me-2" icon={cilContrast} /> Auto
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>

          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>

          {/* Profile Dropdown */}
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false} className="d-flex align-items-center">

              {/* ✅ PROFILE IMAGE */}
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="profile"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginRight: '8px',
                  }}
                />
              ) : (
                <CIcon icon={cilUser} size="lg" className="me-2" />
              )}

              <span className="ms-2">{adminname || 'Admin'}</span>
            </CDropdownToggle>

            <CDropdownMenu>
              <CDropdownItem onClick={() => navigate("/profile")}>
                <CIcon className="me-2" icon={cilUser} /> Profile
              </CDropdownItem>
              <CDropdownItem onClick={handleLogout}>
                <CIcon className="me-2" icon={cilAccountLogout} /> Logout
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>

        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader