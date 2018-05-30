import { h,Component } from 'preact';
import style from './style';
import { createStore } from 'redux';
import countries from './countries';

/**
 * Converts timestamp value to a Date String.
 * @param {number} timestamp Timestamp in seconds
 */
export const convertToDate=(timestamp) => {
	if (!timestamp)
		return;
	let d = new Date(timestamp);
	let date = d.getDate();
	let postfix = 'th';
	if (date%10===1&&date!==11)
		postfix='st';
	if (date%10===2&&date!==12)
		postfix='nd';
	if (date%10===3&&date!==13)
		postfix='rd';

	let months=['January','Febuary','March','April','May','June','July','August','September','October','November','December'];
	let month=months[d.getMonth()];

	let hours = d.getHours();
	let median = 'am';
	if (hours>11)
		median='pm';
	if (hours>12)
		hours-=12;
	
	if (hours<10)
		hours='0'+hours;

	let minutes = d.getMinutes();
	if (minutes<10)
		minutes='0'+minutes;

	return <span>{date}<sup>{postfix}</sup> {month} {d.getFullYear()} {hours}:{minutes} {median}</span>;
};

/**
 * Generates an string of length 'size' containing random alphanumeric characters of both uppercase and lowercase.
 * @param {number} size Length of the random key. Default to 128.
 */
export const generateRandomKey=(size=128) => {
	let r=Math.random;
	let string = '';
	while (string.length<size){
		let ch=(Number(r().toString().substr(2,2))%36).toString(36);
		let upper = Number(r().toString()[2])%2;
		if (upper>0)
			ch=ch.toUpperCase();
		string+=ch;
	}
	return string;
};

/**
 * Returns an array with list of games name.
 */
export const generateGamesList=() => [
	'Football',
	'Basketball',
	'Kabaddi',
	'Volleyball',
	'Throwball',
	'Cricket',
	'Softball',
	'Hockey',
	'Handball',
	'Badminton',
	'Chess',
	'Table Tennis',
	'Tennikoit',
	'Tug of war'
].sort();

/**
 * Mixes all the classes passed as argument and returns one string containing all the classes seperated with spaces.
 * @param {*} e List of class names passes ass arguments
 */
export const classList=(...e) => e.toString().replace(/,/g,' ');

/**
 * Sets section of state of the calling component array containg sections for the particular course.
 * @param {String} course Name of the course
 * @param {Object} that this pointer of the component
 */
export const getSections=(course,that) => {
	that.setState({ hideSections: false });
	switch (course){
		case 'BA' :
			that.state.level==='Inter-year'?
				that.setState({ hideSections: true,section: 'ALL' }):
				that.setState({ sections: ['A & C','B'] });
			break;
		case 'BBA' :
			that.state.level==='Inter-year'?
				that.setState({ hideSections: true,section: 'ALL' }):
				that.setState({ sections: ['A','B','C','D'] });
			break;
		case 'BCA' :
			that.state.level==='Inter-year'?
				that.setState({ hideSections: true,section: 'ALL' }):
				that.setState({ sections: ['A','B'] });
			break;
		case 'BCom' : that.setState({ sections: (that.state.level==='Inter-year')?['ACE','BDF']:['A','B','C','D','E','F'] });break;
		case 'BSc' : that.setState({
			sections:
				(that.state.level==='Inter-year')?
					['PS','BS']:
					(
						Number(that.state.year)===1?
							['PCM','PEM+PSM+EcSM','ECSM+PESM+SCSM','CBZ+CMZ+CMB','BCBZ+BCCZ+BCCB+BTCZ+BTCB']:
							['PCM','PEM+ECSM+SESM+PCSM+SECM+PSM+PCAM','CBZ+CMZ+CMB','BCBZ+BCCZ+BCCB+BTCZ+BTCB']
					)
		});break;
		case 'BVoc': that.setState({ hideSections: true,section: 'ALL' });
	}

};

export class Flag extends Component{
	handleClick(){
		this.props.onClick(this.props.id);
	}

	constructor(props){
		super(props);
		this.handleClick=this.handleClick.bind(this);
	}

	componentWillReceiveProps(newProps){
		this.props=newProps;
	}

	render(){
		return <div onClick={this.handleClick}><i class={'flag '+this.props.id[1]} /> {this.props.id[0]} (+{this.props.id[2]})</div>;
	}
}


export class Info extends Component{
	state={
		show: false
	}
	hide(){
		this.setState({ show: false });
		this.props.that.setState({ infoMessage: null });
	}
	constructor(props){
		super(props);
		this.hide=this.hide.bind(this);
		
	}
	componentWillReceiveProps(props){
		if (!empty(props.that.state.infoMessage))
			this.setState({ show: true });
	}
	
	render(){
		return this.state.show?
			(<div class={classList(style.info,style[this.props.that.state.infoType])} onClick={this.hide}><i class={icon(this.props.that.state.infoType==='success'?'info-circle':'exclamation-circle')} /> {this.props.that.state.infoMessage} <i class={style.small}>(Click to disappear)</i></div>)
			:false;
	}
}

export class Country extends Component{
	state={
		show: false,
		phone: ['India','in',91,'+.. .....-.....'],
		phoneNumber: 91,
		showList: false
	}
	handleForm(e){
		
		this.setState({ phoneNumber: e.target.value });
		this.props.that.setState({ [this.props.name]: e.target.value });
	}
	handleISDCode(){
		this.setState({ showList: !this.state.showList });
		
	}
	setISD(e){
		this.setState({ phone: e,phoneNumber: e[2],showList: false });
		this.props.that.setState({ [this.props.name]: this.state.phoneNumber,phone: e });
	}
	constructor(props){
		super(props);
		this.handleForm=this.handleForm.bind(this);
		this.handleISDCode=this.handleISDCode.bind(this);
		this.setISD=this.setISD.bind(this);
	}
	componentWillReceiveProps(props){
		this.setState({ phoneNumber: props.that.state[this.props.name] });
	}
	
	
	render(){
		return (
			<div class={style.phoneInput+' f32'}>
				<div class={style.selected} onClick={this.handleISDCode}>
					<i class={'flag '+this.state.phone[1]} /><i class={icon('caret-down')} />+
				</div>
				
				<div>
					<input type="number" name="phoneNumber" autocomplete="tel-national" value={this.state.phoneNumber} onKeyUp={this.handleForm} />
				</div>
				{this.state.showList?
					<div class={style.countries_list+' f32'}>
						{countries.map(i =>
							<Flag id={i} onClick={this.setISD} />
						)}
					</div>
					:
					''
				}
			</div>);
	}
}

export const store=createStore((state={},action) => {
	Object.assign(state,action);
	
	return state;

});

export const handleGame=(value,that) => {
	let noOfParticipantsList=[];
	switch (value){
		case 'Football' :
			noOfParticipantsList.push({ required: 11,substitute: 5 });
			noOfParticipantsList.push({ required: 9,substitute: 3 });
			noOfParticipantsList.push({ required: 7,substitute: 5 });
			noOfParticipantsList.push({ required: 5,substitute: 3 });
			break;
		case 'Basketball' :
			noOfParticipantsList.push({ required: 5,substitute: 7 });
			noOfParticipantsList.push({ required: 5,substitute: 5 });
			noOfParticipantsList.push({ required: 3,substitute: 2 });
			break;
		case 'Kabaddi' :
			noOfParticipantsList.push({ required: 7,substitute: 5 });
			
			break;
		case 'Volleyball' :
			noOfParticipantsList.push({ required: 6,substitute: 6 });
			noOfParticipantsList.push({ required: 3,substitute: 2 });
			break;
		case 'Throwball' :
			noOfParticipantsList.push({ required: 7,substitute: 5 });
			break;
		case 'Cricket' :
			noOfParticipantsList.push({ required: 11,substitute: 4 });
			break;
		case 'Softball' :
			noOfParticipantsList.push({ required: 9,substitute: 5 });
			break;
		case 'Hockey' :
			noOfParticipantsList.push({ required: 11,substitute: 5 });
			noOfParticipantsList.push({ required: 5,substitute: 3 });
			break;
		case 'Handball' :
			noOfParticipantsList.push({ required: 7 ,substitute: 7 });
			noOfParticipantsList.push({ required: 5 ,substitute: 3 });
			break;
		case 'Badminton' :
		case 'Table Tennis' :
		case 'Tennikoit' :
		case 'Chess' :
			noOfParticipantsList.push({ required: 2,substitute: 0,text: 'doubles' });
			noOfParticipantsList.push({ required: 1,substitute: 0,text: 'singles' });
			break;
		case 'Tug of war':
			noOfParticipantsList.push({ required: 10,substitute: 0 });
			break;

	}
	// let element=document.querySelector('[name=noOfParticipants]');
	that.setState({ noOfParticipantsList,noOfParticipants: noOfParticipantsList[0] });
	// if (element.options.length>0)
	// 	element.value=element.options[0].value;
	// that.initState('noOfParticipants');
	
};

export const input=(event) => {
	
	let node=event.target;
	let form = store.getState().form;
	if (node.type==='checkbox')
		form.setState({ [node.name]: !form.state[node.name] });
	else
		form.setState({ [node.name]: node.value });
	switch (node.name){
		case 'course':
		case 'year': getSections(form.state.course,form);break;
		case 'game':handleGame(node.value,form);break;
		case 'startDate':form.handleStartDate(node.value);break;
		case 'noOfParticipants':form.setState({ noOfParticipants: JSON.parse(node.value) });break;
	}

	if (form.constructor.name==='CreateTournament'){
		let oldValue = form.state.title;
		let value=form.state.level+' '+form.state.game+' tournament ('+form.state.for+')';
		if (!oldValue||oldValue.length){
			form.setState({ title: value });
		}
	}
};

export const empty=v => !v||v.length===0;

export const initCap= t => t.charAt(0).toUpperCase()+t.substr(1,t.length);


export const icon = (id,type) => classList(style[type]||style.fa,style['fa-'+id]);

export const handleRoute = e => store.dispatch({ type: 'ROUTE_CHANGED',page: e.current.attributes.path });