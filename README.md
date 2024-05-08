# Introduction

Coding Challenge – Backend Developer

# Description

Build a CSV to JSON convertor API. Each row in the CSV file will represent one object and a file
with multiple rows will be converted to a list of objects.
The fields in the csv files will be properties inside the object. A complex property will be named
with a dot (.) separator.
Following properties will mandatorily be available in each record at the beginning.
name.firstName, name.lastName, age

Once the records are uploaded to the DB the application should calculate the age distribution
of all users and print following report on console.

| Age-Group | % Distribution |
| ------ | ------ |
| < 20 | 20 |
| 20 to 40 | 45 |
| 40 to 60 | 25 |
| > 60 | 10 |

## Please note
- First line in the csv file will always be labels for the properties
- Number of records in the file can go beyond 50000
- You can have properties with infinite depth. (a.b.c.d........z.a1.b1.c1.....)
- All sub-properties of a complex property will be placed next to each other in the file.

# Steps to run the project

1) Clone from github
   
2) Navigate to the folder using the following command: ```cd kelp_task```
   
3) Run the following command: ```npm install```
4) Create a .env file with the following fields
    ```
    PORT=3000
    FILE=record.csv
    PG_USER=<YOUR_USERNAME>
    PG_PASSWORD=<YOUR_PASSWORD>
    PG_HOST=localhost
    PG_DB=<YOUR_DB>
    PG_PORT=5432
    ```
5) Create a table in your postgresql database by running the following query:
    ```CREATE TABLE public.users (
    "name" varchar NOT NULL,
    age int4 NOT NULL,
    address jsonb NULL,
    additional_info jsonb NULL,
    id serial4 NOT NULL
    );
    ```
6) Run the application using the following command: ```node index.js```
7) Open your browser or postman & hit the following api url: ```http://localhost:3000/convert-csv```