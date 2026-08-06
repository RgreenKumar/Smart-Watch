import React, { useContext } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import baseUrl from "../api/utils";
import axios from "axios";
import { GlobalStateContext } from "../Context/GlobalStateProvider";
const StudentsBatch = () => {
  const { batchTitle, batchid } = useParams();
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);
  const token = sessionStorage.getItem("token");
  const userRole = sessionStorage.getItem("role");
  const { displayname } = useContext(GlobalStateContext);
  const [batchUsers, setbatchUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsperpage = 10;
  const [datacounts, setdatacounts] = useState({
    start: "",
    end: "",
    total: "",
  });
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [skills, setSkills] = useState("");
  const [fullsearch, setfullsearch] = useState(false);
  // Function to call the search API
  const searchbatchUsers = async () => {
    try {
      const response = await axios.get(`${baseUrl}/Batch/search/User`, {
        headers: {
          Authorization: token,
        },
        params: {
          batchId: batchid,
          username: encodeURIComponent(username),
          email: encodeURIComponent(email),
          phone: encodeURIComponent(phone),
          dob: encodeURIComponent(dob),
          skills: encodeURIComponent(skills),
          page: currentPage,
          size: 10,
        },
      });

      if (response.status === 200) {
        setbatchUsers(response.data.content);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching batchUsers:", error);
      throw error;
    }
  };

  // Function to handle changes and call search
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value === "") {
      fetchData();
    }
    switch (name) {
      case "username":
        setUsername(value);
        break;
      case "dob":
        setDob(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "phone":
        setPhone(value);
        break;

      case "skills":
        setSkills(value);
        break;

      default:
        break;
    }
  };
  useEffect(() => {
    // Call searchbatchUsers whenever any of the dependencies change
    searchbatchUsers();
  }, [username, email, phone, dob, skills, currentPage]);

  const fetchData = async (page = 0) => {
    try {
      // Fetch data from server
      const response = await axios.get(`${baseUrl}/Batch/getStudents`, {
        params: {
          id: batchid,
          pageNumber: page,
          pageSize: itemsperpage,
        },
        headers: {
          Authorization: token,
        },
      });
      const data = response.data;
      setbatchUsers(data.content);
      setTotalPages(data.totalPages);
      setdatacounts((prev) => ({
        start: currentPage * itemsperpage + 1,
        end: currentPage * itemsperpage + itemsperpage,
        total: data.totalElements,
      })); // Update total pages
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate("/unauthorized");
      } else {
        console.error("Error fetching data:", error);
        throw error;
      }
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, []);

  useEffect(() => {
    fetchData(currentPage); // Fetch data when the page or other dependencies change
  }, [currentPage, fullsearch]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    for (let i = 0; i < totalPages; i++) {
      buttons.push(
        <li
          className={`page-item ${i === currentPage ? "active" : ""}`}
          key={i}
        >
          <a className="page-link" href="#" onClick={() => handlePageChange(i)}>
            {i + 1}
          </a>
        </li>
      );
    }
    return buttons;
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-block">
          <div className="row align-items-center">
            <div className="col-md-12">
              <div className="page-header-title">
                <h5 className="m-b-10"> {displayname && displayname.student_name
                      ? displayname.student_name
                      : "Student"}
                    Details</h5>
              </div>
              <ul className="breadcrumb">
              <li className="breadcrumb-item">
                  <a
                    href="#"
                    onClick={()=>{navigate("/batch/viewall")}}
                    title="dashboard"
                  >
                     <i className="fa-solid fa-object-group"></i>
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a
                    href="#"
                    onClick={() => {
                      navigate(`/batch/viewcourse/${batchTitle}/${batchid}`);
                    }}
                  >
                    {batchTitle}
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#">
                    {displayname && displayname.student_name
                      ? displayname.student_name
                      : "Student"}
                    Details
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-header">
              <div className="navigateheaders">
                <div
                  onClick={() => {
                    navigate(-1);
                  }}
                >
                  <i className="fa-solid fa-arrow-left"></i>
                </div>
                <div></div>
                <div
                  onClick={() => {
                    navigate(-1);
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </div>
              </div>
              <div className="tableheader ">
                <h4>
                  {displayname && displayname.student_name
                    ? displayname.student_name
                    : "Student"}
                  Details
                </h4>
              </div>
            </div>
            <div className="card-body">
              <div className="table-container">
                <table className="table table-hover table-bordered table-sm">
                  <thead className="thead-dark">
                    <tr>
                      <th scope="col">
                        <i
                          onClick={() => {
                            if (fullsearch) {
                              // Reset all search states
                              setUsername("");
                              setEmail("");
                              setPhone("");
                              setDob("");
                              setSkills("");
                            }
                            setfullsearch(!fullsearch);
                          }}
                          className={
                            fullsearch
                              ? "fa-solid fa-xmark"
                              : "fa-solid fa-magnifying-glass"
                          }
                        ></i>
                      </th>
                      <th scope="col">Username</th>
                      <th scope="col">Email</th>
                      <th scope="col">Phone</th>
                      <th scope="col"> Skills</th>
                      <th scope="col">Date of Birth</th>
                    </tr>
                    {fullsearch ? (
                      <tr>
                        <td></td>
                        <td>
                          <input
                            type="search"
                            name="username"
                            value={username}
                            onChange={handleChange}
                            placeholder="Search Username"
                          />
                        </td>
                        <td>
                          <input
                            type="search"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            placeholder="Search Email"
                          />
                        </td>

                        <td>
                          <input
                            type="search"
                            name="phone"
                            value={phone}
                            onChange={handleChange}
                            placeholder="Search Phone"
                          />
                        </td>
                        <td>
                          <input
                            type="search"
                            name="skills"
                            value={skills}
                            onChange={handleChange}
                            placeholder="Search Skills"
                          />
                        </td>
                        <td>
                          <div style={{ width: "110px" }}></div>
                        </td>
                      </tr>
                    ) : (
                      <></>
                    )}
                  </thead>
                  <tbody>
                    {batchUsers?.map((user, index) => (
                      <tr key={user.userId}>
                        <th scope="row">
                          {currentPage * itemsperpage + (index + 1)}
                        </th>
                        <td className="py-2"> {user.username}</td>
                        <td className="py-2">
                          <Link
                            to={`/view/Student/Dashboard/${user.email}/${user.userId}/${batchid}/${batchTitle}`}
                            state={{ user }} // Pass user details in state
                          >
                            {user.email}
                          </Link>
                        </td>
                        <td className="py-2">{user.phone}</td>
                        <td className="py-2">{user.skills}</td>
                        <td className="py-2">{user.dob}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="cornerbtn">
                <ul className="pagination">
                  <li
                    className={`page-item ${
                      currentPage === 0 ? "disabled" : ""
                    }`}
                    key="prev"
                  >
                    <a
                      className="page-link"
                      href="#"
                      aria-label="Previous"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      <span aria-hidden="true">«</span>
                      <span className="sr-only">Previous</span>
                    </a>
                  </li>
                  {renderPaginationButtons()}
                  <li
                    className={`page-item ${
                      currentPage === totalPages - 1 ? "disabled" : ""
                    }`}
                    key="next"
                  >
                    <a
                      className="page-link"
                      href="#"
                      aria-label="Next"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      <span aria-hidden="true">»</span>
                      <span className="sr-only">Next</span>
                    </a>
                  </li>
                </ul>
                <div>
                  <label className="text-primary">
                    ( {datacounts.start}-{" "}
                    {datacounts.start + batchUsers?.length - 1}) of{" "}
                    {datacounts.total}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsBatch;
