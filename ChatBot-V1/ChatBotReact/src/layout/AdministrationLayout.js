import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CCard,
  CCardBody,
  CCol,
  CRow,
  CButton,
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTableColumns,
  faSliders,
  faGear,
  faUserGear,
  faCommentAlt,
  faImage,
} from '@fortawesome/free-solid-svg-icons';

// Component Views
import WidgetBody from '../views/property/widgets/WidgetBody';
import ChatWidget from '../views/property/widgets/ChatWidget';
import Members from '../views/UserManagement/PropertyMembers/Members';
import Departments from '../views/UserManagement/Departments/Departments';
import WidgetContent from '../views/property/widgets/WidgetContent';
import Trigger from '../views/Settings/Trigger';

const AdministrationLayout = () => {
  const { section } = useParams();
  const navigate = useNavigate();

  const sectionToTab = {
    'overview': 'Overview',
    'chat-widget': 'Chat Widget',
    'widget-content': 'Widget Content',
    'Trigger':'Trigger',
    'property-members': 'Property Members',
    'departments': 'Departments',
  };

  const [activeTab, setActiveTab] = useState(sectionToTab[section] || 'Overview');
  const [isChannelsOpen, setIsChannelsOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isSettingOpen,setIsSettingOpen] = useState(false);
  

  useEffect(() => {
    const currentTab = sectionToTab[section] || 'Overview';
    setActiveTab(currentTab);
  
    // Open the "User Management" section if the tab is related
    if (currentTab === 'Property Members' || currentTab === 'Departments') {
      setIsUserManagementOpen(true);
    } else {
      setIsUserManagementOpen(false);
    }
  
    // Optionally auto-open "Channels" if needed:
    if (currentTab === 'Chat Widget' || currentTab === 'Widget Content') {
      setIsChannelsOpen(true);
    } else {
      setIsChannelsOpen(false);
    }

    // Optionally auto-open "Channels" if needed:
    if (currentTab === 'Trigger') {
      setIsSettingOpen(true);
    } else {
      setIsSettingOpen(false);
    }
  
  }, [section]);
  

  const handleTabClick = (tabKey) => {
    const entry = Object.entries(sectionToTab).find(([k, v]) => v === tabKey);
    if (entry) {
      navigate(`/administration/${entry[0]}`);
    }
  };

  const renderComponent = () => {
    switch (activeTab) {
      case 'Overview': return <WidgetBody />;
      case 'Chat Widget': return <ChatWidget />;
      case 'Widget Content': return <WidgetContent />;
      case 'Trigger': return <Trigger key={section}/>;
      case 'Property Members': return  <Members key={section} />;;
      case 'Departments': return <Departments key={section}/>;
      default: return <div>Select a section</div>;
    }
  };

  const getButtonColor = (tab) => (activeTab === tab ? 'light' : '');

  

  return (
    <CCard className="mb-2" style={{ height: '600px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <CCardBody className="p-0">
        <CRow className="g-0" style={{ height: '100%' }}>
          <CCol sm={3} md={2} className="border-end" style={{ height: '100%', overflowY: 'auto' }}>
            <div>
              <h6 className="fw-bold mb-3   large p-3">Administration</h6>
              <CButton color={getButtonColor('Overview')} className="w-100 text-start mb-2 py-2 px-4 small " onClick={() => handleTabClick('Overview')}>
                <FontAwesomeIcon icon={faTableColumns} className="me-2 opacity-75 opacity-75" /> Overview
              </CButton>
              <CButton className="w-100 text-start mb-1 py-2 px-4 small" onClick={() => setIsChannelsOpen(!isChannelsOpen)}>
                <FontAwesomeIcon icon={faSliders} className="me-2 opacity-75" /> Channels
                <span className="float-end">{isChannelsOpen ? '˅' : '›'}</span>
              </CButton>
              {isChannelsOpen && (
                <div>
                  <CButton color={getButtonColor('Chat Widget')} className="text-dark text-start w-100 py-2 px-4 mb-1 small " onClick={() => handleTabClick('Chat Widget')}>
                    <FontAwesomeIcon icon={faCommentAlt} className="me-2 opacity-75" /> Chat Widget
                  </CButton>
                  <CButton color={getButtonColor('Widget Content')} className="text-dark text-start w-100 py-2 px-4 mb-1 small " onClick={() => handleTabClick('Widget Content')}>
                    <FontAwesomeIcon icon={faImage} className="me-2 opacity-75" /> Widget Content
                  </CButton>
                </div>
              )}
              <CButton color={getButtonColor('Settings')} className="w-100 text-start mb-2 py-2 px-4 small " onClick={() => setIsSettingOpen(!isSettingOpen)}>
                <FontAwesomeIcon icon={faGear} className="me-2 opacity-75" /> Settings
                <span className="float-end">{isSettingOpen ? '˅' : '›'}</span>
              </CButton>
              {isSettingOpen && (
                <div>
                  <CButton color={getButtonColor('Trigger')} className="text-dark text-start w-100 py-2 px-4 mb-1 small " onClick={() => handleTabClick('Trigger')}>
                    <FontAwesomeIcon icon={faCommentAlt} className="me-2 opacity-75" /> Trigger
                  </CButton>
                </div>
              )}
              <CButton className="w-100 text-start mb-1 py-2 px-4 small " onClick={() => setIsUserManagementOpen(!isUserManagementOpen)}>
                <FontAwesomeIcon icon={faUserGear} className="me-2 opacity-75" /> User Management
                <span className="float-end">{isUserManagementOpen ? '˅' : '›'}</span>
              </CButton>
              {isUserManagementOpen && (
                <div >
                  <CButton color={getButtonColor('Property Members')} className="text-dark text-start w-100 py-2 px-4 mb-1 small " onClick={() => handleTabClick('Property Members')}>
                    <FontAwesomeIcon icon={faCommentAlt} className="me-2 opacity-75" /> Property Members
                  </CButton>
                  <CButton color={getButtonColor('Departments')} className="text-dark text-start w-100 py-2 px-4 mb-1 small " onClick={() => handleTabClick('Departments')}>
                    <FontAwesomeIcon icon={faImage} className="me-2 opacity-75" /> Departments
                  </CButton>
                </div>
              )}
            </div>
          </CCol>

          <CCol md={10} style={{ height: '100%', backgroundColor: '#F3F4F7', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
              {renderComponent()}
            </div>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
};

export default AdministrationLayout;

