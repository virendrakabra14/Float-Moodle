# Educare

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.7.


## Installation
Run `npm i` in the same directory as package.json files to install all dependencies
## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
## Features Overview:
- Registration and login dependent on uniques alphanumeric user ID's, like roll numbers.
- Edit details in your profile after registration and change the password (this requires an otp sent to your registered email id on request)
- Create Courses with a code, name and a config file which follows the format below:
(Excluding the ###...###)

#######################Config.txt###########################
<pre>
{"instructors":["200050006"],
"wizards":["200050012","200050048"],
"students":["200050001","200050008"]
}
</pre>
##########################################################

- Role based permissions: student < wizards < instructors
    - Further distinction between wizards of levels 1, 2 and 3, editable by the instructor and wizards of level 3.
    - Students can access posts and assignments in a course and make submissions.
    - Instructors can:
        - add/remove students/instructors/wizards, edit permissions levels of wizards.
        - create assignments and posts, download submissions, upload feedback and autograders
    - Wizards:3 can do everything the instructors do except:
        - adding/removing professors.
    - Wizards:2 can do everything the wizards:3 do except:
        - creating assignments
        - editing any memberlist
    - Wizards:1 can do everything the wizards:2 do except:
        - creating posts.<br>
        (Wizards:1 can only download submissions and upload feedback)


- Create Posts and Assignments for existing courses in which you are an instructor or wizard of sufficient prowess.
- Disable/participate in discussions on posts.
- Edit/delete existing posts and assignments.
- Make submissions to assignments as a student, add comments to your submissions.
- Submit Feedback for submissions as an instructor or wizard using an autograding script (whose guidelines are mailed
    on failure of a script) or manually using a file with the format below:
(Excluding the ###...###)

######################Feedback.txt##########################
<pre>
{"200050004":{
"feedback": "Stay two ghosts, pony bro.",
"grade":"10.0"
},
"200050005":{
"feedback": "Stay canyon moon, pony guy.",
"grade":"4.2"
},
"200050001":{
"feedback": "Stay golden, pony boy.",
"grade":"6.3"
}
}
</pre>
##########################################################

- Release grades (or retract them) for graded assignments.
- Download member data tables, with information like grades and email ids.
- Study the grading statistics under Grades for your courses with:
    - Assignmentwise histograms, mean and variance results.
    - (Weighted) Cumulative score reports.
