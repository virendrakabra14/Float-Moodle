CS251 Project on Float Moodle - Team Educare

Team Members: -
1. 200050048 - Hardik Rajpal
2. 200050107 - Pranjal Kushwaha
3. 200050119 - Rounak Dalmia
4. 200050157 - Virendra Kabra

Description: -
The project is an implementation of a learning management system. With customizable management features, it can be used to run courses for educators and trainers to achieve learning goals. It is a simpler model of the website MOODLE.

Table of Contents: -
1. What features have we implemented in it?
2. How to run the whole program?
3. How to use the backend part of the project?
4. Summary of the overall implementation procedure

1) What features have we implemented in it?
   It has all the required features which were asked for in the documentation. Namely,
   - Creating courses
   - Adding posts and assignments
   - Adding submissions by students
   - Forums for discussing posts
   - Autograding of the submissions (with python)
   - Grades and detailed feedback section
   - Command Line Interface
   - Email notifications for
     - New posts
     - New Assignments
     - Submission confirmation
     - Grade releases
     - Autograder's responses
     - OTP for password changes


2) How to run the whole program?
     - We have added a requirements.txt file inside the backend directory.
     - Inside the backend directory, we will suggest you to setup a virtual env with the requirements installed
     - After setting up the virtual env, checkout whether the program needs any migration by running the below command
          python3 manage.py makemigrations
     - If there is any migrations required, run the command
          python3 manage.py migrate
     - Now we are in our final step
          python3 manage.py runserver
     - You can now cntrl+click on the host website link



3) How to use the backend part of the project?
   The back end provides urls which along with get and post requests
   can be used to accomplish the common tasks in a learning management system,
   includeing but not limited to the features listed in (1)

4) Summary of the overall implementation procedure
   - For this, you can refer the Implementation.pptx
   - It contains the overall structure of our development of the website