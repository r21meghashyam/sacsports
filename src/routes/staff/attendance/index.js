import { h, Component } from 'preact';
import style from './style';
import { Link, Router } from 'preact-router';
import * as firebase from 'firebase';
import { Info, input ,store, empty, convertToDate } from '../../../lib';

export default class staffAttendanceManagement extends Component {
	tabs=[
		['Add Class Attendance','/staff/attendance/add-class-attendance'],
		['Add Extra Attendance','/staff/attendance/add-extra-attendance'],
		['View Class Attendance','/staff/attendance/view-class-attendance'],
		['View Extra Attendance','/staff/attendance/view-extra-attendance']
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
				<div class={style.title}>Attendance Management</div>
				<div class={style.tabs}>
					{
						this.tabs.map(i => <Link href={i[1]} class={this.state.url===i[1]?style.active:''}>{i[0]}</Link>)
					}
				</div>
				<div class={style.card+' '+style.regForm}>
					<Router onChange={this.handleRoute}>
						<AddClassAttendance path="/staff/attendance/add-class-attendance" default />
						<AddExtraAttendance path="/staff/attendance/add-extra-attendance" />
						<ViewClassAttendance path="/staff/attendance/view-class-attendance" />
						<ViewExtraAttendance path="/staff/attendance/view-extra-attendance" />
				
					</Router>
					
				</div>
			</div>
		);
	}
}

class AddClassAttendance extends Component {
	state={
		classes: [],
		students: [],
		attendance: {},
		submitButtonText: 'Save',
		loadButtonText: 'Load',
		excluded: {},
		classesList: {},
		subjects: {},
		staffs: {}
	}
	
	save(e){
		e.preventDefault();
		this.setState({ submitButtonText: 'Saving...' });
		try {
			if (empty(this.state.class))
				throw 'Please select your class.';
			if (empty(this.state.from))
				throw 'Please enter start time.';
			if (empty(this.state.to))
				throw 'Please enter end time.';
			let batch = firebase.firestore().batch();
			let from = Math.floor((new Date(this.state.from)).getTime()/1000);
			let to = Math.floor((new Date(this.state.to)).getTime()/1000);
			Object.keys(this.state.attendance).map(i => {
				batch.set(firebase.firestore().collection('attendance').doc(this.state.class+'-'+i+'-'+to),{
					class: this.state.class,
					from,
					to,
					reg: i,
					attendance: this.state.attendance[i]?'P':'A'
				});
			});
			let doc = firebase.firestore().collection('classes').doc(this.state.class);
			//console.log('CLASSES');
			let k=doc.onSnapshot(d => {
				let total = ++d.data().total||0;
				
				if (!this.state.resave)
					batch.set(doc,{ total },{ merge: true });
				batch.commit().then(() => {
					//console.log('batch');
					this.setState({ infoType: 'success',infoMessage: 'Save sucessfull.',submitButtonText: 'Save' });
				},(e) => {
					this.setState({ infoType: 'error',infoMessage: 'Failed to save. Reason: '+e.message,submitButtonText: 'Save' });
				});
				k();
			
			});
			
			
		}
		catch (msg){
			this.setState({ infoMessage: msg,infoType: 'error',submitButtonText: 'Save' });
		}
	}
	loadClass(e){
		input(e);
		this.load();
	}
	load(e){
		e&&e.preventDefault();
		this.setState({ loadButtonText: 'Loading...' });
		
		firebase.firestore().collection('classes').doc(this.state.class).onSnapshot(d => {
			let students=d.data().students||{};
			this.setState({ students,attendance: {} });
			//console.log("CONDITION");
			if (!this.state.class||!this.state.from||!this.state.to){
				this.setState({ loadButtonText: 'Load' });
				return;
			}
				
			this.setState({ excluded: {} });
			//console.log("CHECKING FOR EXCLUSION");
			let ft = Math.floor((new Date(this.state.from)).getTime()/1000);
			let tt= Math.floor((new Date(this.state.to)).getTime()/1000);
			Object.keys(this.state.students).map(l => {
				firebase.firestore().collection('attendance').where('reg','==',l).onSnapshot(j => {
					j.docs.filter(i => {
						//console.log("COMPARE_CLASS",i.data().class,this.state.class);
						if (i.data().class===this.state.class&&i.data().from===ft&&i.data().to===tt){
							let attendance=this.state.attendance;
							attendance[l]=i.data().attendance==='P';
							this.setState({ attendance });
							//console.log(this.state);
							return;
						}
						let aft = i.data().from;
						let att = i.data().to;
						if (att<ft||tt<aft)
							return;
						let excluded = this.state.excluded;
						let students= this.state.students;
						let attendance = this.state.attendance;
						delete students[l];
						
						if (i.data().attendance==='E'){
							excluded[l]=[i.data().attendance,i.data().reason,i.data().from,i.data().to,i.data().lecturer];
							attendance[l]=false;
						}
						else
							excluded[l]=[i.data().attendance,i.data().class,i.data().from,i.data().to];
						let resave = !!(Object.keys(students).length);
							
						this.setState({ students,attendance,excluded,resave });
					});
						
						
					this.setState({ loadButtonText: 'Load' });
				});
			});
		});
	}
	toggleCheckbox(e){
		let attendance = this.state.attendance;
		attendance[e.target.name]=!attendance[e.target.name];
		this.setState({ attendance });
	}

	handleFrom(e){
		input(e);
		let from = this.state.from;
		let to = (new Date((new Date(from)).getTime()+3300000+(330*60*1000))).toISOString().split('.')[0];
		this.setState({ to });
		this.load();
	}

	toggleAttendance(e){
		e.preventDefault();
		let attendance = this.state.attendance;
		Object.keys(this.state.students).map(i => attendance[i]=!attendance[i]);
		this.setState({ attendance });
	}
	
	handleCheckbox(e){
		let attendance = this.state.attendance;
		let reg = e.target.parentElement.getAttribute('data');
		attendance[reg]=!attendance[reg];
		this.setState({ attendance });
	}
	constructor(props){
		super(props);
		this.save=this.save.bind(this);
		this.loadClass=this.loadClass.bind(this);
		this.handleFrom=this.handleFrom.bind(this);
		this.toggleAttendance=this.toggleAttendance.bind(this);
		this.toggleCheckbox=this.toggleCheckbox.bind(this);
		this.load=this.load.bind(this);
		this.handleCheckbox=this.handleCheckbox.bind(this);
		store.dispatch({ type: 'FORM_CHANGE',form: this });
		let firestore = firebase.firestore();
		let d= new Date();
		let year = d.getFullYear();
		let yearString = year+'-'+(year+1);
		if (d.getMonth()<=3)
			yearString=(year-1)+'-'+year;
		firebase.auth().onAuthStateChanged(i => {
			if (i)
				firebase.firestore().collection('users').doc(firebase.auth().currentUser.phoneNumber).onSnapshot((d) => {
				
					Object.keys(d.data().classes).map(i => {
					//console.log(i);
						firebase.firestore().collection('classes').doc(i).onSnapshot(i => {

						
							if (i.exists){
								let subject = i.data().subject;
								let section = i.data().section;
								let id = i.id;
								firebase.firestore().collection('subjects').doc(subject).onSnapshot(i => {
									let classes = this.state.classes;
									classes.push([id,i.data().name,section]);
									this.setState({ classes });
								});
							}
						});
					});
				});
		});

		firestore.collection('users').where('isStaff','==',true).orderBy('dateAdded','desc').onSnapshot((d) => {
			let staffs={};
			d.forEach((i) => {
				staffs[i.id]=[i.data().displayName,i.data().department];
				this.setState({ staffs });
			});
		});
		
		
		firestore.collection('classes').where('year','==',yearString).onSnapshot((d) => {
			let classesList={};
			d.forEach((i) => {
				classesList[i.id]=[i.data().subject,i.data().section,i.data().lecturers];
				this.setState({ classesList });
			});
		});

		firestore.collection('subjects').onSnapshot((d) => {
			let subjects={};
			d.forEach((i) => {
				subjects[i.id]=[i.data().name,i.data().code];
				this.setState({ subjects });

			});
			//console.log(this.state.subjects);
		});
	}
	render() {
		return (
			<div>
				<h1>Add Class attendance</h1>
				<form onSubmit={this.save}>
			
				
					<div class={style.padding}>
						Select Class:
						<select name="class" value={this.state.class} onChange={this.loadClass}>
							{
								this.state.classes.map(i => <option value={i[0]}>{i[1]+' - '+i[2]}</option>)
							}
						</select>

					</div>
					<div class={style.padding}>
						Time:
						From <input type="datetime-local" name="from" value={this.state.from} onChange={this.handleFrom} /> to <input type="datetime-local" name="to" value={this.state.to} onChange={input} />
						
					</div>
					
					{Object.keys(this.state.excluded).length?<table>
						<caption>Excluded</caption>
						<tr><th>Attendance</th><th>Register Number</th><th>Name</th><th>Reason</th><th>Lecutrer</th><th>From</th><th>To</th></tr>
						{
							Object.keys(this.state.excluded).map(i =>
								(<tr>
									<td>{this.state.excluded[i][0]}</td>
									<td>{i}</td>
									<td>{this.state.students[i]}</td>
									<td>{this.state.excluded[i][0]==='E'?this.state.excluded[i][1]:this.state.subjects[this.state.classesList[this.state.excluded[i][1]][0]][0]}</td>
									<td>{this.state.excluded[i][0]==='E'?this.state.staffs[this.state.excluded[i][4]][0]:this.state.classesList[ this.state.excluded[i][1]][2].map(i => <div>{this.state.staffs[i][0]}</div>)}</td>
									<td>{convertToDate(this.state.excluded[i][2]*1000)}</td>
									<td>{convertToDate(this.state.excluded[i][3]*1000)}</td>
								</tr>)
							)
						}
					</table>:''}
					<div class={style.padding}>
						<button onClick={this.load}>{this.state.loadButtonText}</button><button onCLick={this.toggleAttendance}>Toggle attendance</button>
					</div>
					<table>
						<tr>
							<th>Status</th>
							<th>Register Number</th>
							<th>Name</th>
						</tr>
						{Object.keys(this.state.students).map((i,j) =>
							(<tr onClick={this.handleCheckbox} data={i}>
								<th><input type="checkbox" onClick={this.toggleCheckbox}  name={i} checked={this.state.attendance[i]} /></th>
								<th>
									{i}
								</th>
								<th>
									{this.state.students[i]}
								</th>
								
							</tr>)
						)
						}
					</table>
					<div>
						<Info that={this} />
					</div>
					<div class={style.padding}>
						<button>{this.state.submitButtonText}</button>
					</div>
				</form>
			</div>
		);
	}
}


class AddExtraAttendance extends Component {
	//default state
	state={
		students: {},
		addButtonText: 'Add',
		saveButtonText: 'Save'
	}
	
	
	addRegisterNumber(e){
		e.preventDefault();
		try {
			if (empty(this.state.reg))
				throw 'Please enter register number';
			if (empty(this.state.from))
				throw 'Please enter from date';
			if (empty(this.state.to))
				throw 'Please enter to date';

			
			//convert date from datetime picker to timestamp
			let from = Math.floor((new Date(this.state.from)).getTime()/1000);
			let to= Math.floor((new Date(this.state.to)).getTime()/1000);

			//Change add button text to Adding...
			this.setState({ addButtonText: 'Adding..' });

			//select all previous attendance of current register number
			firebase.firestore().collection('attendance').where('reg','==',this.state.reg).onSnapshot(col => {
				//traverse through each document (given attendance) & return number of classes that
				//particular student has already attended within the date range
				let matches = col.docs.filter(doc => {
					//documents from & to date
					let docFrom = doc.data().from;
					let docTo = doc.data().to;

					//check if the document dates fall out of selected date range & ignore them.
					if (docTo<from||to<docFrom)
						return;
					
					//if the student is given absent, ingore them.
					if (doc.data().attendance==='A')
						return;
					
					//Return classes that the student has already for present attendance.
					return doc;
				});

				//if there contain classes attendance is alredy given.
				if (matches.length)
					//show error message that the student cannot be given extra attendance.
					this.setState({ infoType: 'error',infoMessage: this.state.reg+' has already got attendance for '+matches.length+' classes.' });
				else {
					//else, add the student to the list
					
					//create a copy of students list
					let students = this.state.students;
					//add particular student.
					students[this.state.reg]=true;

					//update state student list, clear register number textbox & error messages.
					this.setState({ students,reg: '',infoMessage: null });
				}
				this.setState({ addButtonText: 'Add' });
			});

			
		}
		catch (e){
			//catch any error thrown & displays it in INFO element.
			this.setState({ infoType: 'error',infoMessage: e,addButtonText: 'Add' });
		}
	}

	removeStudent(e){
		e.preventDefault();
		let students = this.state.students;
		delete students[e.target.getAttribute('data')];
		this.setState({ students });
	}

	handleFromDate(e){
		input(e);
		let from = this.state.from;
		let to = (new Date((new Date(from)).getTime()+3300000+(330*60*1000))).toISOString().split('.')[0];
		this.setState({ to,students: {} });
	}

	save(e){
		this.setState({ infoMessage: '' });
		e.preventDefault();
		try {
			//if reason textbox is left blank.
			if (empty(this.state.reason))
				throw 'Please enter reason';
			
			//if from date is not selected.
			if (empty(this.state.from))
				throw 'Please enter from time';

			//if to date is not selected.
			if (empty(this.state.to))
				throw 'Please enter to time';

			//if students are not entered.
			if (Object.keys(this.state.students).length===0)
				throw 'Please enter students';
				
			//create a new firebase batch object
			let batch = firebase.firestore().batch();

			//convert date from datetime picker to timestamp
			let from = Math.floor((new Date(this.state.from)).getTime()/1000);
			let to = Math.floor((new Date(this.state.to)).getTime()/1000);
			
			//Traverse through each student
			Object.keys(this.state.students).map(registerNumber => {
				//create a new document to add attendance
				batch.set(firebase.firestore().collection('attendance').doc(firebase.auth().currentUser.phoneNumber+'-'+registerNumber+'-'+to),{
					from,
					to,
					reg: registerNumber,
					attendance: 'E',
					reason: this.state.reason,
					lecturer: firebase.auth().currentUser.phoneNumber
				});
			});
			batch.commit().then(() => {
				this.setState({ infoType: 'success',infoMessage: 'Save sucessfull.',saveButtonText: 'Save' });
			},(e) => {
				this.setState({ infoType: 'error',infoMessage: 'Failed to save. Reason: '+e.message,saveButtonText: 'Save' });
			});
		}
		catch (error) {
			this.setState({ infoType: 'error',infoMessage: error, saveButtonText: 'Save' });
		}
	}
	constructor(props){
		super(props);

		//binding class to methods
		this.addRegisterNumber=this.addRegisterNumber.bind(this);
		this.removeStudent=this.removeStudent.bind(this);
		this.handleFromDate=this.handleFromDate.bind(this);
		this.save=this.save.bind(this);

		//passing component state to handle input  using redux
		store.dispatch({ type: 'FORM_CHANGE',form: this });
	}

	render() {
		
		return (
			<div>
				<h1>Add Extra attendance</h1>
				<form onSubmit={this.save}>
					<div class={style.padding}>
					Reason: <textarea type="text" name="reason"  onChange={input}>{this.state.reason}</textarea>
					</div>
					<div class={style.padding}>
						Time:
						From <input type="datetime-local" name="from" value={this.state.from} onChange={this.handleFromDate} /> to <input type="datetime-local" name="to" value={this.state.to} onChange={input} />
					</div>
					<div class={style.padding}>
						Register Number:
						<input type="text" name="reg" value={this.state.reg} onChange={input} />
						<button onClick={this.addRegisterNumber}>{this.state.addButtonText}</button>
					</div>

					<table>
						<tr>
							<th>Register Numbers</th>
							<th />
						</tr>
						{
							Object.keys(this.state.students).map(i => <tr><td>{i}</td><td><button data={i} onClick={this.removeStudent}>Remove</button></td></tr>)
						}
						
					</table>
					<Info that={this} />
					<button onClick={this.save}>{this.state.saveButtonText}</button>
				</form>
			</div>
		);
	}
}


class ViewClassAttendance extends Component {
	state={
		classes: [],
		students: {}
	}

	
	loadAttendance(e){
		input(e);
		firebase.firestore().collection('attendance').where('class','==',this.state.class).onSnapshot(c => {
			let students={};
			c.docs.map(doc => {
				students[doc.data().reg]=students[doc.data().reg]||{};
				let present = students[doc.data().reg].present||0;
				let absent = students[doc.data().reg].absent||0;
				let extra = students[doc.data().reg].extra||0;
				if (doc.data().attendance==='P')
					present++;
				else
					firebase.firestore().collection('attendance').where('reg','==',doc.data().reg).where('attendance','==','E').onSnapshot(d => {
			
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
						let percentage = Math.floor((present+extra)*100/(present+absent+extra));
						students[doc.data().reg]={ present,absent,extra,percentage };
						this.setState({ students });
					});
				let percentage = Math.floor((present+extra)*100/(present+absent+extra));
				students[doc.data().reg]={ present,absent,extra,percentage };
			});
			this.setState({ students });
		});
	}
	constructor(props){
		super(props);
		this.loadAttendance=this.loadAttendance.bind(this);
		store.dispatch({ type: 'FORM_CHANGE',form: this });

		firebase.auth().onAuthStateChanged(i => {
			if (i)
				firebase.firestore().collection('users').doc(firebase.auth().currentUser.phoneNumber).onSnapshot((d) => {
				
					Object.keys(d.data().classes).map(i => {
					//console.log(i);
						firebase.firestore().collection('classes').doc(i).onSnapshot(i => {

						
							if (i.exists){
								let subject = i.data().subject;
								let section = i.data().section;
								let id = i.id;
								firebase.firestore().collection('subjects').doc(subject).onSnapshot(i => {
									let classes = this.state.classes;
									classes.push([id,i.data().name,section]);
									this.setState({ classes });
								});
							}
						});
					});
				});
		});
	}

	render(){
		return (<div>
			<h1>Class Attendance</h1>
			<div class={style.padding}>
				Select Class:
				<select name="class" value={this.state.class} onChange={this.loadAttendance}>
					{
						this.state.classes.map(i => <option value={i[0]}>{i[1]+' - '+i[2]}</option>)
					}
				</select>

			</div>

			<table>
				<tr>
					<th>Register Number</th>
					<th>Present</th>
					<th>Absent</th>
					<th>Extra</th>
					<th>Percentage</th>
				</tr>
				{Object.keys(this.state.students).map((i,j) =>
					(<tr class={this.state.students[i].percentage<75?style.red:''}>
						<td>{i}</td>
						<td>{this.state.students[i].present}</td>
						<td>{this.state.students[i].absent}</td>
						<td>{this.state.students[i].extra}</td>
						<td>{this.state.students[i].percentage}%</td>
					</tr>)
				)
				}
			</table>
		</div>);
	}
}


class ViewExtraAttendance extends Component {
	state={
		attendance: []
	}

	constructor(props){
		super(props);
		
		firebase.auth().onAuthStateChanged(i => {
			if (i)
				firebase.firestore().collection('attendance').where('attendance','==','E').where('lecturer','==',firebase.auth().currentUser.phoneNumber).onSnapshot(c => {
					let attendance=[];
					c.docs.map(i => {
						let id=i.id;
						i=i.data();
						attendance.push([id,i.reg,i.reason,i.from,i.to]);
					});
					this.setState({ attendance });
				});
		});
	}

	
	render(){
		return (<div>
			<h1>Extra Attendance</h1>
		

			<table>
				<tr>
					<th>Register Number</th>
					<th>Reason</th>
					<th>From</th>
					<th>To</th>
				</tr>
				{this.state.attendance.map((i) =>
					(<tr>
						<td>{i[1]}</td>
						<td>{i[2]}</td>
						<td>{convertToDate(i[3])}</td>
						<td>{convertToDate(i[4])}</td>
				
					</tr>)
				)
				}
			</table>
		</div>);
	}
}