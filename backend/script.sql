DROP DATABASE IF EXISTS dpadRobot;

CREATE DATABASE dpadRobot;
USE dpadRobot;

CREATE TABLE IF NOT EXISTS users (
    id int(11) NOT NULL AUTO_INCREMENT,
    username varchar(50),
    email varchar(250),
    password varchar(250),
    PRIMARY KEY (id,email)
);

CREATE TABLE IF NOT EXISTS record (
    id int(11) NOT NULL AUTO_INCREMENT,
    user int(11),
    PRIMARY KEY (id,user),
   FOREIGN KEY (user) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS movement (
    id int(11) NOT NULL AUTO_INCREMENT,
    arm varchar(50),
    radians varchar(250),
    id_record int(11),
    PRIMARY KEY (id),
   FOREIGN KEY (id_record) REFERENCES record(id)
);

CREATE TABLE IF NOT EXISTS position (
     id int(11) NOT NULL AUTO_INCREMENT,
    base varchar(50),
    arm1 varchar(50),
    arm2 varchar(50),
    arm3 varchar(50),
    head varchar(50),
    position varchar(50),
    id_record int(11),
    PRIMARY KEY (id),
   FOREIGN KEY (id_record) REFERENCES record(id)
);