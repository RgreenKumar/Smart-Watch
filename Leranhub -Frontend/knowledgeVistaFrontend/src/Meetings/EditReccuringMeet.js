import React, { useEffect, useState } from 'react'

const EditReccuringMeet = ({
    setReccuranceDescription,
  setzoomrequest,
  Reccuranceobject,
  setReccuranceobject,
  reccurance,
  setreccurance
}
) => {
      const [selectedOption, setSelectedOption] = useState("noEnd");
      const [repeatevery, setrepeatevery] = useState(1);
      const [occurson, setOccurson] = useState("day");
      const [occurancess, setoccurancess] = useState(1);
      const [monthlyOn, setmonthlyOn] = useState(1);
      const [EndDate, setEndDate] = useState(() => {
        const today = new Date();
        const sevenDaysLater = new Date(today);
        sevenDaysLater.setDate(today.getDate() + 6);
        return sevenDaysLater.toISOString().split("T")[0];
      });
      const [monthlyWeek, setmonthlyWeek] = useState("-1");
      const [monthlyWeekday, setmonthlyWeekday] = useState("2");
      const [monthlyoccurswhen, setmonthlyoccurswhen] = useState("Last");
      const [monthlyoccursday, setmonthlyoccursday] = useState("Monday");
      const [weekdays, setWeekdays] = useState(() => {
        return [
          {
            label: "Sun",
            value: "1",
            disabled: false,
            checked: false,
          },
          {
            label: "Mon",
            value: "2",
            disabled: false,
            checked: false,
          },
          {
            label: "Tue",
            value: "3",
            disabled: false,
            checked: false,
          },
          {
            label: "Wed",
            value: "4",
            disabled: false,
            checked: false,
          },
          {
            label: "Thu",
            value: "5",
            disabled: false,
            checked: false,
          },
          {
            label: "Fri",
            value: "6",
            disabled: false,
            checked: false,
          },
          {
            label: "Sat",
            value: "7",
            disabled: false,
            checked: false,
          },
        ];
      });
      useEffect(()=>{
        console.log("reccurance=",Reccuranceobject)
        setrepeatevery(Reccuranceobject.repeatInterval)
        if(Reccuranceobject.endDateTime!=null){
            setSelectedOption("byDate")
            const formattedDate = new Date(Reccuranceobject.endDateTime).toISOString().split('T')[0];
    setEndDate(formattedDate);
        } if(Reccuranceobject.endTimes==0){
            setSelectedOption("noEnd")
            setoccurancess(Reccuranceobject.endTimes)
        } if(Reccuranceobject.endTimes>0){
            setSelectedOption("afterOccurrences")
            setoccurancess(Reccuranceobject.endTimes)
        }
         if(Reccuranceobject.type==1){
            setreccurance("Daily")
            
         }else if(Reccuranceobject.type==2){
            setreccurance("Weekly")
            if (Reccuranceobject.weeklyDays) {
                // Convert the comma-separated string to an array of numbers
                const selectedDays = Reccuranceobject.weeklyDays.split(',').map(Number);
            
                // Update weekdays state
                setWeekdays((prevWeekdays) =>
                  prevWeekdays.map((day) => ({
                    ...day,
                    checked: selectedDays.includes(parseInt(day.value, 10)),
                  }))
                );
            }

         }else if(Reccuranceobject.type==3){
            setreccurance("Monthly")
           if(Reccuranceobject.monthlyDay>0){
            setOccurson("day")
            setmonthlyOn(Reccuranceobject.monthlyDay)
           }
            if(Reccuranceobject.monthlyWeekDay>0){
            setOccurson("last")
            setmonthlyWeek(Reccuranceobject.monthlyWeek)
            setmonthlyoccurswhen(Reccuranceobject.monthlyWeek==-1?"Last":Reccuranceobject.monthlyWeek==1?"First":Reccuranceobject.monthlyWeek==2?"Second":Reccuranceobject.monthlyWeek==3?"Third":"Fourth")
            setmonthlyWeekday(Reccuranceobject.monthlyWeekDay)
            setmonthlyoccursday(Reccuranceobject.monthlyWeekDay==1?"Sunday":Reccuranceobject.monthlyWeekDay==2?"Monday":Reccuranceobject.monthlyWeekDay==3?"Tuesday":Reccuranceobject.monthlyWeekDay==4?"Wednesday":Reccuranceobject.monthlyWeekDay==5?"Thursday":Reccuranceobject.monthlyWeekDay==6?"Friday":"Saturday")
            
           }
         }
      },[])
    const getprefix = () => {
      if (reccurance === "Monthly") {
        return " month(s)";
      } else if (reccurance === "Weekly") {
        return " week(s)";
      } else {
        return " day(s)";
      }
    };
  
    const formatMonthlyEndDate = (dateString) => {
  
      const today = new Date();
      const endDate = new Date(dateString);
    
      // Validate the `monthlyOn` input (day of the month)
      if (monthlyOn < 1 || monthlyOn > 31) {
        console.error("Invalid day of the month.");
        return "";
      }
    if(occurson === "day"){
      // Start with today's date
      let currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
      // If today is past the `monthlyOn`, start from next month
      if (today.getDate() > monthlyOn) {
        currentDate.setMonth(today.getMonth() + 1);
      }
      currentDate.setDate(monthlyOn); // Set the date to `monthlyOn` in the current month
    
      let totalOccurrences = 0;
    
      // Loop to count occurrences of `monthlyOn` between today and endDate
      while (currentDate <= endDate) {
        // Calculate the number of days in the current month
        const daysInMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        ).getDate();
    
        // Check if `monthlyOn` exists in the current month
        if (monthlyOn <= daysInMonth) {
          totalOccurrences++;
        }
    
        // Move to the next month
        currentDate.setMonth(currentDate.getMonth() + 1);
        currentDate.setDate(monthlyOn); // Ensure it's still the same day of the month in the next month
      }
    
      // Format the endDate for display
      const month = endDate.toLocaleString("en-US", { month: "short" });
      const day = endDate.getDate();
      const year = endDate.getFullYear();
    
      return `${month} ${day}, ${year}, ${totalOccurrences} occurrence(s)`;
    }else{
      const endDate = new Date(dateString);
    
    // Validate the `monthlyoccurswhen` input (week of the month)
    const weekdayMap = {
      "Sunday": 0,
      "Monday": 1,
      "Tuesday": 2,
      "Wednesday": 3,
      "Thursday": 4,
      "Friday": 5,
      "Saturday": 6
    };
  
    const targetWeekday = weekdayMap[monthlyoccursday];
    const targetWeek = monthlyoccurswhen;
  
    let totalOccurrences = 0;
  
    // Check if today matches the selected weekday
    if (today.getDay() === targetWeekday) {
      totalOccurrences++;
    }
  
    // Start with the first day of the current month
    let currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
  
    // Loop through each month from today to endDate
    while (currentDate <= endDate) {
      // Find the first weekday occurrence in the current month
      let firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
      // Find the first occurrence of the selected weekday in the month
      let firstOccurrence = (firstDayOfMonth.getDay() <= targetWeekday)
        ? new Date(currentDate.getFullYear(), currentDate.getMonth(), (targetWeekday - firstDayOfMonth.getDay() + 7) % 7 + 1)
        : new Date(currentDate.getFullYear(), currentDate.getMonth(), (targetWeekday - firstDayOfMonth.getDay() + 7) % 7 + 1 + 7);
  
      // Adjust to the correct occurrence (First, Second, Third, Last)
      if (targetWeek === "First") {
        // First occurrence
        totalOccurrences++;
      } else if (targetWeek === "Second") {
        // Second occurrence
        firstOccurrence.setDate(firstOccurrence.getDate() + 7);
        if (firstOccurrence <= endDate) totalOccurrences++;
      } else if (targetWeek === "Third") {
        // Third occurrence
        firstOccurrence.setDate(firstOccurrence.getDate() + 14);
        if (firstOccurrence <= endDate) totalOccurrences++;
      } else if (targetWeek === "Fourth") {
        // Fourth occurrence
        firstOccurrence.setDate(firstOccurrence.getDate() + 21);
        if (firstOccurrence <= endDate) totalOccurrences++;
      } else if (targetWeek === "Last") {
        // Last occurrence logic: Find the last occurrence of the selected weekday in the month
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); // Last day of the month
        let lastOccurrence = new Date(lastDayOfMonth.getFullYear(), lastDayOfMonth.getMonth(), lastDayOfMonth.getDate() - (lastDayOfMonth.getDay() - targetWeekday + 7) % 7);
  
        // Check if the last occurrence is after today and before the end date
        if (lastOccurrence >= today && lastOccurrence <= endDate) {
          totalOccurrences++;
        }
      }
  
      // Move to the next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  
    // Format the endDate for display
    const month = endDate.toLocaleString("en-US", { month: "short" });
    const day = endDate.getDate();
    const year = endDate.getFullYear();
  
    return `${month} ${day}, ${year}, ${totalOccurrences} occurrence(s)`;
    }
  
   
    }
  
    
    
    
  
    const formatWeeklyEndDate = (dateString) => {
      const today = new Date();
      const endDate = new Date(dateString);
      const timeDifference = endDate - today;
  
      // Calculate the number of days between today and the end date
      const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
  
      // Get the checked days (the days on which events should occur)
      const checkedDays = weekdays
        .filter((day) => day.checked)
        .map((day) => day.value);
  
      // Calculate the number of occurrences for each checked day
      const occurrences = checkedDays.map((dayValue) => {
        let dayIndex = parseInt(dayValue) - 1; // Convert value to index (0 for Sun, 6 for Sat)
        let nextOccurrence = new Date(today); // Start from today
  
        // Find the next occurrence of the checked day
        while (nextOccurrence.getDay() !== dayIndex) {
          nextOccurrence.setDate(nextOccurrence.getDate() + 1);
        }
  
        let numOccurrences = 0;
        // Calculate how many occurrences there are between today and the end date
        while (nextOccurrence <= endDate) {
          numOccurrences++;
          nextOccurrence.setDate(nextOccurrence.getDate() + 7 * repeatevery); // Move by the repeat interval (in weeks)
        }
  
        return numOccurrences;
      });
  
      // Total occurrences for all checked days
      const totalOccurrences = occurrences.reduce((acc, curr) => acc + curr, 0);
  
      // Get the end date's formatted values (Month, Day, Year)
      const day = endDate.getDate();
      const month = endDate.toLocaleString("en-US", { month: "short" });
      const year = endDate.getFullYear();
  
      return `${month} ${day}, ${year}, ${totalOccurrences} occurrence(s)`;
    };
  
    const formatEndDate = (dateString) => {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleString("en-US", { month: "short" });
      const year = date.getFullYear();
      const today = new Date();
      const timeDifference = date - today;
      // Calculate occurrences every 9 days
      const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1; // Add 1 to include both days
  
      const numOccurrences = Math.ceil(daysDifference / repeatevery);
      return `${month} ${day},${year}, ${numOccurrences} occurrence(s)`;
    };
    const updateReccuranceDescription = () => {
      let desc;
      let repeat;
      let occurances;
      if (reccurance === "Daily") {
        repeat = repeatevery > 1 ? `${repeatevery} days,` : " day,";
        occurances =
          selectedOption === "byDate"
            ? `until ${formatEndDate(EndDate)}`
            : selectedOption === "afterOccurrences"
            ? `${occurancess} occurrence(s)`
            : "365 occurrence(s)";
        desc = `Every ${repeat} ${occurances} `;
        setReccuranceDescription(desc);
      } else if (reccurance === "Weekly") {
        repeat = repeatevery > 1 ? `${repeatevery} Weeks,` : " Week,";
        let On = weekdays
          .filter((day) => day.checked)
          .map((day) => day.label)
          .join(",");
        occurances =
          selectedOption === "byDate"
            ? `until ${formatWeeklyEndDate(EndDate)}`
            : selectedOption === "afterOccurrences"
            ? `${occurancess} occurrence(s)`
            : "110 occurrence(s)";
        desc = `Every ${repeat} on ${On}, ${occurances} `;
        setReccuranceDescription(desc);
      } else if (reccurance === "Monthly") {
        repeat = repeatevery > 1 ? `${repeatevery} months,` : " month";
        let On = "";
        if (occurson === "day") {
          On = `on the ${monthlyOn} of the Month`;
        } else {
          On = `on the ${monthlyoccurswhen} ${monthlyoccursday}`;
        }
        occurances =
          selectedOption === "byDate"
            ? `until ${formatMonthlyEndDate(EndDate)} `
            : selectedOption === "afterOccurrences"
            ? `${occurancess} occurrence(s)`
            : "60 occurrence(s)";
        desc = `Every ${repeat}  ${On}, ${occurances} `;
        setReccuranceDescription(desc);
      } else if (reccurance === "NoFixedTime") {
        setReccuranceDescription("Meet AnyTime");
      }
    };
    useEffect(() => {
      updateReccuranceDescription();
    }, [
      reccurance,
      repeatevery,
      EndDate,
      selectedOption,
      occurancess,
      weekdays,
      monthlyOn,
      monthlyoccurswhen,
      monthlyoccursday,
      occurson,
    ]);
  
    const handleReccuranceChange = (e) => {
      const name = e.target.value;
      if (name === "NoFixedTime") {
        setzoomrequest((prev) => ({
          ...prev,
          type: 3,
        }));
        setreccurance(e.target.value);
      }else{
        setzoomrequest((prev) => ({
          ...prev,
          type: 8,
        }));
      if (name === "Daily") {
        setReccuranceobject((prev)=>({
          ...prev,
          monthlyDay :'',
          monthlyWeek :'',
          monthlyWeekDay :'',
          type:1
        }))
        const today = new Date();
        const sevenDaysLater = new Date(today);
        sevenDaysLater.setDate(today.getDate() + 6 * repeatevery);
        const enddate=sevenDaysLater.toISOString().split("T")[0]
        setEndDate(enddate)
        setReccuranceobject((prev)=>({
          ...prev,
          endDateTime:enddate
        }))
  
      } else if (name === "Weekly") {
        setReccuranceobject((prev)=>({
          ...prev,
          monthlyDay :'',
          monthlyWeek :'',
          monthlyWeekDay :'',
          type:2
        }))
        
          const today = new Date();
          const sevenDaysLater = new Date(today);
          sevenDaysLater.setDate(today.getDate() + 6 * (repeatevery * 7));
          
        const enddate=sevenDaysLater.toISOString().split("T")[0]
        const currentDayIndex = new Date().getDay(); // Get current day (0 - Sunday, 6 - Saturday)
        const updatedWeekdays = weekdays.map((day) => {
          if (parseInt(day.value) === currentDayIndex) {
            return { ...day, disabled: true, checked: true };
          }
          return day;
        });
        const selectedDays = updatedWeekdays
          .filter((day) => day.checked)
          .map((day) => day.value)
          .join(",");
        setWeekdays(updatedWeekdays);
        setEndDate(enddate)
        setReccuranceobject((prev)=>({
          ...prev,
          weeklyDays: selectedDays,
          endDateTime:enddate
        }))
        
  
      } else if (name === "Monthly") {
        setReccuranceobject((prev)=>({
          ...prev,
          type:3,
          weeklyDays:''
        }))
        
          const today = new Date(); // Create a copy of today's date
          const targetDate = new Date(today);
      // Set the date to the "monthlyOn" day of the month
      
      targetDate.setDate(monthlyOn);
  
      // Adjust the month by +7 times repeatEvery
      targetDate.setMonth(today.getMonth() + 6 * repeatevery);
        
      const endDate=targetDate.toISOString().split("T")[0];
      setEndDate(endDate)
      setReccuranceobject((prev)=>({
        ...prev,
        endDateTime:endDate
      }))
    }
      setreccurance(e.target.value);
    
    }
  }
    const handleCheckboxChange = (val) => {
      setWeekdays((prev) => {
        // Toggle the checked state of the clicked day
        const updatedWeekdays = prev.map((day) =>
          day.value === val ? { ...day, checked: !day.checked } : day
        );
  
        // Count the number of checked days
        const checkedDays = updatedWeekdays.filter((day) => day.checked).length;
  
        // Update the disabled state based on the number of checked days
        const finalWeekdays = updatedWeekdays.map((day) => {
          if (checkedDays > 1) {
            // If more than one day is checked, disable none
            return { ...day, disabled: false };
          } else if (checkedDays === 1 && day.checked) {
            // If only one day is checked, disable that day
            return { ...day, disabled: true };
          } else {
            return { ...day, disabled: false };
          }
        });
  
        // Update the weeklyDays property with a comma-separated string of checked days
        const selectedDays = finalWeekdays
          .filter((day) => day.checked)
          .map((day) => day.value)
          .join(",");
  
        setReccuranceobject((prev) => ({
          ...prev,
          monthlyWeek :null,
          monthlyWeekDay :null,
          weeklyDays: selectedDays, // Update weeklyDays with the new comma-separated string
        }));
  
        return finalWeekdays;
      });
    };
  
    const generatemonthoption = () => {
      let max = 31;
      return Array.from({ length: max }, (_, i) => i + 1).map((value) => (
        <option key={value} value={value}>
          {value}
        </option>
      ));
    };
    const changeRepeatEvery = (e) => {
      setrepeatevery(e.target.value);
      setReccuranceobject((prev) => ({
        ...prev,
        repeatInterval: e.target.value,
      }));
      setEndDate(() => {
        if (reccurance === "Daily") {
          const today = new Date();
          const sevenDaysLater = new Date(today);
          sevenDaysLater.setDate(today.getDate() + 6 * e.target.value);
          setReccuranceobject((prev)=>({
            ...prev,
            endDateTime:sevenDaysLater.toISOString().split("T")[0]
          }))
          return sevenDaysLater.toISOString().split("T")[0];

        } else if (reccurance === "Weekly") {
          const today = new Date();
          const sevenDaysLater = new Date(today);
          sevenDaysLater.setDate(today.getDate() + 6 * (e.target.value * 7));
          setReccuranceobject((prev)=>({
            ...prev,
            endDateTime:sevenDaysLater.toISOString().split("T")[0]
          }))
          return sevenDaysLater.toISOString().split("T")[0];
        
        }else if (reccurance==="Monthly"){
          const today = new Date(); // Create a copy of today's date
          const targetDate = new Date(today);
      // Set the date to the "monthlyOn" day of the month
      
      targetDate.setDate(monthlyOn);
  
      // Adjust the month by +7 times repeatEvery
      targetDate.setMonth(today.getMonth() + 6 * repeatevery);
        
      const endDate=targetDate.toISOString().split("T")[0];
      setEndDate(endDate)
      setReccuranceobject((prev)=>({
        ...prev,
        endDateTime:endDate
      }))
        }
      });
    };
    const changeAfterOccurance = (e) => {
      setoccurancess(e.target.value);
      setReccuranceobject((prev) => ({
        ...prev,
        endTimes: e.target.value,
      }));
    };
    const changemonthlyWeekDay = (e) => {
      setmonthlyoccursday(e.target.value);
      const selectedOption = e.target.selectedOptions[0];
      const customDataValue = selectedOption.getAttribute("data-value");
      
      setmonthlyWeekday(customDataValue);
      setReccuranceobject((prev) => ({
        ...prev,
        monthlyDay:null,
        monthlyWeekDay: customDataValue,
      }));
     
    };
    const changemonthlyWeek = (e) => {
      setmonthlyoccurswhen(e.target.value);
      const selectedOption = e.target.selectedOptions[0];
      const customDataValue = selectedOption.getAttribute("data-value");
      setmonthlyWeek(customDataValue);
      setReccuranceobject((prev) => ({
        ...prev,
        monthlyDay:null,
        monthlyWeek: customDataValue,
      }));
     
    };
    const monthlyoccurson = (e) => {
      const name = e.target.name;
      setOccurson(name);
      if (name === "day") {
        setReccuranceobject((prev)=>({
          ...prev,
          monthlyDay: monthlyOn,
          monthlyWeek:'',
          monthlyWeekDay:''
        }))
      } else if (name === "last") {
        setReccuranceobject((prev)=>({
          ...prev,
          monthlyDay:null,
          monthlyWeek:monthlyWeek,
          monthlyWeekDay:monthlyWeekday
        }))
        
      }
    };
    const handleMonthlyonchange = (e) => {
      setmonthlyOn(e.target.value);
      setReccuranceobject((prev) => ({
        ...prev,
        monthlyDay: e.target.value,
      }));
    };
    const generateOptions = () => {
      let max = 99; // Default for "Daily"
      if (reccurance === "Weekly") max = 50;
      else if (reccurance === "Monthly") max = 10;
  
      return Array.from({ length: max }, (_, i) => i + 1).map((value) => (
        <option key={value} value={value}>
          {value}
        </option>
      ));
    };
    const changeendtime = (e) => {
      const name = e.target.name;
      setSelectedOption(name);
      if (name === "noEnd") {
        setReccuranceobject((prev) => ({
          ...prev,
          endTimes: "0",
        }));
        setReccuranceobject((prev) => ({
          ...prev,
          endDateTime: "",
        }));
      } else if (name === "byDate") {
        const formattedDateTime = new Date(`${EndDate}T23:59:00`).toISOString();
  
        setReccuranceobject((prev) => ({
          ...prev,
          endDateTime: formattedDateTime,
          endTimes: "",
        }));
        
      } else if (name === "afterOccurrences") {
        setReccuranceobject((prev) => ({
          ...prev,
          endTimes: occurancess,
        }));
        setReccuranceobject((prev) => ({
          ...prev,
          endDateTime: "",

        }));
      }
    };
  return (
    <div className="form-group row">
    <label className="col-sm-2 col-form-label"></label>
    <div className="col-sm-9">
      <div className=" row">
        <label className="col-form-label col-sm-2">Recurrence</label>
        <select
          value={reccurance}
          onChange={handleReccuranceChange}
          className="form-control col-sm-4"
        >
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
          <option value="NoFixedTime">No Fixed Time</option>
        </select>
      </div>
      {reccurance != "NoFixedTime" && (
        <>
          <div className="row mt-3">
            <label className="col-form-label col-sm-2">Repeat every</label>
            <select
              onChange={(e) => {
                changeRepeatEvery(e);
              }}
              value={repeatevery}
              className="form-control col-sm-4"
            >
              {generateOptions()}
            </select>
            <label className="col-form-label">{getprefix()}</label>
          </div>

          {reccurance === "Weekly" && (
            <>
              <div className="d-flex flex-wrap align-items-start mt-3">
                {/* Label */}
                <div
                  className="col-form-label me-3"
                  style={{ flexBasis: "150px", flexShrink: 0 }}
                >
                  <label htmlFor="occurs" className="col-form-label">
                    Occurs on
                  </label>
                </div>

                <div
                  className="d-flex flex-wrap p-3"
                  style={{ height: "100%" }}
                  id="occurs"
                >
                  {weekdays.map((day) => (
                    <div key={day.value}>
                      <input
                        type="checkbox"
                        id={`checkbox_${day.value}`}
                        className="check"
                        value={day.value}
                        disabled={day.disabled}
                        checked={day.checked}
                        onChange={() => handleCheckboxChange(day.value)}
                      />
                      <label
                        htmlFor={`checkbox_${day.value}`}
                        className={`col-form-label ${
                          day.disabled ? "text-muted" : ""
                        }`}
                      >
                        {day.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {reccurance === "Monthly" && (
            <>
              <div className="d-flex flex-wrap align-items-start mt-3">
                {/* Label */}
                <div
                  className="col-form-label me-3"
                  style={{ flexBasis: "150px", flexShrink: 0 }}
                >
                  <label htmlFor="occurs" className="col-form-label">
                    Occurs on
                  </label>
                </div>

                <div
                  className="d-flex align-items-center me-3 mt-3"
                  style={{ flexBasis: "150px", flexShrink: 0 }}
                >
                  <input
                    type="radio"
                    className="radio"
                    name="day"
                    style={{ flexShrink: 0 }}
                    checked={occurson === "day"}
                    onChange={monthlyoccurson}
                  />
                  <label className="col-form-label ms-2">Day</label>
                  <select
                    onChange={handleMonthlyonchange}
                    value={monthlyOn}
                    className="form-control ml-2"
                    disabled={occurson != "day"}
                    style={{ flexBasis: "100px", flexShrink: 0 }}
                  >
                    {generatemonthoption()}
                  </select>
                  <label
                    style={{ flexBasis: "150px", flexShrink: 0 }}
                    className="ml-2 col-form-label"
                  >
                    of the month
                  </label>
                </div>
              </div>
              <div className="d-flex flex-wrap align-items-start mb-4 mt-2 ">
                {/* Label */}
                <div
                  className="col-form-label me-3"
                  style={{ flexBasis: "150px", flexShrink: 0 }}
                ></div>

                <div
                  className="d-flex align-items-center me-3"
                  style={{ flexBasis: "150px", flexShrink: 0 }}
                >
                  <input
                    type="radio"
                    className="radio"
                    name="last"
                    checked={occurson === "last"}
                    onChange={monthlyoccurson}
                    style={{ flexShrink: 0 }}
                  />
                  <select
                    value={monthlyoccurswhen}
                    onChange={changemonthlyWeek}
                    disabled={occurson === "day"}
                    style={{ flexBasis: "150px", flexShrink: 0 }}
                    className="form-control ml-2"
                  >
                    <option data-value="-1" value="Last">
                      Last
                    </option>
                    <option data-value="1" value="First">
                      First
                    </option>
                    <option data-value="2" value="Second">
                      Second
                    </option>
                    <option data-value="3" value="Third">
                      Third
                    </option>
                    <option data-value="4" value="Fourth">
                      Fourth
                    </option>
                  </select>
                  <select
                    value={monthlyoccursday}
                    onChange={changemonthlyWeekDay}
                    disabled={occurson === "day"}
                    style={{ flexBasis: "150px", flexShrink: 0 }}
                    className="form-control ml-2"
                  >
                    <option data-value="1" value="Sunday">
                      Sunday
                    </option>
                    <option data-value="2" value="Monday">
                      Monday
                    </option>
                    <option data-value="3" value="Tuesday">
                      Tuesday
                    </option>
                    <option data-value="4" value="Wednesday">
                      Wednesday
                    </option>
                    <option data-value="5" value="Thursday">
                      Thursday
                    </option>
                    <option data-value="6" value="Friday">
                      Friday
                    </option>
                    <option data-value="7" value="Saturday">
                      Saturday
                    </option>
                  </select>
                  <label
                    style={{ flexBasis: "150px", flexShrink: 0 }}
                    className="ml-2 col-form-label"
                  >
                    of the month
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="d-flex flex-wrap align-items-start mt-3 ">
            {/* Label */}
            <label
              className="col-form-label me-3"
              style={{ flexBasis: "150px", flexShrink: 0 }}
            >
              End date
            </label>

            {/* No End Time */}
            <div
              className="d-flex align-items-center me-3"
              style={{ flexBasis: "150px", flexShrink: 0 }}
            >
              <input
                type="radio"
                className="radio"
                style={{ flexShrink: 0 }}
                checked={selectedOption === "noEnd"}
                name="noEnd"
                onChange={changeendtime}
              />
              <label className="col-form-label ms-2">No end time</label>
            </div>

            {/* By Date */}
            <div
              className="d-flex align-items-center me-3"
              style={{ flexBasis: "260px", flexShrink: 0 }}
            >
              <input
                type="radio"
                className="radio"
                style={{ flexShrink: 0 }}
                checked={selectedOption === "byDate"}
                name="byDate"
                onChange={changeendtime}
              />
              <label className="col-form-label mr-2">By</label>
              <input
                type="date"
                className="form-control ms-2"
                disabled={selectedOption !== "byDate"}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  setEndDate(e.target.value);
                }}
                value={EndDate}
              />
            </div>

            {/* After Occurrences */}
            <div
              className="d-flex align-items-center "
              style={{ flexBasis: "300px", flexShrink: 0 }}
            >
              <input
                type="radio"
                className="radio"
                style={{ flexShrink: 0 }}
                checked={selectedOption === "afterOccurrences"}
                name="afterOccurrences"
                onChange={changeendtime}
              />
              <label className="col-form-label ms-2">After</label>
              <select
                className="form-control mr-2"
                onChange={changeAfterOccurance}
                value={occurancess}
                disabled={selectedOption !== "afterOccurrences"}
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <label className="col-form-label ml-2">occurrences</label>
            </div>
          </div>
        </>
      )}
    </div>
  </div>
  )
}

export default EditReccuringMeet