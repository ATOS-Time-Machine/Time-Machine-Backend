-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Feb 14, 2017 at 08:56 PM
-- Server version: 5.7.17-0ubuntu0.16.04.1
-- PHP Version: 7.0.13-0ubuntu0.16.04.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `timemachinedb`
--

-- --------------------------------------------------------

--
-- Table structure for table `contracts`
--

CREATE TABLE `contracts` (
  `contractID` int(11) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `favouritewbss`
--

CREATE TABLE `favouritewbss` (
  `WBSCode` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `groups`
--

CREATE TABLE `groups` (
  `groupID` int(11) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `locationID` int(11) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `overtimes`
--

CREATE TABLE `overtimes` (
  `overTimeID` int(11) NOT NULL,
  `date` date NOT NULL,
  `timeStart` time NOT NULL,
  `duration` float NOT NULL,
  `retrospective` tinyint(1) NOT NULL,
  `USDTicket` text NOT NULL,
  `WBSCode` text NOT NULL,
  `reasonForm` text NOT NULL,
  `projectManager` text NOT NULL,
  `travelCost` float NOT NULL,
  `callOut` float NOT NULL,
  `staffID` varchar(30) NOT NULL,
  `locationID` int(11) NOT NULL,
  `contractID` int(11) NOT NULL,
  `reasonID` int(11) NOT NULL,
  `reasonCannotDoneID` int(11) NOT NULL,
  `rateID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `rates`
--

CREATE TABLE `rates` (
  `rateID` int(11) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `reasons`
--

CREATE TABLE `reasons` (
  `reasonID` int(11) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `reasonscannotdone`
--

CREATE TABLE `reasonscannotdone` (
  `reasonCannotDoneID` int(11) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `roleID` int(11) NOT NULL,
  `description` text NOT NULL,
  `permissions` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `taskID` int(11) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `staffID` varchar(30) NOT NULL,
  `password` text NOT NULL,
  `fullName` text NOT NULL,
  `roleID` int(11) DEFAULT NULL,
  `groupID` int(11) DEFAULT NULL,
  `token` varchar(16) DEFAULT NULL,
  `tokenDate` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`staffID`, `password`, `fullName`, `roleID`, `groupID`, `token`, `tokenDate`) VALUES
('giorgio@diocane.com', '$2a$10$kfEi54Dl2BjR/IoI/euua.pWIJefRTc89GFNmigiOhL4jviZQbD7u', 'giorgio', NULL, NULL, 'sKyYsn1pxoZzBXv8', '2017-02-14 20:51:55');

-- --------------------------------------------------------

--
-- Table structure for table `usertask`
--

CREATE TABLE `usertask` (
  `staffID` varchar(30) NOT NULL,
  `taskID` int(11) NOT NULL,
  `date` date NOT NULL,
  `targetTime` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contracts`
--
ALTER TABLE `contracts`
  ADD PRIMARY KEY (`contractID`);

--
-- Indexes for table `favouritewbss`
--
ALTER TABLE `favouritewbss`
  ADD PRIMARY KEY (`WBSCode`);

--
-- Indexes for table `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`groupID`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`locationID`);

--
-- Indexes for table `overtimes`
--
ALTER TABLE `overtimes`
  ADD PRIMARY KEY (`overTimeID`),
  ADD KEY `staffID` (`staffID`),
  ADD KEY `locationID` (`locationID`),
  ADD KEY `contractID` (`contractID`),
  ADD KEY `reasonID` (`reasonID`),
  ADD KEY `rateID` (`rateID`),
  ADD KEY `reasonCannotDoneID` (`reasonCannotDoneID`);

--
-- Indexes for table `rates`
--
ALTER TABLE `rates`
  ADD PRIMARY KEY (`rateID`);

--
-- Indexes for table `reasons`
--
ALTER TABLE `reasons`
  ADD PRIMARY KEY (`reasonID`);

--
-- Indexes for table `reasonscannotdone`
--
ALTER TABLE `reasonscannotdone`
  ADD PRIMARY KEY (`reasonCannotDoneID`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`roleID`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`taskID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`staffID`),
  ADD KEY `roleID` (`roleID`),
  ADD KEY `groupID` (`groupID`);

--
-- Indexes for table `usertask`
--
ALTER TABLE `usertask`
  ADD PRIMARY KEY (`staffID`,`taskID`),
  ADD KEY `taskID` (`taskID`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `overtimes`
--
ALTER TABLE `overtimes`
  ADD CONSTRAINT `overtimes_ibfk_1` FOREIGN KEY (`staffID`) REFERENCES `users` (`staffID`),
  ADD CONSTRAINT `overtimes_ibfk_2` FOREIGN KEY (`locationID`) REFERENCES `locations` (`locationID`),
  ADD CONSTRAINT `overtimes_ibfk_3` FOREIGN KEY (`contractID`) REFERENCES `contracts` (`contractID`),
  ADD CONSTRAINT `overtimes_ibfk_4` FOREIGN KEY (`reasonID`) REFERENCES `reasons` (`reasonID`),
  ADD CONSTRAINT `overtimes_ibfk_5` FOREIGN KEY (`rateID`) REFERENCES `rates` (`rateID`),
  ADD CONSTRAINT `overtimes_ibfk_6` FOREIGN KEY (`reasonCannotDoneID`) REFERENCES `reasonscannotdone` (`reasonCannotDoneID`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`roleID`) REFERENCES `roles` (`roleID`),
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`groupID`) REFERENCES `groups` (`groupID`);

--
-- Constraints for table `usertask`
--
ALTER TABLE `usertask`
  ADD CONSTRAINT `usertask_ibfk_1` FOREIGN KEY (`staffID`) REFERENCES `users` (`staffID`),
  ADD CONSTRAINT `usertask_ibfk_2` FOREIGN KEY (`taskID`) REFERENCES `tasks` (`taskID`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
