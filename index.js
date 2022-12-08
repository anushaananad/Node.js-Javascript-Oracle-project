const express = require('express')
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
app.use(express.json());
app.use(express.static("express"));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const port = 3000;
let libPath;
const router = express.Router();
libPath = 'C:\\Users\\Shyam Barathy\\Downloads\\instantclient-basic-windows.x64-19.17.0.0.0dbru\\instantclient_19_17';
const oracledb = require('oracledb');
const { query } = require('express');
oracledb.initOracleClient({ libDir: libPath });
var fs = require('fs');
var http = require('http');
// checkConnection asycn function
let connection;
async function checkConnection() {
  try {
    connection = await oracledb.getConnection({
        user: "Enterusername",
        password: "Enterpassword",
        connectString: "(DESCRIPTION=(ADDRESS=(COMMUNITY=EnterHostname)(PROTOCOL=TCP)(HOST=EnterHostname)(PORT=EnterPortno))(CONNECT_DATA=(SERVICE_NAME=EnterSID)(GLOBAL_NAME=EnterGlobalname)(SERVER=DEDICATED)))"
    });
    console.log('connected to database');
  } catch (err) {
    console.error(err.message);
  } finally {
    if (connection) {
      try {
        // Always close connections
        // await connection.close(); 
        console.log('connection success');
      } catch (err) {
        console.error(err.message);
      }
    }
  }
}

async function selectAllEmployees(req, res, sex) {
  try {
    sex = sex || 'M';
    let query = `SELECT * FROM sharmac.employee where SEX='${sex}'`
    console.log(query)
    result = await connection.execute(query);
    console.log(result)
    return res.send(result)
  } catch (err) {
    //send error message
    return res.send(err.message);
  } finally {
    if (connection) {
      try {
        // Always close connections
        // await connection.close();
        // console.log('close connection success');
      } catch (err) {
        console.error(err.message);
      }
    }
    // if (result.rows.length == 0) {
    //   //query return zero employees
    //   return res.send('query send no rows');
    // } else {
    //   //send all employees
    //   return res.send(result.rows);
    // }

  }
}

//VIEW ALL RECORDS
async function getAllRecords(req, res, tname) {
  try {
    let query = `SELECT * FROM Fall22_S003_12_`
    let query2 = query.concat(tname);
    console.log(query2)
    result = await connection.execute(query2);
    //console.log(result)
    return res.send(result)
  } catch (err) {
    //send error message
    return res.send(err.message);
  }
}

app.get('/psg-list', function (req, res) {
  getAllRecords(req, res, 'PASSENGER');
});

app.get('/drv-list', function (req, res) {
  getAllRecords(req, res, 'DRIVER');
});

app.get('/bkg-list', function (req, res) {
  getAllRecords(req, res, 'BOOKING');
});

//REPORTS
async function generateReport1(req, res, fromd, tod) {
  try {

    let query = "select PID, FIRSTNAME, LASTNAME, SUM(FAREAMOUNT) AS TOTAL_AMOUNT, RANK() OVER (ORDER BY SUM(FAREAMOUNT) DESC) AS RANK_AMOUNT FROM  Fall22_S003_12_PASSENGER PA INNER JOIN FALL22_S003_12_BOOKING BK ON PA.PID = BK.PSGID WHERE BDATE BETWEEN TO_DATE("
    + "'?','YYYY-MM-DD') AND TO_DATE('@','YYYY-MM-DD') GROUP BY  PSGID,  FIRSTNAME, LASTNAME, PID ORDER BY SUM(FAREAMOUNT) DESC FETCH FIRST 3 ROWS ONLY";
   // console.log(query);

    query = query.replace("?", fromd);
    query = query.replace("@", tod);
      
    result = await connection.execute(query);
    console.log(result)
    return res.send(result)
  } catch (err) {
    //send error message
    return res.send(err.message);
  }
}

async function generateReport2(req, res, bks, bke) {
  try {
    let query = "SELECT DROPCITY, PICKCITY, COUNT(BID) BOOKING_COUNT FROM FALL22_S003_12_BOOKING where bid between '?' and '@'" 
    +" GROUP BY CUBE(DROPCITY,PICKCITY) HAVING COUNT(BID) >= (SELECT AVG(COUNT(BID)) FROM FALL22_S003_12_BOOKING "
    + " GROUP BY DROPCITY) ORDER BY COUNT(BID) DESC ";

    query = query.replace("?", bks);
    query = query.replace("@", bke);
    console.log(query);

    result = await connection.execute(query);
    console.log(result)
    return res.send(result)
  } catch (err) {
    //send error message
    return res.send(err.message);
  }
}

async function generateReport3(req, res, year) {
  try {
    let query = "select TO_CHAR(to_date(trunc(b.bdate), 'YYYY-MM-DD'), 'MONTH') MONTH , COUNT(b.BDATE) BOOKING_COUNT FROM dual, FALL22_S003_12_BOOKING b where b.bdate like "
  + " '%@' GROUP BY TO_CHAR(to_date(trunc(b.bdate), 'YYYY-MM-DD'), 'MONTH') HAVING COUNT(b.BDATE) >= ALL ( select COUNT(bd.BDATE) FROM dual, FALL22_S003_12_BOOKING bd "
   +  "GROUP BY TO_CHAR(to_date(trunc(bd.bdate), 'YYYY-MM-DD'), 'MONTH')) ";

    query = query.replace("@", year);
    //console.log(query);
    result = await connection.execute(query);
    console.log(result)
    return res.send(result)
  } catch (err) {
    //send error message
    return res.send(err.message);
  }
}

app.get('/generate-report-1', function (req, res) {
  let fromd = req.query.fromd;
  let tod =  req.query.tod;
  console.log("Hello");
  console.log(fromd);
  console.log(tod);
  generateReport1(req, res, fromd, tod);
});

app.get('/generate-report-2', function (req, res) {
  let bks = req.query.bks;
  let bke =  req.query.bke;
  console.log(bks, bke);
  generateReport2(req, res, bks, bke);
});

app.get('/generate-report-3', function (req, res) {
  let year = req.query.byr;
  generateReport3(req, res, year);
});


//DISPLAY PASSENGER DETAILS-PID
async function displayPsgDetails(req, res, pa_id) {
  try {
    let query = `SELECT * FROM Fall22_S003_12_PASSENGER where PID='${pa_id}'`
    console.log(query)
    result = await connection.execute(query);
    console.log(result)
    return res.send(result)
  } catch (err) {
    //send error message
    return res.send(err.message);
  }
}

app.get('/search-psg', function (req, res) {
  let pid = req.query.pid;
  console.log(pid);
  displayPsgDetails(req, res, pid);
});

//INSERT PASSENGER
  async function insertPsg(req, res) {
    try {
      var hasMatch;
      if(req.body.pgch1 === 'F') {
        hasMatch = true;
      } else {
        hasMatch = false;
      }
      if (hasMatch){
          result = await connection.execute(`INSERT INTO FALL22_S003_12_PASSENGER VALUES (
            '${req.body.pid}','${req.body.pfn}','${req.body.pln}','${req.body.pgch1}',TO_DATE( '${req.body.pdob}', 'YYYY-MM-DD'),'${req.body.pcn}','${req.body.pe}')`);
      } else {
          result = await connection.execute(`INSERT INTO FALL22_S003_12_PASSENGER VALUES (
            '${req.body.pid}','${req.body.pfn}','${req.body.pln}','${req.body.pgch2}',TO_DATE( '${req.body.pdob}', 'YYYY-MM-DD'),'${req.body.pcn}','${req.body.pe}')`);
      }
        result1 = await connection.execute(`INSERT INTO FALL22_S003_12_PAYMENT VALUES ('${req.body.payid}', '${req.body.payacc}', 
        TO_DATE( '${req.body.payexp}','YYYY/MM'),'${req.body.pid}')`);
      connection.execute('commit')
      res.send(result)
      console.log("Record inserted!")
    } catch (err) {
      //send error message
      return res.send(err.message);
    }
  }

  app.post('/api/addpsg', (req,res) => {
      insertPsg(req, res);
      res.end('Passenger Record inserted successfully!');
  });


//DELETE PASSENGER
  async function deletePsg(req, res) {
    try {
        result = await connection.execute(`DELETE FROM Fall22_S003_12_RIDESCHEDULE WHERE BID IN (SELECT BID FROM Fall22_S003_12_BOOKING WHERE PSGID = '${req.body.pasid}')`);
        result = await connection.execute(`DELETE FROM Fall22_S003_12_BOOKING WHERE PSGID = '${req.body.pasid}'`);
        result = await connection.execute(`DELETE FROM Fall22_S003_12_PAYMENT WHERE PSGID = '${req.body.pasid}'`);
        result = await connection.execute(`DELETE FROM Fall22_S003_12_PASSENGER WHERE PID = '${req.body.pasid}'`);  
        connection.execute('commit')
        res.send(result)
        console.log("Record deleted!")
    } catch (err) {
      //send error message
      return res.send(err.message);
    }
  }

  app.post('/api/delpsg', (req,res) => {
    deletePsg(req, res);
    //res.end('Passenger Record deleted successfully!');
});



//MODIFY BOOKING
async function modifyBooking(req, res) {
  try {
      var sql = "UPDATE FALL22_S003_12_BOOKING SET FAREAMOUNT = " + " ? WHERE BID = " + " '@'";
      sql = sql.replace("?", (req.body.fareamt));
      sql = sql.replace("@", (req.body.bid));
      result = await connection.execute(sql);
      connection.execute('commit')
      res.send(result)
      console.log("Record successfully modified!")
  } catch (err) {
    //send error message
    return res.send(err.message);
  }
}

app.post('/api/updateBooking', (req,res) => {
  modifyBooking(req, res);
  //res.end('Booking Record updated successfully!');
});

function randomNumber(min, max) { 
  return Math.floor(Math.random() * (max - min) + min);
} 

checkConnection();

// default URL for website
app.use('/', function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
  //__dirname : It will resolve to your project folder.
});


app.listen(port, () => console.log("nodeOracleRestApi app listening on port %s!", port))
