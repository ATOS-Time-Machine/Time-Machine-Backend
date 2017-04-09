CREATE TABLE Users (
    StaffID varchar(255) NOT NULL,
    FirstName varchar(255) NOT NULL,
    LastName varchar(255) NOT NULL,
    Password varchar(255) NOT NULL,
    PayRoll varchar(255) NOT NULL,
    Location varchar(255) NOT NULL,
    Email varchar(255) NOT NULL,
    Alerts varchar(255) NOT NULL,
    Role varchar(255) NOT NULL,
    Access varchar(255) NOT NULL,
    Supervisor varchar(255) NOT NULL,
    PRIMARY KEY (StaffID)
);

CREATE TABLE Requests (
    StaffID varchar(255) NOT NULL,
    Contract varchar(255) NOT NULL,
    Future varchar(255) NOT NULL,
    RequestDate varchar(255) NOT NULL,
    RequestTime varchar(255) NOT NULL,
    Duration float NOT NULL,
    USD varchar(255) NOT NULL,
    WBS varchar(255) NOT NULL,
    ReasonFree varchar(255) NOT NULL,
    OvertimeReason varchar(255) NOT NULL,
    HoursReason varchar(255) NOT NULL,
    Rate varchar(255) NOT NULL,
    Manager varchar(255) NOT NULL,
    Revenue varchar(255) NOT NULL,
    Paying varchar(255) NOT NULL,
    Status varchar(255) DEFAULT NULL,
    Comment varchar(255) DEFAULT NULL,
    Supervisor varchar(255) NOT NULL,
    Phase int NOT NULL,
    FOREIGN KEY (StaffID) REFERENCES Users(StaffID),
    CONSTRAINT RequestID PRIMARY KEY (StaffID, RequestDate, RequestTime)
);

CREATE TABLE Codes (
    StaffID varchar(255),
    WBSCode varchar(255),
    FOREIGN KEY (StaffID) REFERENCES Users(StaffID),
    CONSTRAINT WBSID PRIMARY KEY (StaffID, WBSCode)
);

INSERT INTO Users (StaffID, FirstName, LastName, Password, PayRoll, Location, Email, Alerts, Role, Access, Supervisor) VALUES("111", "Ryan", "Collins", "$2a$10$7agmNuglhlR03ZQ2vZt9kO.f52kLqklGcHk4.BtSyJMkD.T6Lf3YW", "1", "1", "chromerurry@gmail.com", "1", "1", "1", "111");