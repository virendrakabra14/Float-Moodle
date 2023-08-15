#!/bin/bash
if [ "$1" = "" ]; then
echo 
    cat ./art.txt
    echo
    echo ::::::::::::::::::::::::::::::: Available Actions :::::::::::::::::::::::::::::
    echo ::::::::::::::::::::::::::::::::: Login : login :::::::::::::::::::::::::::::::
    echo :::::::::::::::::::::::::::::: View Profile : profile :::::::::::::::::::::::::
    echo :::::::::::::::::::::::::::::: List Courses : courses :::::::::::::::::::::::::
    echo :::::::::::: View Course Assignments : viewassignment \<courseCode\> ::::::::::::
    echo :::::::::::::::::::::::::::Usage: $./config.sh \<action\>::::::::::::::::::::::::
    exit 0
fi
USERFILE="/home/$USER/.config/educare/user.txt" #This will set by an install.sh script in a later release
SERVERROOT=https://educare-django.herokuapp.com/
#Login
if [ "$1" = "login" ]; then
    echo Please Enter Your UserID :
    read userid
    echo Please Enter Your Password :
    read password
    mkdir -p /home/pranjal/.config/educare/
    touch $USERFILE
    curl -s --location --request POST $SERVERROOT"users/auth/" \
        --header 'Content-Type: text/plain' \
        --data-raw '{"params": {"updates": [{"param":"userid", "value": "'$userid'", "op": "a"}, {"param": "password", "value": "'$password'", "op": "a"}] }}' >$USERFILE
    data=$(head -n 1 $USERFILE)
    if [ "$data" = '"User_DNE"' ]; then
        echo Not Authorised, Please Login Again
        exit 0
    else
        echo Login Successful
    fi
fi

if [ "$(head -n 1 $USERFILE)" = "" ]; then
    echo "Please login again"
    exit 0
fi
if [ ! -f "$USERFILE" ]; then
    echo "Please login again"
    exit 0
else
    data=$(head -n 1 $USERFILE)
    if [ "$data" = '"User_DNE"' ]; then
        echo Not Authorised, Please Login Again
        exit 0
    fi
fi

#View Profile
if [ "$1" = "profile" ]; then
    echo -e $(head -n 1 $USERFILE | python3 -c "import sys, json
userdata = json.load(sys.stdin)
print('Username : '+userdata['username'])
print(' ____ UserID : '+userdata['userID'])
if userdata['email']!='':
    print(' ____ Email : '+userdata['email'])")
    exit 0
fi

ID=$(head -n 1 $USERFILE | python3 -c "import sys, json
print(json.load(sys.stdin)['userID'])")

if [ "$1" = "courses" ]; then
    echo $(curl -s --location --request GET $SERVERROOT"courses/byuser/False/$ID/" \
        --data-raw '' | python3 -c "import sys, json
coursedata = json.load(sys.stdin)
print('Courses you attend :: ')
if len(coursedata)==0:
    print("None")
    exit(0)
for i in coursedata:
    print(i['courseCode']+'('+i['courseID']+') : '+['courseName'])")

    echo $(curl -s --location --request GET $SERVERROOT"courses/byuser/True/$ID/" \
        --data-raw '' | python3 -c "import sys, json
coursedata = json.load(sys.stdin)
print('Courses you instruct :: ')
if len(coursedata)==0:
    print("None")
    exit(0)
for i in coursedata:
    print(i['courseCode']+'('+i['courseID']+') : '+i['courseName'])")
    exit 0
fi

if [ "$1" = "viewassignment" ]; then
    if [ "$2" = "" ]; then
        echo Usage: $0 viewcourse \<CourseCode\>
        exit 0
    fi
    data=$(curl -s --location --request GET $SERVERROOT"assignments/$2/all/" \
        --data-raw '' | python3 -c "import sys, json
assigndata = json.load(sys.stdin)
if assigndata == 'Course_DNE':
    print('Course does not exist, please check the course code')
else:
    for i in assigndata:
        print('Assignment :: '+str(i['number']+1))
        print('Title : '+i['title'])
        print('Instruction : '+i['instruction'])
        print('Release date : '+i['releaseDate'])
        print('Due date : '+i['dueDate'])
        if i['files']:
            print('Additional Material : '+i['files'])
        print('*****************************************************************************************')")
    cat <<<"$data"
fi
