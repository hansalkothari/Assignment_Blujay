const fs = require('fs')
const path ='output.txt'
const fileContent = fs.readFileSync('Assignment_Timecard.xlsx - Sheet1.csv', 'utf8');

const writer = console.log;
fs.writeFileSync(path,'');
const logStream = fs.createWriteStream(path, { flags: 'a' });
console.log = function(){
  writer.apply(console, arguments);
  const logMessage = Array.from(arguments).join(' '); 
  logStream.write(logMessage + '\n');
}


const rows = fileContent.split('\n');
const header = rows[0].split(',');

const nameIndex = header.indexOf('Employee Name');
const positionIndex = header.indexOf('Position ID');
const timeIndex = header.indexOf('Time');
const timeoutIndex = header.indexOf('Time Out');
const hoursWorkedIndex = header.indexOf('Timecard Hours (as Time)');

const numOfHours = (timeString) =>{
  const [hours, minutes] = timeString.split(':').map(Number);
  const decimalHours = hours + minutes / 60;
  return decimalHours;
}

const employees = [];

/******BUILDING EMPLOYEES OBJECT*******/
for (let i = 1; i < rows.length; i++) {
    const columns = rows[i].split(',');

    if(columns[timeIndex] !== '' && columns[timeoutIndex] !== ''){
      const employee = {
        name: columns[nameIndex] + columns[nameIndex + 1],
        position: columns[positionIndex],
        time: new Date(columns[timeIndex]),
        timeout: new Date(columns[timeoutIndex]),
        hoursWorked: numOfHours(columns[hoursWorkedIndex])
      };
    
      if (!employees[employee.name]) {
        employees[employee.name] = [];
      }
  
      
      const existingObjectIndex = employees[employee.name].findIndex(
        obj => obj.time.toISOString().split('T')[0] === employee.time.toISOString().split('T')[0]
      );
  
      if (existingObjectIndex !== -1) {
        employees[employee.name][existingObjectIndex].hoursWorked += employee.hoursWorked;
      } else {
        employees[employee.name].push(employee);
      }
    }
}

/************** GETTING EMPLOYEES WHO HAVE WORKED FOR 7 CONSECUTIVE DAYS************/
function hasWorkedFor7ConsecutiveDays(employeeArray) {
  employeeArray.sort((a, b) => new Date(a.Time) - new Date(b.Time));

  
  for (let i = 0; i < employeeArray.length - 6; i++) {
    const currentDay = new Date(employeeArray[i].Time);
    let consecutiveDaysCount = 1;

    for (let j = i + 1; j < i + 7; j++) {
      const nextDay = new Date(employeeArray[j].Time);
      const timeDiff = nextDay.getTime() - currentDay.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);

      
      if (daysDiff === 1) {
        consecutiveDaysCount++;
      } else {
        break; 
      }
    }


    if (consecutiveDaysCount === 7) {
      return true;
    }
  }

  return false;
}

const employeesWith7ConsecutiveDays = Object.keys(employees).filter(employeeName => {
  
  const employeeArray = employees[employeeName];
  return hasWorkedFor7ConsecutiveDays(employeeArray);
});



/************** GETTING EMPLOYEES WHO HAVE WORKED FOR 1<=HOURSE<10 *****************/
function filterEmployeesByHours(employeeArray) {
  return employeeArray.filter(employee => {
    const hoursWorked = employee.hoursWorked || 0; // Default to 0 if hoursWorked is not defined
    return hoursWorked > 1 && hoursWorked < 10;
  });
}

// Get names of employees who have worked more than 1 hour and less than 10 hours
const eligibleEmployees = Object.keys(employees).filter(employeeName => {
  const employeeArray = employees[employeeName];
  const filteredEmployeeArray = filterEmployeesByHours(employeeArray);
  return filteredEmployeeArray.length > 0;
});



/****************EMPLOYEES WORKED FOR 14HOURS IN SINGLE SHIFT*****************/
const new_employees = []
for (let i = 1; i < rows.length; i++) {
  const columns = rows[i].split(',');

  if(columns[timeIndex] !== '' && columns[timeoutIndex] !== ''){
    const employee = {
      name: columns[nameIndex] + columns[nameIndex + 1],
      position: columns[positionIndex],
      time: new Date(columns[timeIndex]),
      timeout: new Date(columns[timeoutIndex]),
      hoursWorked: numOfHours(columns[hoursWorkedIndex])
    };
  
    if (!new_employees[employee.name]) {
      new_employees[employee.name] = [];
    }
 
    new_employees[employee.name].push(employee);
  }
}

function getEmployeesWorkedMoreThan14Hours(employeeArray) {
  return employeeArray
    .filter(employee => employee.hoursWorked > 14)
    .map(employee => employee.name);
}

const employeesWorkedMoreThan14Hours = Object.keys(new_employees).reduce((result, employeeName) => {
  const employeeArray = new_employees[employeeName];
  const names = getEmployeesWorkedMoreThan14Hours(employeeArray);
  return result.concat(names);
}, []);


/*********** RESULTS ***********/
console.log("employees who worked for 7 consecutive days : ", employeesWith7ConsecutiveDays)
console.log("EMP WORKING FOR 1<=HOURS<10",eligibleEmployees)
console.log("Names of employees who worked more than 14 hours in a shift:", employeesWorkedMoreThan14Hours);
