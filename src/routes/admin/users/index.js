import { h, Component } from 'preact';
import style from './style';
import { Link,Router } from 'preact-router';
import * as firebase from 'firebase';
import { classList,generateRandomKey,Info,Country,input,store,empty, icon } from '../../../lib';

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
							<span class={classList(style.button,style.floatRight)} onClick={this.closeDelete}>No</span>
						</div>
					</div>
					:''}
			</span>);
	}
}

class Students extends Component {
	state={
		sections: [],
		phone: ['India','in',91,'+.. .....-.....'],
		phoneNumber: 91,
		
		registerNumber: null,
		addButton: 'ADD',
		studentsList: [],
		gender: 'Male'
		
	}
		
	handleSubmit(event){
		this.setState({ addButton: 'ADDING...',infoType: 'error' });
		event.preventDefault();
		
		if (empty(this.state.registerNumber)||!(this.state.registerNumber.length===6||this.state.registerNumber.length===7)||isNaN(this.state.registerNumber)){
			this.setState({ infoMessage: 'Invalid register number',addButton: 'ADD' });
			return;
		}
		if (empty(this.state.displayName)){
			this.setState({ infoMessage: 'Name is empty',addButton: 'ADD' });
			return;
		}
		if (empty(this.state.year)){
			this.setState({ infoMessage: 'Year not selected',addButton: 'ADD' });
			return;
		}
		if (empty(this.state.course)){
			this.setState({ infoMessage: 'Course not selected',addButton: 'ADD' });
			return;
		}
		if (empty(this.state.hideSections)&&empty(this.state.section)){
			this.setState({ infoMessage: 'Section not selected',addButton: 'ADD' });
			return;
		}
		if (empty(this.state.phoneNumber)||isNaN(this.state.phoneNumber)){
			this.setState({ infoMessage: 'Invalid phone number',addButton: 'ADD' });
			return;
		}
		if (this.state.phoneNumber.length!==this.state.phone[3].match(/\./g).length){
			this.setState({ infoMessage: 'Does not appear as a phone number from '+this.state.phone[0],addButton: 'ADD' });
			
			return;
		}
		
		let firestore = firebase.firestore();
		let data={
			registerNumber: this.state.registerNumber,
			displayName: this.state.displayName,
			year: this.state.year,
			course: this.state.course,
			phoneNumber: '+'+this.state.phoneNumber,
			phoneCountry: this.state.phone[1],
			isStudent: true,
			key: generateRandomKey(10),
			dateAdded: Date.now(),
			addedBy: firebase.auth().currentUser.phoneNumber,
			gender: this.state.gender
		};
		if (this.state.section&&this.state.sections.length!=='Section')
			data.section=this.state.section;
		if (this.state.isClassRep)
			data.isClassRep=true;
		if (this.state.isSportsRep)
			data.isSportsRep=true;
		firestore.doc('users/+'+this.state.phoneNumber).set(data,{ merge: true }).then(() => {
			this.setState({ infoMessage: 'Student Added successfully',infoType: 'success',phoneNumber: this.state.phone[2],addButton: 'ADD',isSportsRep: false,isClassRep: false });
			event.target.reset();
			this.setState({ phoneNumber: this.state.phone[2] });
			
		},(e) => {
			this.setState({ infoMessage: 'Failed to add student. Reason: '+e.message,addButton: 'ADD' });
		});
		this.hideErr();
	}
	
	handleDeleteMsg(e){
		if (e==='SUCCESS')
			this.setState({ infoMessage: 'Sucessfully deleted',infoType: 'success' });
		else
			this.setState({ infoMessage: e,infoType: 'error' });
	}
	changeGender(){
		this.setState({ gender: this.state.gender==='Male'?'Female':'Male' });
		
	}
	handleSort(e){
		let col=e.target.getAttribute('title');
		
		let val='asc';
		if (this.state['sort_'+col])
			switch (this.state['sort_'+col]){
				case 'asc':val='desc';break;
				case 'desc':val='';break;
			}
		this.setState({ ['sort_'+col]: val });
		this.sort();
	}
	sort(){
		//console.log('sorting..');
		let ref=firebase.firestore().collection('users').where('type','==','STUDENT');
		for (let i in this.state){
			if (i.substr(0,5)==='sort_'&&this.state[i].length>0){
				let attr = i.substr(5,i.length);
				//console.log(attr,this.state[i]);
				ref=ref.orderBy(attr,this.state[i]);
			}
		}
		ref.onSnapshot((e) => {
			this.setState({ studentsList: e.docs });
		});
	}
	constructor(props){
		super(props);
		this.handleSubmit=this.handleSubmit.bind(this);
		this.handleSort=this.handleSort.bind(this);
		this.handleDeleteMsg=this.handleDeleteMsg.bind(this);
		this.changeGender=this.changeGender.bind(this);
		let firestore=firebase.firestore();
		firestore.collection('users').where('isStudent','==',true).orderBy('dateAdded','desc').onSnapshot((d) => {
			this.setState({ studentsList: d.docs });
		});
		store.dispatch({ type: 'FORM_CHANGE',form: this });
	}
	render(){
		//console.log(this.state);
		return (<div>
			<Info that={this} />
			<form onSubmit={this.handleSubmit}>
				<table class={style.overflowTable}>
					<tr>
						<th>Sl. No</th>
						<th title="registerNumber" onClick={this.handleSort}>Register Number <i class={icon('sort-numeric-'+this.state.sort_registerNumber)} /></th>
						<th  title="gender" onClick={this.handleSort}>Gender  <i class={icon('sort-alpha-'+this.state.sort_gender)} /></th>
						<th  title="name" onClick={this.handleSort}>Name  <i class={icon('sort-alpha-'+this.state.sort_name)} /></th>
						<th  title="year" onClick={this.handleSort}>Year  <i class={icon('sort-numeric-'+this.state.sort_year)} /></th>
						<th  title="course" onClick={this.handleSort}>Course  <i class={icon('sort-alpha-'+this.state.sort_course)} /></th>
						<th  title="section" onClick={this.handleSort}>Section  <i class={icon('sort-alpha-'+this.state.sort_section)} /></th>
						<th  title="phoneNumber" onClick={this.handleSort}>Phone Number  <i class={icon('sort-numeric-'+this.state.sort_phoneNumber)} /></th>
						<th  title="isClassRep" onClick={this.handleFilter}>Class Rep?  <i class={icon('sort-numeric-'+this.state.sort_isClassRep)} /></th>
						<th  title="isSportsRep" onClick={this.handleFilter}>Sports Rep?  <i class={icon('sort-numeric-'+this.state.sort_isSportsRep)} /></th>
						<th>&nbsp;</th>
					</tr>
					<tr>
						<th />
						<th class={style.registerNumberInputWidth}>
							<input type="number" name="registerNumber" onChange={input} />
						</th>
						<th class={style.gender} onClick={this.changeGender}>
							<i class={icon('male '+(this.state.gender==='Male'?style.active:''))} />
							<i class={icon('female '+(this.state.gender==='Female'?style.active:''))} />
						</th>
						<th class={style.nameInputWidth}>
							<input type="text" name="displayName" onChange={input} />
						</th>
						<th>
							<select name="year" onChange={input}>
								<option>Year</option>
								<option value="1">1st</option>
								<option value="2">2nd</option>
								<option value="3">3rd</option>
							</select>
						</th>
						<th>
							<select name="course" onChange={input}>
								<option>Course</option>
								<option>BA</option>
								<option>BSc</option>
								<option>BCom</option>
								<option>BBA</option>
								<option>BCA</option>
								<option>BVoc</option>
							</select>
						</th>
						<th>
							{
								this.state.hideSections?'':<select name="section" onChange={input}>
									<option>Section</option>
									{
										this.state.sections.map(val => <option>{val}</option>)
									}
								</select>
							}
						</th>
						<th>
							<Country that={this} name="phoneNumber" />
						</th>
						<th><input type="checkbox" name="isClassRep" onChange={input} /></th>
						<th><input type="checkbox" name="isSportsRep" onChange={input} /></th>
						<th><button>{this.state.addButton}</button></th>
					</tr>
					{
						this.state.studentsList.map((d,i) => <tr><td>{i+1}.</td><td>{d.data().registerNumber}</td><td class={style.gender}><i class={classList(style.active,icon(String(d.data().gender).toLowerCase()))} /></td><td>{d.data().displayName}</td><td>{d.data().year}</td><td>{d.data().course}</td><td>{d.data().section}</td><td><a href={'tel:'+d.data().phoneNumber}>{d.data().phoneNumber}</a></td><td>{d.data().isClassRep?<i class={icon('check-circle-o')} />:''}</td><td>{d.data().isSportsRep?<i class={icon('check-circle-o')} />:''}</td><td><DeleteUser onClick={this.handleDeleteMsg} id={d.id} /></td></tr>)
					}
				</table>
			</form>
			
		</div>);
	}
}

class Staff extends Component {
	state={
		sections: [],
		phone: ['India','in',91,'+.. .....-.....'],
		phoneNumber: 91,
		
		addButton: 'ADD',
		staffList: [],
		isClassGuide: false
	}
	

	handleSubmit(event){
		this.setState({ addButton: 'ADDING...',infoType: 'error' });
		event.preventDefault();
		
		if (!this.state.displayName){
			this.setState({ infoMessage: 'Name is empty',addButton: 'ADD' });
			return;
		}
		if (this.state.isClassGuide){
			if (!this.state.year){
				this.setState({ infoMessage: 'Year not selected',addButton: 'ADD' });
				return;
			}
			if (!this.state.course){
				this.setState({ infoMessage: 'Course not selected',addButton: 'ADD' });
				return;
			}
			if (!this.state.hideSections&&!this.state.section){
				this.setState({ infoMessage: 'Section not selected',addButton: 'ADD' });
				return;
			}
		}
		if (!this.state.phoneNumber||isNaN(this.state.phoneNumber)){
			this.setState({ infoMessage: 'Invalid phone number',addButton: 'ADD' });
			return;
		}
		if (this.state.phoneNumber.length!==this.state.phone[3].match(/\./g).length){
			this.setState({ infoMessage: 'Does not appear as a phone number from '+this.state.phone[0],addButton: 'ADD' });
			
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
			addedBy: firebase.auth().currentUser.phoneNumber
		};
		if (this.state.isClassGuide){
			data.isClassGuide=true;
			data.year=this.state.year;
			data.course=this.state.course;
			if (this.state.section&&this.state.sections.length!=='Section')
				data.section=this.state.section;
		}
		if (this.state.isSportsIncharge){
			data.isSportsIncharge=true;
		}
		firestore.doc('users/+'+this.state.phoneNumber).set(data,{ merge: true }).then(() => {
			this.setState({ infoMessage: 'Staff added successfully',infoType: 'success',phoneNumber: this.state.phone[2],addButton: 'ADD' });
			event.target.reset();
			this.setState({ phoneNumber: this.state.phone[2] });
			
		},(e) => {
			this.setState({ infoMessage: 'Failed to add staff. Reason: '+e.message,addButton: 'ADD' });
		});
		this.hideErr();
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
		firestore.collection('users').where('isStaff','==',true).orderBy('dateAdded','desc').onSnapshot((d) => {
			
			this.setState({ staffList: d.docs });
		});
		store.dispatch({ type: 'FORM_CHANGE',form: this });
	}
	render(){
		return (<div>
			<Info that={this} />
			<form onSubmit={this.handleSubmit}>
				<table class={style.overflowTable}>
					<tr>
						<th>Sl. No.</th>
						<th>Name</th>
						<th>Phone Number</th>
						<th>Class Guide?</th>
						<th>Sports Incharge?</th>
						<th>Year</th>
						<th>Course</th>
						<th>Section</th>
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
						<th><input type="checkbox" name="isClassGuide" onChange={input} /></th>
						<th><input type="checkbox" name="isSportsIncharge" onChange={input} /></th>
						
						<th>{this.state.isClassGuide?
							<select name="year" onChange={input}>
								<option>Year</option>
								<option value="1">1st</option>
								<option value="2">2nd</option>
								<option value="3">3rd</option>
							</select>:''}
						</th>
						<th>{this.state.isClassGuide?
							<select name="course" onChange={input}>
								<option>Course</option>
								<option>BA</option>
								<option>BSc</option>
								<option>BCom</option>
								<option>BBA</option>
								<option>BCA</option>
								<option>BVoc</option>
							</select>:''}
						</th>
						<th>
							{
								this.state.hideSections||!this.state.isClassGuide?'':<select name="section" onChange={input}>
									<option>Section</option>
									{
										this.state.sections.map(val => <option>{val}</option>)
									}
								</select>
							}
						</th>
						
						
						<th><button>{this.state.addButton}</button></th>
					</tr>
					{
						this.state.staffList.map((d,i) => <tr><td>{i+1}</td><td>{d.data().displayName}</td><td><a href={'tel:'+d.data().phoneNumber}>{d.data().phoneNumber}</a></td><td>{d.data().isClassRep?<i class="material-icons">check</i>:''}</td><td>{d.data().isSportsIncharge?<i class="material-icons">check</i>:''}</td><td>{d.data().year}</td><td>{d.data().course}</td><td>{d.data().section}</td><td><DeleteUser onClick={this.handleDeleteMsg}  id={d.id} /></td></tr>)
					}
				</table>
			</form>
			
		</div>);
	}
}

class Admins extends Component {
	state={
		phone: ['India','in',91,'+.. .....-.....'],
		phoneNumber: 91,
		
		addButton: 'ADD',
		adminsList: []
	}
	

	handleSubmit(event){
		this.setState({ addButton: 'ADDING...',infoType: 'error' });
		event.preventDefault();
		
		if (!this.state.displayName){
			this.setState({ infoMessage: 'Name is empty',addButton: 'ADD' });
			return;
		}
		if (!this.state.phoneNumber||isNaN(this.state.phoneNumber)){
			this.setState({ infoMessage: 'Invalid phone number',addButton: 'ADD' });
			return;
		}
		if (this.state.phoneNumber.length!==this.state.phone[3].match(/\./g).length){
			this.setState({ infoMessage: 'Does not appear as a phone number from '+this.state.phone[0],addButton: 'ADD' });
			
			return;
		}
			
		let firestore = firebase.firestore();
		let data={
			displayName: this.state.displayName,
			phoneNumber: '+'+this.state.phoneNumber,
			phoneCountry: this.state.phone[1],
			isAdmin: true,
			key: generateRandomKey(10),
			dateAdded: Date.now(),
			addedBy: firebase.auth().currentUser.phoneNumber
		};
		
		firestore.doc('users/+'+this.state.phoneNumber).set(data,{ merge: true }).then(() => {
			this.setState({ infoMessage: 'Admin Added successfully',infoType: 'success',phoneNumber: this.state.phone[2],addButton: 'ADD' });
			event.target.reset();
			this.setState({ phoneNumber: this.state.phone[2] });
			
		},(e) => {
			this.setState({ infoMessage: 'Failed to add admin. Reason: '+e.message,addButton: 'ADD' });
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
		firestore.collection('users').where('isAdmin','==',true).orderBy('dateAdded','desc').onSnapshot((d) => {
			this.setState({ adminsList: d.docs });
		});
		store.dispatch({ type: 'FORM_CHANGE',form: this });
	}
	render(){
		return (<div>
			<Info that={this} />
			<form onSubmit={this.handleSubmit}>
				<table class={style.overflowTable}>
					<tr>
						<th>Sl. No.</th>
						<th>Name</th>
						<th>Phone Number</th>
						
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
						
						<th><button>{this.state.addButton}</button></th>
					</tr>
					{
						this.state.adminsList.map((d,i) => <tr><td>{i+1}</td><td>{d.data().displayName}</td><td><a href={'tel:'+d.data().phoneNumber}>{d.data().phoneNumber}</a></td><td><DeleteUser onClick={this.handleDeleteMsg}  id={d.id} /></td></tr>)
					}
				</table>
			</form>
			
		</div>);
	}
}

export default class Users extends Component {
	tabs=[
		['Students','/admin/users/students'],
		['Staff','/admin/users/staff'],
		['Admins','/admin/users/admins']
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
				<div class={style.title}>Users</div>
				<div class={style.tabs}>
					{
						this.tabs.map(i => <Link href={i[1]} class={this.state.url===i[1]?style.active:''}>{i[0]}</Link>)
					}
				</div>
				<div class={style.card+' '+style.regForm}>
					<Router onChange={this.handleRoute}>
						<Students path="/admin/users/students" default />
						<Staff path="/admin/users/staff" />
						<Admins path="/admin/users/admins" />
					

					</Router>
					
				
				</div>
			</div>
		);
	}
}
