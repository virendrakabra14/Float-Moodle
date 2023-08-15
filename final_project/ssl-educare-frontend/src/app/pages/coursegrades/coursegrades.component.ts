import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AssignmentService } from 'src/app/services/assignment.service';
import { CourseService } from 'src/app/services/course.service';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);


@Component({
  selector: 'app-coursegrades',
  templateUrl: './coursegrades.component.html',
  styleUrls: ['./coursegrades.component.css']
})
export class CoursegradesComponent implements OnInit,AfterViewInit{

  constructor(private courseService:CourseService, private taskService:AssignmentService, private route:ActivatedRoute) { }

  courseData:any[] = [];
  courseCode: any;
  courseName: any;
  labels:any[] = [];
  count:any[] = [];
  data:any[] = [];
  taskGrades:any[] = [];
  courseGrades:any[] = [];

  isStudent: any;
  isInstructor: any;

  canvas1: any;     // student
  ctx1: any;
  Chart1: any;
  show1: boolean = false;
  warningType: number = -1;

  canvas2: any;     // teacher
  ctx2: any;
  Chart2: any;
  show2: boolean = false;

  canvas3: any;     // hist
  ctx3: any;
  Chart3: any;
  show3: boolean = false;

  canvas4:any[] = [];
  ctx4:any[] = [];
  Chart4:any[] = [];
  show4: boolean[] = [];

  gradedAssignments:any[] = [];
  assignmentRankLists:any[] = [];

  ngOnInit(): void {

    let courseid = JSON.parse(JSON.stringify(this.route.snapshot.paramMap.get('coursecode') || '{}'));
    let userid = localStorage.getItem('userid')!;

    this.courseService.getCourseData(courseid).subscribe(courseData=>{
      this.courseData = courseData;
      // console.log('courseData');
      // console.log(this.courseData);

      this.isStudent = false;
      this.isInstructor = false;

      for (let key in this.courseData) {
        if (key=='courseCode') {
          this.courseCode = this.courseData[key];
        }
        if (key=='courseName') {
          this.courseName = this.courseData[key];
        }
        if (key=='instructors') {
          if (courseData[key].includes(userid)) {
            this.isInstructor = true;
          }
        }
        else if (key=='students') {
          if (courseData[key].includes(userid)) {
            this.isStudent = true;
          }
        }
      }

      console.log(this.isInstructor);
    
    })

    this.taskService.getGradesData(courseid, userid).subscribe(data=>{

      console.log(data);
      this.data = data;
      this.taskGrades = data.taskGrades;
      this.courseGrades = data.courseGrades;
      
      if (this.isStudent) {
        this.canvas1 = document.getElementById('studentCanvas');
        this.ctx1 = this.canvas1.getContext('2d');
      }

      var data_student = [], data_avg = [], data_variance = [];
      var cumulScore, meanscore, variance, rankList = [];

      for (let key in this.courseGrades) {            // courseGrades
        if (key=='cumulScore') {
          cumulScore = this.courseGrades[key];
        }
        else if (key=='meanscore') {
          meanscore = this.courseGrades[key];
        }
        else if (key=='variance') {
          variance = this.courseGrades[key];
        }
        else if (key=='rankList') {
          rankList = this.courseGrades[key];
        }
      }

      // use colors repeatedly
      var backgroundColors = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(153, 102, 255, 0.2)'
      ],
      borderColors = [
        'rgba(255, 99, 132, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(153, 102, 255, 1)'
      ];

      var count1 = 0;

      for (let i=0; i<this.taskGrades.length; i++) {          // taskGrades

        if (this.taskGrades[i].Graded == true) {

          this.labels.push(this.taskGrades[i].task);
          data_student.push(this.taskGrades[i].score);
          data_avg.push(this.taskGrades[i].meanscore);
          data_variance.push(this.taskGrades[i].variance);

          this.assignmentRankLists.push(this.taskGrades[i].rankList);
          this.gradedAssignments.push(i);
          this.show4.push(false);
          this.count.push(count1);
          count1++;

        }
      }

      // console.log(this.assignmentRankLists);
      // console.log(this.gradedAssignments);
      // console.log('count');
      // console.log(this.count);

      if (this.isStudent) {

        console.log(cumulScore/meanscore);
        if (cumulScore/meanscore <= 0.3) this.warningType = -1;
        else if (cumulScore/meanscore <= 0.7) this.warningType = 0;
        else this.warningType = 1;

        this.Chart1 = new Chart(this.ctx1, {
          type: 'bar',
          data: {
              labels: this.labels,
              datasets: [{
                  type: 'bar',
                  label: 'Your Score',
                  data: data_student,
                  backgroundColor: backgroundColors,
                  borderColor: borderColors,
                  borderWidth: 1
              }, {
                  type: 'line',
                  label: 'Average Score',
                  data: data_avg,
                  fill: false,
                  borderColor: 'rgb(75, 192, 192)',
                  tension: 0.1,
                  pointStyle: 'circle',
                  pointRadius: 7,
                  pointBackgroundColor: 'rgba(75, 192, 192)',
              }]
          },
          options: {
              scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Assignments, Assessments',
                    }
                  },
                  y: {
                      beginAtZero: true,
                      // suggestedMax: 100,
                      title: {
                        display: true,
                        text: 'Score',
                      }
                  }
              },
              responsive: false,          // to rescale
              plugins: {
                  title: {
                      display: true,
                      text: 'Overalls for this course',
                      color: 'blue'
                  },
                  subtitle: {
                      display: true,
                      text: 'Your Cumulative Score: '+cumulScore+', Cumulative Mean Score: '+meanscore,
                      color: 'blue',
                      font: {
                        size: 12,
                        weight: 'normal',
                        style: 'italic'
                      },
                      padding: {
                        bottom: 10
                      }
                  },
                  legend: {
                      display: true,
                      labels: {
                          color: 'rgb(0, 0, 0)'
                      }
                  }
              }
          }
      });

    }

    if (this.isInstructor) {

      this.canvas2 = document.getElementById('teacherCanvas');
      this.ctx2 = this.canvas2.getContext('2d');
      this.Chart2 = new Chart(this.ctx2, {
        type: 'bar',
          data: {
              labels: this.labels,
              datasets: [{
                  type: 'bar',
                  label: 'Average Score',
                  data: data_avg,
                  backgroundColor: backgroundColors,
                  borderColor: borderColors,
                  borderWidth: 1,
                  yAxisID: 'y',
              }, {
                  type: 'line',
                  label: 'Variance',
                  data: data_variance,
                  fill: false,
                  borderColor: 'rgba(75, 192, 192)',
                  tension: 0.1,
                  yAxisID: 'y1',
                  pointStyle: 'circle',
                  pointRadius: 7,
                  pointBackgroundColor: 'rgba(75, 192, 192)',
              }]
          },
          options: {
              scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Assignments, Assessments',
                    }
                  },
                  y: {
                      type: 'linear',
                      display: true,
                      position: 'left',
                      title: {
                        display: true,
                        text: 'Average Score'
                      }
                  },
                  y1: {
                      type: 'linear',
                      display: true,
                      position: 'right',
                      grid: {
                          drawOnChartArea: false, // don't show grid lines for right axis
                      },
                      title: {
                        display: true,
                        text: 'Variance'
                      }
                  }
              },
              responsive: false,          // to rescale
              plugins: {
                  title: {
                      display: true,
                      text: 'Overalls for this course',
                      color: 'rgb(0, 0, 255)'
                  },
                  subtitle: {
                      display: true,
                      text: 'Mean Score: '+meanscore+', Variance: '+variance,
                      color: 'blue',
                      font: {
                        size: 12,
                        weight: 'normal',
                        style: 'italic'
                      },
                      padding: {
                        bottom: 10
                      }
                  },
                  legend: {
                      display: true,
                      labels: {
                          color: 'black',
                          // usePointStyle: true,
                      }
                  }
              }
          }
      });

      }

      if (this.isInstructor) {

      var temp, temp1, done = false, data_temp = [], data_hist = Array();

      for (let i=0; i<rankList.length; i++) {     // rankList is array of single-entry dictionaries

        for (let key in rankList[i]) {
          temp = rankList[i][key];
          data_temp.push(temp);
        }

      }

      // console.log('data temp');
      // console.log(data_temp);

      temp = Math.max(...data_temp);          // max score in current lot

      for (let i=0; i<data_temp.length; i++) {

        done = false;

        temp1 = (Math.ceil(data_temp[i])+Math.floor(data_temp[i]))/2;
        if (temp1 % 1 == 0) {                         // integral score in which bin?
          if (temp1 == temp)
            temp1 -= 0.5;
          else
            temp1 += 0.5;
        }

        for (let j=0; j<data_hist.length; j++) {      // is bin already initialized?
          if (data_hist[j]['x'] == temp1) {
            data_hist[j]['y'] += 1;
            done = true;
            break;
          }
        }

        if (!done) data_hist.push({x: temp1, y:1});

      }
      // console.log('data hist');
      // console.log(data_hist);

      this.canvas3 = document.getElementById('histCanvas');
      this.ctx3 = this.canvas3.getContext('2d');
      this.Chart3 = new Chart(this.ctx3, {
        type: 'bar',
          data: {
              labels: [],
              datasets: [{
                  type: 'bar',
                  label: 'No. of Students',
                  data: data_hist,
                  backgroundColor: backgroundColors,
                  borderColor: borderColors,
                  borderWidth: 1,
                  yAxisID: 'y',
                  barPercentage: 1,
                  categoryPercentage: 1,
              }]
          },
          options: {
              scales: {
                  x: {
                    type: 'linear',
                    offset: false,
                    grid: {
                      offset: false,
                    },
                    title: {
                      display: true,
                      text: 'Scores',
                    },
                    ticks: {
                      stepSize: 1,
                    },
                  },
                  y: {
                      type: 'linear',
                      display: true,
                      position: 'left',
                      title: {
                        display: true,
                        text: 'No. of students',
                      },
                      ticks: {
                        stepSize: 1,
                      },
                  },
              },
              responsive: false,          // to rescale
              plugins: {
                  title: {
                      display: true,
                      text: 'Histogram : Cumulative scores of all Students',
                      color: 'rgb(0, 0, 255)'
                  },
                  legend: {
                    display: true,
                    labels: {
                        color: 'black',
                    }
                  },
                  tooltip: {
                    callbacks: {
                      title: (items) => {
                        const item = items[0];
                        const x = item.parsed.x;
                        const min1 = Math.floor(x), max1 = Math.ceil(x);
                        return min1.toString()+'-'+max1.toString();
                      }
                    }
                  },
              }
          }
      });

      }

    })
  }

  ngAfterViewInit(): void {


    let courseid = JSON.parse(JSON.stringify(this.route.snapshot.paramMap.get('coursecode') || '{}'));
    let userid = localStorage.getItem('userid')!;

    this.taskService.getGradesData(courseid, userid).subscribe(data=>{

      if (this.isInstructor) {

      console.log(data);

      var backgroundColors = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(153, 102, 255, 0.2)'
      ],
      borderColors = [
        'rgba(255, 99, 132, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(153, 102, 255, 1)'
      ];

      var temp, temp1, done = false, data_temp1 = Array(), data_hist1 = Array();

      for (let k=0; k<this.gradedAssignments.length; k++) {     // one histogram for each graded assignment

        data_temp1[k] = [];
        data_hist1[k] = [];

        for (let i=0; i<this.assignmentRankLists[k].length; i++) {
    
          for (let key in this.assignmentRankLists[k][i]) {
            temp = this.assignmentRankLists[k][i][key];    
            data_temp1[k].push(temp);
          }
    
        }
    
        // console.log('data temp1[k]');
        // console.log(data_temp1[k]);
    
        temp = Math.max(...data_temp1[k]);          // max score in current lot
    
        for (let i=0; i<data_temp1[k].length; i++) {
    
          done = false;
    
          temp1 = (Math.ceil(data_temp1[k][i])+Math.floor(data_temp1[k][i]))/2;
          if (temp1 % 1 == 0) {
            if (temp1 == temp)
              temp1 -= 0.5;
            else
              temp1 += 0.5;
          }
    
          for (let j=0; j<data_hist1[k].length; j++) {      // is bin already initialized?
            if (data_hist1[k][j]['x'] == temp1) {
              data_hist1[k][j]['y'] += 1;
              done = true;
              break;
            }
          }
    
          if (!done) data_hist1[k].push({x: temp1, y:1});
    
        }
        // console.log('data hist1[k]');
        // console.log(data_hist1[k]);

        this.canvas4[k] = document.getElementById(this.gradedAssignments[k]);
        this.ctx4[k] = this.canvas4[k].getContext('2d');
        this.Chart4[k] = new Chart(this.ctx4[k], {
          type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    type: 'bar',
                    label: 'No. of Students',
                    data: data_hist1[k],
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                    yAxisID: 'y',
                    barPercentage: 1,
                    categoryPercentage: 1,
                }]
            },
            options: {
                scales: {
                    x: {
                      type: 'linear',
                      offset: false,
                      grid: {
                        offset: false,
                      },
                      title: {
                        display: true,
                        text: 'Scores',
                      },
                      ticks: {
                        stepSize: 1,
                      },
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                          display: true,
                          text: 'No. of students',
                        },
                        ticks: {
                          stepSize: 1,
                        },
                    },
                },
                responsive: false,          // to rescale
                plugins: {
                    title: {
                        display: true,
                        text: 'Histogram : Scores in ' + this.taskGrades[this.gradedAssignments[k]]['task'],
                        color: 'rgb(0, 0, 255)'
                    },
                    subtitle: {
                        display: true,
                        text: ['Weight: '+this.taskGrades[this.gradedAssignments[k]]['weight']+',', 'Mean Score: '+this.taskGrades[this.gradedAssignments[k]]['meanscore']+', Variance: '+this.taskGrades[this.gradedAssignments[k]]['variance']],
                        color: 'blue',
                        font: {
                          size: 12,
                          weight: 'normal',
                          style: 'italic'
                        },
                        padding: {
                          bottom: 10
                        }
                    },
                    legend: {
                      display: true,
                      labels: {
                          color: 'black',
                      }
                    },
                    tooltip: {
                      callbacks: {
                        title: (items) => {
                          const item = items[0];
                          const x = item.parsed.x;
                          const min1 = Math.floor(x), max1 = Math.ceil(x);
                          return min1.toString()+'-'+max1.toString();
                        }
                      }
                    },
                }
            }
        });

      }
    }

    })
  }


}