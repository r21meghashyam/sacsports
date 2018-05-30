import { h, Component } from 'preact';
import style from './style';
import { Link, Router } from 'preact-router';
import * as firebase from 'firebase';
import { Info, input ,store, empty, classList, Country, generateRandomKey } from '../../../lib';

export default class ClassManagement extends Component {
	tabs=[
		['Add Department','/admin/attendance/add-department'],
		['Add Staff','/admin/attendance/add-staff'],
		['Create Subject/Association','/admin/attendance/add-class'],
		['Assign Class','/admin/attendance/assign-class'],
		['Assign Students','/admin/attendance/assign-students']
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
			<div class={style.adminUser}>
				<div class={style.title}>Attendance Management</div>
				<div class={style.tabs}>
					{
						this.tabs.map(i => <Link href={i[1]} class={this.state.url===i[1]?style.active:''}>{i[0]}</Link>)
					}
				</div>
				<div class={style.card+' '+style.regForm}>
					<Router onChange={this.handleRoute}>
						<AddDepartment path="/admin/attendance/add-department" default />
						<AddStaff path="/admin/attendance/add-staff" />
						<AddClass path="/admin/attendance/add-class" />
						<AssignClass path="/admin/attendance/assign-class" />
						<AssignStudent path="/admin/attendance/assign-students" />
					</Router>
					
				</div>
			</div>
		);
	}
}

class AddDepartment extends Component {
	state={
		departments: [],
		submitButtonText: 'Add'
	}

	
	add(e){
		e.preventDefault();
		this.setState({ button: 'Adding...' });
		
		try {
			if (empty(this.state.name))
				throw 'Please enter an department name';

			firebase.firestore().collection('departments').add({
				name: this.state.name
			}).then(() => {
				this.setState({ infoType: 'success',infoMessage: 'Department has been added successfully.',button: 'Add',name: '' });
			},e => {
				this.setState({ infoType: 'error',infoMessage: 'Failed to add department. Reason: '+e.message, button: 'Add' });
			});
		}
		catch (msg){
			this.setState({ infoMessage: msg,infoType: 'error',button: 'Add' });
		}
	}

	constructor(props){
		super(props);
		this.add=this.add.bind(this);
		store.dispatch({ type: 'FORM_CHANGE',form: this });
		firebase.firestore().collection('departments').orderBy('name','asc').onSnapshot(d => {
			this.setState({ departments: d.docs });
		});
	}

	render() {
		return (
			<div>
				<h1>Add Department</h1>
				<form onSubmit={this.add}>
					<div>
						<Info that={this} />
					</div>
					<table class={style.overflowTable}>
						<tr>
							<th />
							<th>Department Name</th>
							<th>&nbsp;</th>
						</tr>
						<tr>
							<th />
							<th>
								<input type="text" name="name" value={this.state.name} onChange={input} />
							</th>
							<th>
								<button>{this.state.submitButtonText}</button>
							</th>
						</tr>
						{
							this.state.departments.map((d,i) =>
								(<tr>
									<td>{i+1}.</td>
									<td>{d.data().name}</td>
									<td><DeleteItem onClick={this.handleDeleteItem}  data={[d.id,d.data().name]} /></td>
								</tr>)
							)
						}
					</table>
				</form>
			</div>
		);
	}
}

class AddStaff extends Component {
	state={
		sections: [],
		phone: ['India','in',91,'+.. .....-.....'],
		phoneNumber: 91,
		departments: [],
		addButton: 'ADD',
		staffList: [],
		isClassGuide: false
	}
	

	handleSubmit(event){
		this.setState({ addButton: 'ADDING...',infoType: 'error' });
		event.preventDefault();
		
		if (!this.state.displayName){
			this.setState({ infoMessage: 'Name is empty', addButton: 'ADD' });
			return;
		}
	
		if (!this.state.phoneNumber||isNaN(this.state.phoneNumber)){
			this.setState({ infoMessage: 'Invalid phone number', addButton: 'ADD' });
			return;
		}

		if (this.state.phoneNumber.length!==this.state.phone[3].match(/\./g).length){
			this.setState({ infoMessage: 'Does not appear as a phone number from '+this.state.phone[0],addButton: 'ADD' });
			
			return;
		}

		if (empty(this.state.department)){
			this.setState({ infoMessage: 'Please select department',addButton: 'ADD' });
			return;
		}
			
		let firestore = firebase.firestore();
		let data={
			displayName: this.state.displayName,
			phoneNumber: '+'+this.state.phoneNumber,
			phoneCountry: this.state.phone[1],
			isStaff: true,
			key: generateRandomKey(10),
			dateAdded: Date.now(),
			addedBy: firebase.auth().currentUser.phoneNumber,
			department: this.state.department
		};
		
		firestore.doc('users/+'+this.state.phoneNumber).set(data,{ merge: true }).then(() => {
			this.setState({ infoMessage: 'Staff added successfully',infoType: 'success',phoneNumber: this.state.phone[2],addButton: 'ADD' });
			event.target.reset();
			this.setState({ phoneNumber: this.state.phone[2] });
			
		},e => {
			this.setState({ infoMessage: 'Failed to add staff. Reason: '+e.message,addButton: 'ADD' });
		});
		
	}
	
	handleDeleteMsg(e){
		if (e==='SUCCESS')
			this.setState({ successMsg: 'Sucessfully deleted' });
		else
			this.setState({ infoMessage: e });
	}

	constructor(props){
		super(props);
		this.handleSubmit=this.handleSubmit.bind(this);
		this.handleDeleteMsg=this.handleDeleteMsg.bind(this);
		let firestore=firebase.firestore();
		firestore.collection('users').where('isStaff','==',true).orderBy('dateAdded','desc').onSnapshot(d => {
			
			this.setState({ staffList: d.docs });
		});
		store.dispatch({
			type: 'FORM_CHANGE',
			form: this
		});

		firestore.collection('departments').onSnapshot((d) => {
			let departments={};
			d.forEach(i => {
				departments[i.id]=i.data().name;
				this.setState({ departments });
				
			});
		});
	}

	render(){
		return (<div>
			<h1>Add Staff</h1>
			<Info that={this} />
			<form onSubmit={this.handleSubmit}>
				<table class={style.overflowTable}>
					<tr>
						<th>Sl. No.</th>
						<th>Name</th>
						<th>Phone Number</th>
						<th>Department</th>
						<th>&nbsp;</th>
					</tr>
					<tr>
						<th />
						<th>
							<input type="text" name="displayName" onChange={input} />
						</th>
						<th>
							<Country that={this} name="phoneNumber" />
						</th>
						<th>
							<select name="department"  onChange={input}>
								{
									Object.keys(this.state.departments).map(i => <option value={i}>{this.state.departments[i]}</option>)
								}
							</select>
						</th>
						<th>
							<button>{this.state.addButton}</button>
						</th>
					</tr>
					{
						this.state.staffList.map((d,i) =>
							(<tr>
								<td>{i+1}</td>
								<td>{d.data().displayName}</td>
								<td>
									<a href={'tel:'+d.data().phoneNumber}>{d.data().phoneNumber}</a>
								</td>
								<td>{this.state.departments[d.data().department]}</td>
								<td><DeleteUser onClick={this.handleDeleteMsg}  id={d.id} /></td>
							</tr>)
						)
					}
				</table>
			</form>
		</div>);
	}
}

class AddClass extends Component {
	state={
		departments: [],
		submitButtonText: 'Add',
		type: 'Subject'
	}

	add(e){
		e.preventDefault();
		this.setState({ button: 'Adding...' });
		try {
			if (empty(this.state.type))
				throw 'Please select a type';
			if (empty(this.state.name))
				throw 'Please enter '+this.state.type.toLowerCase()+' name';
			if (this.state.type==='Subject'&&empty(this.state.code))
				throw 'Please enter subject code.';
			let data={
				type: this.state.type,
				name: this.state.name
			};
			if (this.state.type==='Subject')
				data.code=this.state.code;
			firebase.firestore().collection('subjects').add(data).then(() => {
				this.setState({ infoType: 'success',infoMessage: this.state.type+' has been added successfully.',button: 'Add',name: '',code: '' });
			},e => {
				this.setState({ infoType: 'error',infoMessage: 'Failed to add '+this.state.type+'. Reason: '+e.message,button: 'Add' });
			});
		}
		catch (msg){
			this.setState({ infoMessage: msg,infoType: 'error',button: 'Add' });
		}
	}

	constructor(props){
		super(props);
		this.add=this.add.bind(this);
		store.dispatch({ type: 'FORM_CHANGE',form: this });
		firebase.firestore().collection('subjects').orderBy('name','asc').onSnapshot(d => this.setState({ departments: d.docs }));
	}

	render() {
		return (
			<div>
				<h1>Add Class</h1>
				<form onSubmit={this.add}>
					<div>
						<Info that={this} />
					</div>
					<table class={style.overflowTable}>
						<tr>
							<th />
							<th>Type</th>
							<th>Name</th>
							<th>Code</th>
							<th>&nbsp;</th>
						</tr>
						<tr>
							<th />
							<th>
								<select name="type" onChange={input}>
									<option>Subject</option>
									<option>Association</option>
								</select>
							</th>
							<th>
								<input type="text" name="name" value={this.state.name} onChange={input} />
							</th>
							<th>
								{this.state.type==='Subject'?<input type="text" name="code" value={this.state.code} onChange={input} />:''}
							</th>
							<th><button>{this.state.submitButtonText}</button></th>
						</tr>
						{
							this.state.departments.map((d,i) =>
								(<tr>
									<td>{i+1}.</td>
									<td>{d.data().type}</td>
									<td>{d.data().name}</td>
									<td>{d.data().code}</td>
									<td>
										<DeleteClass onClick={this.handleDeleteItem}  data={[d.id,d.data().name]} />
									</td>
								</tr>)
							)
						}
					</table>
				</form>
			</div>
		);
	}
}

class AssignClass extends Component {
	state={
		departments: [],
		staffs: [],
		classes: [],
		subjects: [],
		submitButtonText: 'Add',
		type: 'Subject',
		lecturersCount: 1
	}
	
	add(e){
		e.preventDefault();
		this.setState({ button: 'Adding...' });
		try {
			
		
			if (empty(this.state.subject))
				throw 'Please select a subject or an association';
			for (let i=0;i<this.state.lecturersCount;i++)
				if (empty(this.state['lecturer['+i+']']))
					throw 'Please select lecturers';
			if (empty(this.state.year))
				throw 'Please enter year';
			if (empty(this.state.section))
				this.setState({ section: '' });
			let lecturers=[];
			for (let i=0;i<this.state.lecturersCount;i++)
				lecturers.push(this.state['lecturer['+i+']']);
			
			let data={
				lecturers,
				subject: this.state.subject,
				year: this.state.year,
				section: this.state.section
			};
		
			firebase.firestore().collection('classes').add(data).then(
				d => {
					lecturers.map(i => {
						let doc = firebase.firestore().collection('users').doc(i);
						doc.onSnapshot(j => {
							let classes=j.data().classes||{};
							classes[d.id]=true;
							doc.set({ classes },{ merge: true });
						});
					});
					this.setState({
						infoType: 'success',
						infoMessage: 'Lecutrer has been assigned successfully.',
						button: 'Add',
						name: '',
						code: ''
					});
				},
				e => this.setState({
					infoType: 'error',
					infoMessage: 'Failed to assign. Reason: '+e.message,
					button: 'Add'
				})
			);
			
		}
		catch (msg){
			this.setState({
				infoMessage: msg,
				infoType: 'error',
				button: 'Add'
			});
		}
	}

	addLecturer(e){
		e.preventDefault();
		this.setState({
			lecturersCount: this.state.lecturersCount+1
		});
	}

	constructor(props){
		super(props);
		this.add=this.add.bind(this);
		this.addLecturer=this.addLecturer.bind(this);
		store.dispatch({
			type: 'FORM_CHANGE',
			form: this
		});
		let firestore = firebase.firestore();
		firestore.collection('departments').onSnapshot(d => {
			let departments={};
			d.forEach(i => {
				departments[i.id]=i.data().name;
				this.setState({
					departments
				});
				
			});
		});
		firestore.collection('users').where('isStaff','==',true).orderBy('dateAdded','desc').onSnapshot(
			d => {
				let staffs={};
				d.forEach(
					i => {
						staffs[i.id]=[i.data().displayName,i.data().department];
						this.setState({
							staffs
						});
						//console.log(this.state.staffs);
					}
				);
			});
		firestore.collection('subjects').onSnapshot(
			d => {
				let subjects={};
				d.forEach(
					i => {
						subjects[i.id]=[i.data().name,i.data().code];
						this.setState({
							subjects
						});
						//console.log(this.state.departments);
					}
				);
			}
		);

		let d= new Date();
		let year = d.getFullYear();
		let yearString = year+'-'+(year+1);
		if (d.getMonth()<=3)
			yearString=(year-1)+'-'+year;
		this.setState({
			year: yearString
		});
		firestore.collection('classes').onSnapshot(
			d => {
				this.setState({
					classes: d.docs
				});
			}
		);
	}

	render() {
		return (
			<div>
				<h1>Assign Class</h1>
				<form onSubmit={this.add}>
			
					<div>
						<Info that={this} />
						
					</div>
					<table class={style.overflowTable}>
						<tr>
							<th />
							<th>Subject/Association</th>
							<th>Lecutrer</th>
							<th>Year</th>
							<th>Class</th>
							<th>ID</th>
							<th>&nbsp;</th>
						</tr>
						<tr>
							<th />
							<th>
								<select name="subject" value={this.state.subject}  onChange={input}>
									{
										Object.keys(this.state.subjects).map(
											i => <option value={i}>{this.state.subjects[i][0]} {this.state.subjects[i][1]?'('+this.state.subjects[i][1]+')':''}</option>)
									}
								</select>
							</th>
							<th>
								{
									'.'.repeat(this.state.lecturersCount).split('').map(
										(i,j) => (
											<select name={'lecturer['+j+']'} value={this.state['lecturer['+j+']']}  onChange={input}>
												{
													Object.keys(this.state.staffs).map(
														i => (
															<option value={i}>
																{this.state.staffs[i][0]} ({this.state.departments[this.state.staffs[i][1]]})
															</option>
														)
													)
												}
											</select>
										)
									)
								}
								<button onClick={this.addLecturer}>
									Add lecturer
								</button>
							</th>
							<th>
								<input type="text" name="year" value={this.state.year} onChange={input} />
							</th>
							<th>
								<input type="text" name="section" value={this.state.section} onChange={input} />
							</th>
							<th />
							<th>
								<button>
									{this.state.submitButtonText}
								</button>
							</th>
						</tr>
						{
							this.state.classes.map(
								(d,i) => (
									<tr>
										<td>
											{i+1}.
										</td>
										<td>
											{this.state.subjects[d.data().subject]}
										</td>
										<td>
											{
												d.data().lecturers.map(
													(k,j) => (
														<div>
															{(j+1)+') '+this.state.staffs[k][0]+', '+this.state.departments[this.state.staffs[k][1]]}
														</div>
													)
												)
											}
										</td>
										<td>
											{d.data().year}
										</td>
										<td>
											{d.data().section}
										</td>
										<td>
											{d.id}
										</td>
										<td>
											<DeleteClassAssigned onClick={this.handleDeleteItem}  data={d.id} />
										</td>
									</tr>
								)
							)
						}
					</table>
				</form>
			</div>
		);
	}
}

class AssignStudent extends Component {
	state={
		departments: [],
		staffs: [],
		classes: [],
		subjects: [],
		submitButtonText: 'Save',
		type: 'Subject',
		students: {}
	}

	
	add(e){
		e.preventDefault();
		this.setState({
			button: 'Saving...'
		});
		try {
			if (empty(this.state.class))
				throw 'Please select class';
			firebase.firestore().collection('classes').doc(this.state.class).set(
				{
					students: this.state.students
				},
				{
					merge: true
				}
			).then(
				() => {
					this.setState(
						{
							infoType: 'success',
							infoMessage: 'Lecutrer has been assigned successfully.',
							button: 'Add',
							name: '',
							code: ''
						});
				},
				e => {
					this.setState(
						{
							infoType: 'error',
							infoMessage: 'Failed to assign. Reason: '+e.message,
							button: 'Add'
						}
					);
				}
			);
		}
		catch (msg){
			this.setState({
				infoMessage: msg,
				infoType: 'error',
				button: 'Add'
			});
		}
	}

	addRegisterNumbers(e){
		e.preventDefault();
		//console.log(this.state);
		
		try {
			if (empty(this.state.from))
				throw 'Please enter from value';
			if (empty(this.state.to))
				throw 'Please enter to value';
			
			let students = this.state.students;
			
			for (let i = this.state.from;i<=this.state.to;i++)
				students[i]=students[i]||'';
			this.setState({
				students
			});
		}
		catch (msg){
			this.setState({
				infoMessage: msg,
				infoType: 'error',
				button: 'Add'
			});
		}
	}

	copy(e){
		input(e);
		this.setState({
			to: this.state.from
		});
	}

	changeName(e){
		let students = this.state.students;
		students[e.target.name]=e.target.value;
		this.setState({
			students
		});
	}

	changeClass(e){
		input(e);
		firebase.firestore().collection('classes').doc(this.state.class).onSnapshot(
			d => {
				let students=d.data().students||{};
				this.setState({
					students
				});
			}
		);
	}

	remove(e){
		e.preventDefault();
		let students = this.state.students;
		delete students[e.target.getAttribute('data')];
		this.setState({
			students
		});
	}

	constructor(props){
		super(props);
		this.add=this.add.bind(this);
		this.copy=this.copy.bind(this);
		this.changeName=this.changeName.bind(this);
		this.remove=this.remove.bind(this);
		this.changeClass=this.changeClass.bind(this);
		this.addRegisterNumbers=this.addRegisterNumbers.bind(this);

		store.dispatch({
			type: 'FORM_CHANGE',
			form: this
		});

		let firestore = firebase.firestore();
		
		firestore.collection('departments').onSnapshot(
			d => {
				let departments={};
				d.forEach(
					i => {
						departments[i.id]=i.data().name;
						this.setState({
							departments
						});
					}
				);
			}
		);

		firestore.collection('users').where('isStaff','==',true).orderBy('dateAdded','desc').onSnapshot(
			d => {
				let staffs={};
				d.forEach(
					i => {
						staffs[i.id]=[i.data().displayName,i.data().department];
						this.setState({
							staffs
						});
						//console.log(this.state.staffs);
					}
				);
			}
		);

		firestore.collection('subjects').onSnapshot(
			d => {
				let subjects={};
				
				d.forEach(
					i => {
						subjects[i.id]=[i.data().name,i.data().code];
						this.setState({
							subjects
						});
						//console.log(this.state.departments);
					}
				);
			}
		);

		let d= new Date();
		let year = d.getFullYear();
		let yearString = year+'-'+(year+1);

		if (d.getMonth()<=3)
			yearString=(year-1)+'-'+year;
		
		firestore.collection('classes').where('year','==',yearString).onSnapshot(
			d => {
				let classes={};
				d.forEach(
					i => {
						classes[i.id]=[i.data().subject,i.data().section,i.data().lecturers];
						this.setState({
							classes
						});
						//console.log(this.state.departments);
					});
			});
	}

	render() {
		return (
			<div>
				<h1>Assign Students</h1>
				<form onSubmit={this.add}>
			
					
					<div class={style.padding}>
						Select class:
						<select name="class" value={this.state.class} onChange={this.changeClass}>
							{
								Object.keys(this.state.classes).map(
									i => (
										<option value={i}>
											{
												this.state.subjects[this.state.classes[i][0]][0]+' ('+this.state.classes[i][1]+') by '}{this.state.classes[i][2].map(i => this.state.staffs[i][0]+', ')}</option>
									)
								)
							}
						</select>
					</div>
					<div class={style.padding}>
						Add register number: <input type="number" name="from" value={this.state.from} onChange={this.copy} /> to <input type="number" name="to" value={this.state.to} onChange={input} /> <button onClick={this.addRegisterNumbers}>Add</button>
					</div>
					<table class={style.overflowTable}>
						<tr>
							<th>Register Number*</th>
							<th>Name</th>
							<th>&nbsp;</th>
						</tr>
						{
							Object.keys(this.state.students).map((i,j) => (
								<tr>
									
									<th>
										{i}
									</th>
									<th>
										<input type="text" name={i}  value={this.state.students[i]} onChange={this.changeName} />
									</th>
									<th><button data={i} onClick={this.remove}>Remove</button></th>
								</tr>
							))
						}
							
					</table>
					<div>
						<Info that={this} />
					</div>
					<button>{this.state.submitButtonText}</button>
				</form>
			</div>
		);
	}
}

class DeleteItem extends Component{
	handleDelete(){
		this.setState({ deleteItem: this.props.data[0] });
	}
	closeDelete(){
		this.setState({ deleteItem: null });
	}
	confirmDelete(){
		this.closeDelete();
		firebase.firestore().doc('departments/'+this.props.data[0]).delete().then(() => {
			this.props.onClick('SUCCESS');
			
		},
		(e) => {
			this.props.onClick(e.message);
			
		});
	}
	constructor(props){
		super(props);
		this.handleDelete=this.handleDelete.bind(this);
		this.closeDelete=this.closeDelete.bind(this);
		this.confirmDelete=this.confirmDelete.bind(this);
	}
	componentWillReceiveProps(newProps){
		this.props=newProps;
	}
	render(){
		return (
			<span>
				<span class={style.button} onClick={this.handleDelete}>
					DELETE
				</span>
				{this.state.deleteItem?
					<div class={style.dialog}>
						<div class={style.head}>Warning!</div>
						<div>
							Are you sure you want to delete the {this.props.data[1]}?
						</div>
						<div>
							<span class={style.button}  onClick={this.confirmDelete}>YES</span>
							<span class={classList([style.button,style.floatRight])} onClick={this.closeDelete}>No</span>
						</div>
					</div>
					:''}
			</span>);
	}
}

class DeleteUser extends Component{

	handleDelete(){
		this.setState({ deleteNumber: this.props.id });
	}
	closeDelete(){
		this.setState({ deleteNumber: null });
	}
	confirmDelete(){
		this.closeDelete();
		firebase.firestore().doc('users/'+this.props.id).set({ removed: true,removedBy: firebase.auth().currentUser.phoneNumber }).then(() => {
			this.props.onClick('SUCCESS');
			
		},
		(e) => {
			this.props.onClick(e.message);
			
		});
	}
	constructor(props){
		super(props);
		this.handleDelete=this.handleDelete.bind(this);
		this.closeDelete=this.closeDelete.bind(this);
		this.confirmDelete=this.confirmDelete.bind(this);
	}
	componentWillReceiveProps(newProps){
		this.props=newProps;
	}
	render(){
		return (
			<span>
				<span class={style.button} onClick={this.handleDelete}>
					DELETE
				</span>
				{this.state.deleteNumber?
					<div class={style.dialog}>
						<div class={style.head}>Warning!</div>
						<div>
							Are you sure you want to delete {this.state.deleteNumber}?
						</div>
						<div>
							<span class={style.button}  onClick={this.confirmDelete}>YES</span>
							<span class={classList([style.button,style.floatRight])} onClick={this.closeDelete}>No</span>
						</div>
					</div>
					:''}
			</span>);
	}
}

class DeleteClass extends Component{
	handleDelete(){
		this.setState({ deleteItem: this.props.data[0] });
	}
	closeDelete(){
		this.setState({ deleteItem: null });
	}
	confirmDelete(){
		this.closeDelete();
		firebase.firestore().doc('subjects/'+this.props.data[0]).delete().then(() => {
			this.props.onClick('SUCCESS');
		},
		e => {
			this.props.onClick(e.message);
			
		});
	}
	constructor(props){
		super(props);
		this.handleDelete=this.handleDelete.bind(this);
		this.closeDelete=this.closeDelete.bind(this);
		this.confirmDelete=this.confirmDelete.bind(this);
	}
	componentWillReceiveProps(newProps){
		this.props=newProps;
	}
	render(){
		return (
			<span>
				<span class={style.button} onClick={this.handleDelete}>
					DELETE
				</span>
				{this.state.deleteItem?
					<div class={style.dialog}>
						<div class={style.head}>Warning!</div>
						<div>
							Are you sure you want to delete the {this.props.data[1]}?
						</div>
						<div>
							<span class={style.button}  onClick={this.confirmDelete}>YES</span>
							<span class={classList([style.button,style.floatRight])} onClick={this.closeDelete}>No</span>
						</div>
					</div>
					:''}
			</span>);
	}
}

class DeleteClassAssigned extends Component{
	
	handleDelete(){
		this.setState({ deleteItem: this.props.data });
	}
	closeDelete(){
		this.setState({ deleteItem: null });
	}
	confirmDelete(){
		this.closeDelete();
		firebase.firestore().doc('classes/'+this.props.data).delete().then(() => {
			this.props.onClick('SUCCESS');
			
		},
		(e) => {
			this.props.onClick(e.message);
			
		});
	}
	
	constructor(props){
		super(props);
		this.handleDelete=this.handleDelete.bind(this);
		this.closeDelete=this.closeDelete.bind(this);
		this.confirmDelete=this.confirmDelete.bind(this);
	}
	componentWillReceiveProps(newProps){
		this.props=newProps;
	}
	render(){
		return (
			<span>
				<span class={style.button} onClick={this.handleDelete}>
					DELETE
				</span>
				{this.state.deleteItem?
					<div class={style.dialog}>
						<div class={style.head}>Warning!</div>
						<div>
							Are you sure you want to delete this class?
						</div>
						<div>
							<span class={style.button}  onClick={this.confirmDelete}>YES</span>
							<span class={classList([style.button,style.floatRight])} onClick={this.closeDelete}>No</span>
						</div>
					</div>
					:''}
			</span>);
	}
}