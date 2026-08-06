import React from 'react'
import { Link } from 'react-router-dom'

const QuizzInstruction = ({handleProceedClick,quizzName,noofQuestion,timeLeft}) => {
  return (
   <div className='card'>
               <div className="card-body">
          <div className="row">
          <div className="col-12">
                  <div className='div3'>
          
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <h4 style={{ textDecoration: "underline", margin: 0 }}>Quizz Instructions</h4>         <div className='full-Width'>
                                       <div className={`timer-container }`}>
    <p className="timer">
        <i className="fa-solid fa-stopwatch-20"></i> Duration: {timeLeft}
    </p>
    </div>
</div>
  </div>
  
                     <div className='instruction'>
                      <h2 style={{textAlign:"center"}}><i className="fa-solid fa-triangle-exclamation"></i></h2>
                      <h3 style={{textAlign:"center"}}>Notice</h3>
                      <p>
                          Welcome for the online Quizz of <b>{quizzName}</b>. Please Read the Following Information Carefully before Proceeding 
                      </p>
                      <h5 className='font-weight-bold' > Instruction :</h5>
                      <ul style={{ listStyleType: 'disc' }}>
                          <li>Ensure you have a stable internet connection throughout the duration of the Quizz.</li>
                          <li>Use a Desktop or Laptop with a compatiable browser (Google Chrome ,Mozila Firefox, Safari,or Microsoft Edge).</li>
                          <li>Disable any pop-up blockers and ensure JavaScript is enabled in your Browser Settings</li>
                      </ul>
                      <h5 className='font-weight-bold' >Quizz Environment :</h5>
                      <ul style={{ listStyleType: 'disc' }}>
                          <li>Find a Quiet and Comfortable envronment to take the Quizz.</li>
                          <li>Avoid distractions and interruptions during the Quizz duration.</li>
                          <li>Make sure your Surroundings are well-lighted and your Screen is easily readable.</li>
                      </ul >
                      <h5 className='font-weight-bold'>Quizz Format :</h5>
                      <ul style={{ listStyleType: 'disc' }}>
                          <li>The Quizz Consist of <b>{noofQuestion }</b> Multiple-choice Questions </li>
                          <li>This Quizz allows <b>One</b> attempt only.</li>
                          <li>Each Question carries one Mark </li>
                          <li>Read the Question Carefully and select your Answer</li>
                      </ul >
                      <h5 className='font-weight-bold'>Submission :</h5>
                      <ul style={{ listStyleType: 'disc' }}>
                          <li>Once you have answered all the questions, click on the "Submit" button to submit your test</li>
                          <li>you will not be able to make any changes after the test is submitted.</li>
                      </ul>
                       <p>By Proceeding ,you acknowledged that you have read and understand the instruction provided above</p>
                       <h5 className='font-weight-bold' style={{textAlign:"center"}}>Good Luck !</h5>
                     </div>
                     <div className='atbtndiv' >
                      <div>
                      <Link to={"/user/ProgramCalender"} className='btn btn-secondary'>cancel</Link>
                      </div><div>
  
                      </div>
                      <div>
                      <button onClick={handleProceedClick} className='btn btn-primary mr-3'>Proceed</button></div>
                      </div>

              </div>
              </div>
              </div>
              </div>
              </div>
  )
}

export default QuizzInstruction