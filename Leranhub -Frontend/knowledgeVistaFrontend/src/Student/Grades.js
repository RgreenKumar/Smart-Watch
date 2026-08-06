import axios from "axios";
import React, { useEffect, useState } from "react";
import baseUrl from "../api/utils";
import { useNavigate } from "react-router-dom";

const Grades = () => {
  const [grades, setgrades] = useState([
    {
      batchName: "",
      weightedTest: "",
      weightedQuiz: "",
      weightedAttendance: "",
      weightedAssignment: "",
      totalScore: "",
      result: "",
    },
  ]);
  const [weights, setWeights] = useState({
    passPercentage: "",
    testWeightage: "",
    quizzWeightage: "",
    attendanceWeightage: "",
    assignmentWeightage: "",
  });
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();
  const fetchGradeDetails = async () => {
    try {
      const response = await axios.get(`${baseUrl}/get/Grade`, {
        headers: {
          Authorization: token,
        },
      });
     if(Array.isArray(response?.data?.grades)){
      setgrades(response?.data?.grades);
      }
      setWeights(response?.data?.weight);
      console.log(response.data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchGradeDetails();
  }, []);
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
              <div className="tableheader ">
                <h4>Grades</h4>
              </div>
            </div>
            <div className="card-body">
              <div className="table-container">
                <table className="table table-hover table-bordered table-sm">
                  <thead className="thead-dark">
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Batch Name</th>
                      <th scope="col">Test Score({weights.testWeightage}%)</th>
                      <th scope="col">
                        {" "}
                        Quizz Score({weights.quizzWeightage}%)
                      </th>
                      <th scope="col">
                        {" "}
                        Attendance Score({weights.attendanceWeightage}%)
                      </th>
                      <th scope="col">
                        Assignmant Score({weights.assignmentWeightage}%)
                      </th>
                      <th scope="col">Total</th>
                      <th scope="col"> Result </th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades?.map((grade, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{grade.batchName}</td>
                        <td>{grade.weightedTest}</td>
                        <td>{grade.weightedQuiz}</td>
                        <td>{grade.weightedAttendance}</td>
                        <td>{grade.weightedAssignment}</td>
                        <td>{grade.totalScore}</td>
                        <td>{grade.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grades;
