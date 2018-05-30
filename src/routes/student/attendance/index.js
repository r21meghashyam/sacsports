import { h, Component } from 'preact';
import style from './style';
import { Link, Router } from 'preact-router';
import * as firebase from 'firebase';

export default class studentAttendance extends Component {
	tabs=[
		['Subject View','/student/attendance/subject-view'],
		['Date View','/student/attendance/date-view']
	];
	
	handleRoute(e){
		
		this.setState({ url: e.current.attributes.path });
		
	}
	constructor(props){
		super(props);
		this.handleRoute=this.handleRoute.bind(this);
	}
	render() {
		return (
			<div>
				<div class={style.title}>Student Attendance</div>
				<div class={style.tabs}>
					{
						this.tabs.map(i => <Link href={i[1]} class={this.state.url===i[1]?style.active:''}>{i[0]}</Link>)
					}
				</div>
				<div class={style.card+' '+style.regForm}>
					<Router onChange={this.handleRoute}>
						<DateView path="/student/attendance/date-view" />
						<SubjectView path="/student/attendance/subject-view"  default />
				
					</Router>
					
				</div>
			</div>
		);
	}
}

class SubjectView extends Component {
	state={
		classes: {},
		sub: {},
		staff: {}
	}
	constructor(props){
		super(props);
		let firestore = firebase.firestore();

		firebase.firestore().collection('subjects').onSnapshot(c => {
			let sub={};
			c.docs.map(i => sub[i.id]=i.data());
			this.setState({ sub });
		});

		firebase.firestore().collection('users').where('isStaff','==',true).onSnapshot(c => {
			let staff={};
			c.docs.map(i => staff[i.id]=i.data());
			this.setState({ staff });
			
		});


		firebase.auth().onAuthStateChanged(i => {
			//console.log("AUTH_CHANGE",this.state)
			firestore.collection('users').doc(firebase.auth().currentUser.phoneNumber).onSnapshot(doc => {
				//console.log("USER_DOC",this.state)
				let registerNumber = doc.data().registerNumber;
				firestore.collection('classes').onSnapshot(col => {
					//console.log("CLASSES_COL",this.state)
					col.docs.filter(doc => {
						
						if (doc.data().students){
							if (typeof(doc.data().students[registerNumber])==='string')
								return doc;
						}
						
					}).map(classSnapshot => {
						
						firestore.collection('attendance').where('class','==',classSnapshot.id).where('reg','==',registerNumber).onSnapshot(attendanceCol => {
							let present = 0;
							let absent = 0;
							let extra = 0;
							attendanceCol.docs.map(doc => {
								switch (doc.data().attendance){
									case 'P':present++;break;
									case 'A':
										firebase.firestore().collection('attendance').where('reg','==',registerNumber).where('attendance','==','E').onSnapshot(d => {
											
											let periodStart = doc.data().from;
											let periodEnd = doc.data().to;
											let flag=d.docs.filter(i => {
												let from = i.data().from;
												let to = i.data().to;
												if (to<periodStart||from>periodEnd)
													return;
												return i;
											});
											if (flag.length===0)
												absent++;
											else
												extra++;
											let subject = classSnapshot.data().subject;
											let classes =  this.state.classes;
											let percentage = Math.floor(((present+extra)*100/total))||0;
											classes[subject]=[classSnapshot.data().lecturers,total,present,absent,extra,percentage];
											this.setState({ classes });
										});
										break;
									
								}
							});
							let total = attendanceCol.size;
							let subject = classSnapshot.data().subject;
							let classes =  this.state.classes;
							let percentage = Math.floor(((present+extra)*100/total))||0;
							classes[subject]=[classSnapshot.data().lecturers,total,present,absent,extra,percentage];
							this.setState({ classes });
						});
						
					});
					
				});
			});
		});
		
	}
	render() {
		return (
			<div>
				<h1>Subject View</h1>
				<table>
					<tr>
						<th>Subject</th>
						<th>Lecturers</th>
						<th>Total</th>
						<th>Present</th>
						<th>Absent</th>
						<th>Extra</th>
						<th>Percentage</th>
					</tr>
					{
						Object.keys(this.state.classes).map(i => (<tr class={this.state.classes[i][5]<75?style.red:''}>
							<th>{this.state.sub[i].name}</th>
							<th>{this.state.classes[i][0].map(k => this.state.staff[k].displayName+', ')}</th>
							<th>{this.state.classes[i][1]}</th>
							<th>{this.state.classes[i][2]}</th>
							<th>{this.state.classes[i][3]}</th>
							<th>{this.state.classes[i][4]}</th>
							<th>{this.state.classes[i][5]}%</th>
						</tr>))
					}
				</table>
			</div>
		);
	}
}


const  DateView = () => (
	<div>
		<h1>Date View</h1>
				
	</div>
);
