import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import baseUrl from "../../api/utils";

const TesttestScore = () => {
 
  const[batchId,setbatchId]=useState(null);
  const location=useLocation();
  const[batches,setbatches]=useState([{
    id:"",
    name:"",
    type:""
  }])
  const [testScore, settestScore] = useState([
    {
      courseName: "",
      courseId: "",
      testName: "",
      testId: "",
      testDate: "",
      nthAttempt: "",
      percentage: "",
      status: "",
    },
  ]);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsperpage = 10;
  const [datacounts, setdatacounts] = useState({
    start: "",
    end: "",
    total: "",
  });
  const [percentage, setpercentage] = useState(0);
  const fetchBatches = async () => {
    try {
      const email=sessionStorage.getItem("email")
      const response = await axios.get(`${baseUrl}/view/batch/${email}`, {
        headers: {
          Authorization: token,
        }
      });
      if (response?.status == 200) {
       setbatches(response.data)
       if (response.data.length > 0) {
        setbatchId(response.data[0].id);
        fetTestHistory(currentPage);
      }
      }
    } catch (err) {
      console.log(err);
    }
  };
  const fetTestHistory = async (page = 0) => {
    if(!batchId){
      return
    }
    try {
      const response = await axios.get(`${baseUrl}/get/TestHistory/${batchId}`, {
        headers: {
          Authorization: token,
        },
        params: { pageNumber: page, pageSize: itemsperpage },
      });
      if (response?.status == 200) {
        const data = response?.data?.test;
        settestScore(data?.content); // Update users with content from pageable
        setTotalPages(data?.totalPages);
        setpercentage(response?.data?.percentage);
        setdatacounts((prev) => ({
          start: currentPage * itemsperpage + 1,
          end: currentPage * itemsperpage + itemsperpage,
          total: data?.totalElements,
        }));
      }
      console.log(response?.data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchBatches();
  
  }, [location]);
useEffect(()=>{
  fetTestHistory(currentPage);
},[currentPage,batchId,location])
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
      <div className="page-header"></div>
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
              <div className="tableheader2 ">
                <h4>Test History</h4>
                <select  className="selectstyle btn btn-success text-left has-ripple "
                 value={batchId} onChange={(e) => setbatchId(Number(e.target.value))}>
        {batches.map((batch) => (
          <option className="bg-light text-dark " key={batch.id} value={batch.id}>
            {batch.name}
          </option>
        ))}
      </select>
              </div>
            </div>
            <div className="card-body">
              <div className="table-container">
                <table className="table table-hover table-bordered table-sm">
                  <thead className="thead-dark">
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">course Name</th>
                      <th scope="col">Test Name</th>
                      <th scope="col"> Attempt</th>
                      <th scope="col"> Submitted at</th>
                      <th scope="col">Test Score</th>
                      <th scope="col">Type</th>
                      <th scope="col"> Status </th>
                    </tr>
                  </thead>
                  <tbody>
                    {testScore?.map((item, index) => (
                      <tr key={index} className="pointer" >
                        <th> {index + 1}</th>
                        <td className="py-2"> {item?.courseName}</td>

                        <td className="py-2">{item.testName}</td>
                        <td className="py-2"> {item?.nthAttempt}</td>
                        <td className="py-2">
                        {item?.testDate && item.status !== "NOT ATTEMPTED"
  ? new Date(item.testDate).toLocaleDateString()
  : "N/A"}

                        </td>

                        <td className="py-2"> {item?.percentage}</td>
                        <td className="py-2">{item?.type=="TEST"? "Test":"Module Test" }</td>
                        <td className="py-2"> {item?.status}</td>
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
                    {datacounts.start + testScore.length - 1}) of{" "}
                    {datacounts.total}
                  </label>
                </div>
              </div>
              <h5 className="text-right">
                <label className="text-primary">
                  Total Percentage : {percentage}%
                </label>
              </h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TesttestScore;
