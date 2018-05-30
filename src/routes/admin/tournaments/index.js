import { h, Component } from 'preact';
import style from './style';
import { Link,Router,route } from 'preact-router';
import * as firebase from 'firebase';
import { convertToDate,generateGamesList,Info,input,store,classList, icon } from '../../../lib';
class DeleteTeam extends Component{
	
	confirmDelete(){
		this.setState({ show: true });
	}
	cancelDelete(){
		this.setState({ show: false });
	}
	delete(){
		this.setState({ show: false });
		firebase.firestore().collection('tournaments').doc(this.props.tournament).collection('registered_teams').doc(this.props.team).delete().then(() => {
			this.props.that.setState({ infoMessage: 'Team had been removed',infoType: 'success' });
		},
		(e) => {
			this.props.that.setState({ infoMessage: e.message,infoType: 'success' });
		});
	}
	constructor(props){
		super(props);
		this.confirmDelete=this.confirmDelete.bind(this);
		this.cancelDelete=this.cancelDelete.bind(this);
		this.delete=this.delete.bind(this);
	}
	componentWillReceiveProps(newProps){
		this.props=newProps;
	}
	render(){
		return (
			<span>
				<span class={style.button} onClick={this.confirmDelete}>
					DELETE
				</span>
				{this.state.show?
					<div class={style.dialog}>
						<div class={style.head}>Warning!</div>
						<div>
							Are you sure you want to delete?
						</div>
						<div>
							<span class={style.button}  onClick={this.delete}>YES</span>
							<span class={classList([style.button,style.floatRight])} onClick={this.cancelDelete}>No</span>
						</div>
					</div>
					:''}
			</span>);
	}
}

class CreateTournament extends Component {
	state={
		fetching: true
	}
	
	
	handleSubmit(event){
		
		event.preventDefault();
		
		this.setState({ infoType: 'error' });
		if (!this.state.level){
			this.setState({ infoMessage: 'Tournament level is not defined.' });
			return;
		}
		if (!this.state.game){
			this.setState({ infoMessage: 'Game is not defined.' });
			return;
		}
		if (!this.state.title||this.state.title.length===0){
			this.setState({ infoMessage: 'Title not defined.' });
			return;
		}
		if (!this.state.noOfParticipants||this.state.noOfParticipantsList.length===0){
			this.setState({ infoMessage: 'No of participants not defined.' });
			return;
		}
		if (!this.state.startDate||this.state.startDate.length===0){
			this.setState({ infoMessage: 'Start date not defined.' });
			return;
		}
		if (!this.state.endDate||this.state.endDate.length===0){
			this.setState({ infoMessage: 'End date not defined.' });
			return;
		}
		if (this.state.startDate> this.state.endDate){
			this.setState({ infoMessage: 'End date cannot be a date before start date.' });
			return;
		}
		if (!this.state.registrationEndDate||this.state.registrationEndDate.length===0){
			this.setState({ infoMessage: 'Register end date not defined.' });
			return;
		}
		if (this.state.startDate< this.state.registrationEndDate){
			this.setState({ infoMessage: 'Registration closing date cannot be a date after start date.' });
			return;
		}

		let button = document.querySelector('button');
		button.innerHTML=this.state.modifing?'Modifying...':'Creating...';
		button.disabled=true;
		
		
		let firestore=firebase.firestore();
		let data={
			startDate: (new Date(this.state.startDate)).getTime(),
			endDate: (new Date(this.state.endDate)).getTime(),
			registrationEndDate: (new Date(this.state.registrationEndDate)).getTime(),
			postedBy: firebase.auth().currentUser.phoneNumber,
			type: this.state.level,
			level: this.state.level,
			game: this.state.game,
			title: this.state.title,
			noOfParticipants: this.state.noOfParticipants,
			details: this.state.details,
			for: this.state.for,
			teamsPerClass: this.state.teamsPerClass,
			teamsPerClassCount: this.state.teamsPerClassCount
		};
		if (this.state.modifing){
			let updatesBy = this.state.updatesBy||{};
			updatesBy[Date.now()]=firebase.auth().currentUser.phoneNumber;
			data.updatesBy=updatesBy;
			firestore.doc('tournaments/'+this.props.id).set(data,{ merge: true }).then(() => {
				this.setState({ infoMessage: 'Tournament sucessfully updated.',infoType: 'success' });
				setTimeout(() => {
					route('/admin/tournaments');
				},2000);
			},(e) => {
				this.setState({ infoMessage: 'Failed to update tournament. Reason:'+e.message });
			});
		}
		else {
			firestore.collection('tournaments').add(data).then(() => {
				this.setState({ infoMessage: 'Tournament sucessfully created.',infoType: 'success' });
				setTimeout(() => {
					route('/admin/tournaments');
				},2000);
			},(e) => {
				this.setState({ infoMessage: 'Failed to create tournament. Reason:'+e.message });
			});
		}
	}
	

	handleStartDate(value){
		
		if (!this.state.endDate)
			this.setState({ endDate: value });
		if (!this.state.registrationEndDate)
			this.setState({ registrationEndDate: value });
		
	}
	constructor(props){
		super(props);
		this.handleSubmit=this.handleSubmit.bind(this);
		let gamesList = generateGamesList();
		this.setState({ gamesList });
		setTimeout(() => {
			this.setState({ time: Date() });
		},3000);
		store.dispatch({ type: 'FORM_CHANGE',form: this });
		if (this.props.id){
			firebase.firestore().doc('tournaments/'+this.props.id).onSnapshot((d) => {
				if (!d.exists){
					route('/404');
					return;
				}
					
				this.setState(d.data());
				this.setState({
					fetching: false,
					startDate: (new Date(this.state.startDate)).toISOString().split('.')[0],
					endDate: (new Date(this.state.endDate)).toISOString().split('.')[0],
					registrationEndDate: (new Date(this.state.registrationEndDate)).toISOString().split('.')[0],
					modifing: true
				});
				
				if (!this.state.level)
					this.setState({ level: this.state.type });
				input({ target: { name: 'game',value: this.state.game } });
			});
			document.title='Modify Tournament';
		}
		else {
			this.setState({
				level: 'Inter-class',
				game: gamesList[0],
				for: 'Men',
				teamsPerClass: 'Limited',
				teamsPerClassCount: 1,
				fetching: false
			});
			document.title='Create Tournament';
			input({ target: { name: 'game',value: this.state.game } });
		}
		
		
	}
	render() {
			
		return this.state.fetching?<div>Fetching details...</div>:(
			<form method="post" onSubmit={this.handleSubmit} class={style.form}>
				
				<h1>{this.state.modifing?'Modify':'Create'} Tournament</h1>
					
				<div>
					<b>Level*: </b>
					<select name="level" value={this.state.level}  onchange={input}>
						<option value="Inter-class">Inter-Class</option>
						<option value="Inter-year">Inter-Year</option>
						<option value="Inter-department">Inter-Department</option>
						<option value="Inter-block">Inter-Block</option>
					</select>
				</div>
				<div>
					<b> Game*: </b>
					<select name="game" value={this.state.game} onchange={input}>
						{this.state.gamesList.map(i => <option>{i}</option>)}
					</select>
				</div>
				<div>
					<b> For*: </b>
					<select name="for" value={this.state.for} onchange={input}>
						<option>Men</option>
						<option>Women</option>
					</select>
				</div>
				<div>
					<b> Title*: </b>
					<input type="text" value={this.state.title} name="title" class={style.extraWidth}  onchange={input} />
				</div>
				<div>
					<b> No of participants*: </b>
					<select name="noOfParticipants" value={JSON.stringify(this.state.noOfParticipants)}  onchange={input}>
						{
							this.state.noOfParticipantsList.map(val => <option value={JSON.stringify(val)}>{val.text?val.text:val.required+'+'+val.substitute}</option>)
						}
					</select>
				</div>
				<div>
					<b> Count of teams per {this.state.level.replace('Inter-','')}*: </b>
					<input type="radio" name="teamsPerClass" onChange={input} value="Any" id="teamsPerClassAny" checked={this.state.teamsPerClass==='Any'} /><label for="teamsPerClassAny">Any</label>
					<input type="radio" name="teamsPerClass" onChange={input} value="Limited" id="teamsPerClassFixed"  checked={this.state.teamsPerClass==='Limited'} /><label for="teamsPerClassFixed">Limited</label>
				</div>
				{this.state.teamsPerClass==='Limited'?
					<div>
						<b> No of teams per {this.state.level.replace('Inter-','')}*: </b>
						<input type="number" name="teamPerClassCount"  onChange={input} value={this.state.teamsPerClassCount} />
					</div>
					:''}
				<div>
					<b> Event Start Date/Time*: </b>
					<input type="datetime-local" name="startDate" onchange={input} value={this.state.startDate} />
				</div>
				<div>
					<b> Event End Date/Time*: </b>
					<input type="datetime-local" name="endDate" value={this.state.endDate} onchange={input} />
						
				</div>
				<div>
					<b> Registration closes at*: </b>
					<input type="datetime-local" name="registrationEndDate" value={this.state.registrationEndDate} onchange={input} />
				</div>
				<div>
					<b> Description*: </b>
					<textarea name="details" onchange={input} placeholder="Enter additional details">
						{this.state.details}
					</textarea>
				</div>
				<Info that={this} />
				<div style="text-align:right">
					<button>{this.state.modifing?'Modify':'Create'}</button>
				</div>
			
			</form>
		);
	}
}

class ListTournament extends Component{
	state={
		tournamentsList: []
	}
	constructor(props){
		super(props);
		firebase.firestore().collection('tournaments').orderBy('startDate','desc').onSnapshot((e) => {

			this.setState({ tournamentsList: e.docs });
			e.forEach((f) => {
				f.ref.collection('registered_teams').onSnapshot((d) => this.setState({ [f.id]: d.size }));
				
			});
			
		});
		document.title='List Tournaments';
	}
	
	render(){
		return (<div>
			<div class={style.buttons}>
				<Link href="/admin/tournaments/create" class={style.button}>Create Tournament</Link>
			</div>
			<div>
				<h1>List of tournaments</h1>
			</div>
			<table class={style.overflowTable}>
				<tr>
					<th>Type</th>
					<th>For</th>
					<th>Game</th>
					<th>Title</th>
					<th>Participants</th>
					<th>Start Date</th>
					<th>Registration Close</th>
					<th>Teams registered</th>
					<th>&nbsp;</th>
				</tr>
				{
					this.state.tournamentsList.map(i =>
						(<tr>
							<td>{i.data().type}</td>
							<td>{i.data().for}</td>
							<td>{i.data().game}</td>
							<td>{i.data().title}</td>
							<td>{i.data().noOfParticipants.required+'+'+i.data().noOfParticipants.substitute}</td>
							<td>{convertToDate(i.data().startDate) }</td>
							<td>{convertToDate(i.data().registrationEndDate)}</td>
							<td>{this.state[i.id]}</td>
							<td>
								<Link href={'/admin/tournaments/view/'+i.data().level+'/'+i.id} class={style.button}>View </Link>
								<Link href={'/admin/tournaments/modify/'+i.id} class={style.button}>Modify </Link>
							</td>
						</tr>))
				}
					
			</table>
		</div>);
	}
}

class ListTeams extends Component{
	state={
		tournamentsList: [],
		year: '',
		course: '',
		section: '',
		date: 'desc'
	}
	
	handleSort(e){
		let col=String(e.target.innerText).toLowerCase().split(' ')[0];
		let val='asc';
		switch (this.state[col]){
			case 'asc':val='desc';break;
			case 'desc':val='';break;
		}
		this.setState({ [col]: val });
		this.sort();
	}
	sort(){
		let ref=firebase.firestore().collection('tournaments/'+this.props.id+'/registered_teams');
		
		if (this.state.year.length>0)
			ref=ref.orderBy('year',this.state.year);
		if (this.state.course.length>0)
			ref=ref.orderBy('course',this.state.course);
		if (this.state.section.length>0)
			ref=ref.orderBy('section',this.state.section);
		if (this.state.date.length>0)
			ref=ref.orderBy('date',this.state.date);
		
		
		ref.onSnapshot((e) => {
			this.setState({ tournamentsList: e.docs });
		});
	}
	constructor(props){
		super(props);
		this.sort();
		this.handleSort=this.handleSort.bind(this);
		document.title='List Teams';
	}
	render(){
		return (<div>
			<div>
				<Link href={'/tournaments/'+this.props.id+'/fixture'} class={style.button}>Generate Fixtures</Link>
			</div>
			<div>
				<h1>Registered Teams List</h1>
			</div>
			<table class={style.overflowTable}>
				{
					this.props.level==='Inter-class'||this.props.level==='Inter-year'?
						<tr>
							<th draggable="true">Sl. No.</th>
							<th draggable="true" onClick={this.handleSort}>Year <i class={icon('sort-numeric-'+this.state.year)} /></th>
							<th draggable="true" onClick={this.handleSort}>Course <i class={icon('sort-alpha-'+this.state.course)} /></th>
							<th draggable="true" onClick={this.handleSort}>Section <i class={icon('sort-alpha-'+this.state.section)} /></th>
							
							<th draggable="true">Captain</th>
							<th draggable="true">Captain Mobile</th>
							<th draggable="true">Registred By </th>
							<th draggable="true" onClick={this.handleSort}>Date registred <i class={icon('sort-numeric-'+this.state.date)} /></th>
							<th draggable="true">&nbsp;</th>
						</tr>:
						<tr>
							<th draggable="true">Sl. No.</th>
							<th draggable="true" onClick={this.handleSort}>{this.props.level.replace('Inter-','')} <i class={icon('sort-alpha-'+this.state[this.props.level.replace('Inter-','')])} /></th>
							
							<th draggable="true">Captain</th>
							<th draggable="true">Captain Mobile</th>
							<th draggable="true">Registred By </th>
							<th draggable="true" onClick={this.handleSort}>Date registred <i class={icon('sort-numeric-'+this.state.date)} /></th>
							<th draggable="true">&nbsp;</th>
						</tr>
				}
					
				{
					this.state.tournamentsList.map((i,j) =>
						this.props.level==='Inter-class'||this.props.level==='Inter-year'?
							<tr><td>{j+1}</td><td>{'I'.repeat(i.data().year)}</td><td>{i.data().course}</td><td>{i.data().section}</td><td>{i.data().captain}</td><td><a href={'tel:'+i.data().captainMobile}>{i.data().captainMobile}</a></td><td><a href={'tel:'+i.data().register_by}>{i.data().register_by}</a></td><td>{convertToDate(i.data().date)}</td><td><Link href={'/admin/tournaments/view/'+this.props.level+'/'+this.props.id+'/'+i.id} class={style.button}>Participants </Link><DeleteTeam tournament={this.props.id} team={i.id} that={this} /></td></tr>:
							<tr><td>{j+1}</td><td>{i.data()[this.props.level.replace('Inter-','')]}</td><td><a href={'tel:'+i.data().captainMobile}>{i.data().captainMobile}</a></td><td><a href={'tel:'+i.data().register_by}>{i.data().register_by}</a></td><td>{convertToDate(i.data().date)}</td><td><Link href={'/admin/tournaments/view/'+this.props.level+'/'+this.props.id+'/'+i.id} class={style.button}>Participants </Link><DeleteTeam  tournament={this.props.id} team={i.id} that={this} /></td></tr>
					)
				}
					
			</table>
		</div>);
	}
}

class ListParticipants extends Component{
	state={
		participantsList: [],
		data: {},
		count: 0
	}
	
	handlePrint(){
		window.open(window.location.protocol+'//'+window.location.host+'/print/entry-form/'+this.props.tid+'/'+this.props.id,'_blank');

		//window.open(window.location.host);
	}
	constructor(props){
		super(props);
		//console.log(convertToDate);
		this.handlePrint=this.handlePrint.bind(this);
		firebase.firestore().doc('tournaments/'+this.props.tid+'/registered_teams/'+this.props.id).onSnapshot((e) => {
			
			this.setState({ data: e.data(),participantsList: e.data().participants });
			
			
		});
		document.title='List Participants';
	}
	render(){
		return (<div class={style.page}>
			<div>
				<h1>Team Details</h1>
			</div>
			<div>
				<b>Captain:</b> {this.state.data.captain}
			</div>
			<div>
				<b>Captain Mobile:</b> <a href={'tel:'+this.state.data.captainMobile}>{this.state.data.captainMobile}</a>
			</div>
			{
				this.props.level==='Inter-class'||this.props.level==='Inter-year'?
					<div>
						<b>Class:</b> {this.state.data.year+' '+this.state.data.course+' '+this.state.data.section}
					</div>
					:<div>
						<b>{this.props.level.replace('Inter-','')}:</b> {this.state.data[this.props.level.replace('Inter-','')]}
					</div>
			}
			{this.state.data.classGuide?
				<div>
					<b>Class Guide:</b> {this.state.data.classGuide}
				</div>
				:''}
			<div>
				<b>Registered By :</b> <a href={'tel:'+this.state.data.register_by}>{this.state.data.register_by}</a>
			</div>
			<div>
				<b>Date:</b> {convertToDate(this.state.data.date)}
			</div>
			<table class={style.overflowTable}>
				<tr>
					<th>Sl. No.</th>
					<th>Register Number</th>
					<th>Name</th>
						
				</tr>
				{
						
					Object.keys(this.state.participantsList).map((i) => <tr><td>{++this.state.count}</td><td>{i}</td><td>{this.state.data.participants[i]}</td></tr>)
				}
					
			</table>
			<div>
				<button onClick={this.handlePrint}>Print</button>
			</div>
		</div>);
	}
}

export default class AdminTournaments extends Component {
	
	
	handleRoute(e){
		
		this.setState({ url: e.current.attributes.path });
	
	}
	constructor(props){
		super(props);
		this.handleRoute=this.handleRoute.bind(this);
		
	}
	render() {
		return (
			<div class={style.tournament}>
				<div class={style.title}>Tournaments</div>
				
				<div class={style.card+' '+style.regForm}>
					<Router onChange={this.handleRoute}>
						<ListTournament path="/admin/tournaments/list" default />
						<CreateTournament path="/admin/tournaments/create" />
						<CreateTournament path="/admin/tournaments/modify/:id" />
						<ListTeams path="/admin/tournaments/view/:level/:id" />
						<ListParticipants path="/admin/tournaments/view/:level/:tid/:id" />
					</Router>
				</div>
			</div>
		);
	}
}
