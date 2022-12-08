How to run:
1. This project is made on Visual Studio Code using Node JS, HTML and JavaScript. 
2. Connects to a backend Oracle database. (Provide the database credentials in the checkConnection() api in the index.js file)
3. From terminal, call node .\index.js
4. Goto http://localhost:3000/ in browser
5. In Navbar we have the follwing options:
    a. View Passengers, View Drivers and View Bookings show all the contents of these tables.
    b. Search, Insert and Delete passenger options are given to search/insert/delete a particular passenger record.
    c. Modify Booking - Modifies the fare amount of a given BookingID for the provided BID value. 
6. Three dynamic SQL queries are demonstrated as Generate Report 1, Generate Report 2,  Generate Report 3  which includes
   aggregates, HAVING clause, GROUP BY , ORDER BY and CUBE clauses.
7. The results of each function is displayed at the bottom of the page.