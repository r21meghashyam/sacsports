import { h, Component } from 'preact';
import style from './style';

import { route } from 'preact-router';
import * as firebase from 'firebase';
import { Country,store,input,Info,convertToDate } from '../../lib';

export default class Registration extends Component {
	
	state={

		sections: [],
		infoType: 'error',
		participantsList: [],
		
		hideSections: false,
		phone: ['India','in',91,'+.. .....-.....'],
		captainMobile: 91
	}


	handleSubmit(event){
		event.preventDefault();
		
		if (!firebase.auth().currentUser){
			this.setState({ infoMessage: 'You must be logged in to register.' });
			return;
		}
		if (this.state.level==='Inter-class'){
			if (!this.state.year||this.state.year.length===0){
				this.setState({ infoMessage: 'Please select year' });
				return;
			}
			if (!this.state.course||this.state.course.length===0){
				this.setState({ infoMessage: 'Please select course' });
				return;
			}
			if (!this.state.section||this.state.section.length===0){
				this.setState({ infoMessage: 'Please select section' });
				return;
			}
		}
		if (this.state.level==='Inter-department'){
			if (!this.state.department||this.state.department.length===0){
				this.setState({ infoMessage: 'Please select department' });
				return;
			}
		}

		if (this.state.level==='Inter-block'){
			if (!this.state.block||this.state.block.length===0){
				this.setState({ infoMessage: 'Please select block' });
				return;
			}
		}
		
		if (!this.state.captain||this.state.captain.length===0){
			this.setState({ infoMessage: 'Please enter captain name' });
			return;
		}
		if (!this.state.captainMobile||isNaN(this.state.captainMobile)){
			this.setState({ infoMessage: 'Invalid phone number',addButton: 'ADD' });
			return;
		}
		if (this.state.captainMobile.length!==this.state.phone[3].match(/\./g).length){
			this.setState({ infoMessage: 'Does not appear as a phone number from '+this.state.phone[0],addButton: 'ADD' });
			
			return;
		}
		if (this.state.level==='Inter-class')
			if (!this.state.classGuide||this.state.classGuide.length===0){
				this.setState({ infoMessage: 'Please enter class guide name' });
				return;
			}
		
			
		let participantsList={};
		
		for (let i=1;i<=this.state.participantsList.length;i++){
			let validate=false;
			if (i<=this.state.required)
				validate=true;
			if (this.state['reg['+i+']']&&this.state['reg['+i+']'].length>0)
				validate=true;
			if (this.state['name['+i+']']&&this.state['reg['+i+']'].length>0)
				validate=true;
			if (validate){
				if (this.state['reg['+i+']']&&!this.state['name['+i+']']){
					this.setState({ infoMessage: 'Name is missing for register number  '+this.state['reg['+i+']'] });
					return;
				}

				if (!this.state['reg['+i+']']&&this.state['name['+i+']']){
					this.setState({ infoMessage: 'Register Number is missing for  '+this.state['name['+i+']'] });
					return;
				}
				if (!this.state['reg['+i+']']||this.state['reg['+i+']'].length===0){
					this.setState({ infoMessage: 'Enter row '+i+' register number' });
					return;
				}
				if (!(this.state['reg['+i+']'].length===6||this.state['reg['+i+']'].length===7)||isNaN(this.state['reg['+i+']'])){
					this.setState({ infoMessage: 'Invalid register number at row '+i });
					return;
				}
				if (!this.state['name['+i+']']||this.state['name['+i+']'].length===0){
					this.setState({ infoMessage: 'Enter row '+i+' name' });
					return;
				}
				
				if (participantsList[this.state['reg['+i+']']]){
					this.setState({ infoMessage: 'Student '+this.state['reg['+i+']']+' has been listed more than once.' });
					return;
				}
				
				
				participantsList[this.state['reg['+i+']']]=this.state['name['+i+']'];
				
			}
		}
		let button = document.querySelector('.'+style.form+' button');
		//console.log(button);
		button.disabled=true;
		button.innerHTML='Submitting...';
		if (this.state.teamsPerClass==='Limited'){
			let unsubscribe=firebase.firestore().doc('tournaments/'+this.props.id).collection('registered_teams').onSnapshot((d) => {
				//console.log('LIMITED',this.props.id);
				
				let docs = d.docs;
				let count=0;
				docs.map(i => {
					if (this.state.level==='Inter-class'||this.state.level==='Inter-year'){
						let year=i.data().year;
						let course=i.data().course;
						let section=i.data().section;
						if (this.state.year===year&&this.state.course===course&&this.state.section===section)
							count++;
					}
					if (this.state.level==='Inter-department'){
						let department=i.data().department;
						if (this.state.department===department)
							count++;
					}
					if (this.state.level==='Inter-block'){
						let block=i.data().block;
						if (this.state.block===block)
							count++;
					}
					//console.log(count);
					
					
				});
				unsubscribe();
				//console.log('teamcount',this.state.teamsPerClassCount,count);
				if (this.state.teamsPerClassCount<=count){
					this.setState({ infoMessage: 'Your '+this.state.level.replace('Inter-','')+' has already registered. Please contact the physical director for any modification.' });
					button.disabled=true;
					return;
				}
				this.add(participantsList);
				
			});
		}
		else
			this.add(participantsList);
		
		
	}

	add(participantsList){
		let data = {
			
			captain: this.state.captain,
			captainMobile: '+'+this.state.captainMobile,
			participants: participantsList,
			date: Date.now(),
			register_by: firebase.auth().currentUser.phoneNumber
		};
		
		if (this.state.level==='Inter-class')
			data.classGuide=this.state.classGuide;
		if (this.state.level==='Inter-class'||this.state.level==='Inter-year'){
			data.year=this.state.year;
			data.course=this.state.course;
			data.section=this.state.section;
		}
		if (this.state.level==='Inter-department')
			data.department=this.state.department;
		if (this.state.level==='Inter-block')
			data.block=this.state.block;
		firebase.firestore().doc('tournaments/'+this.props.id).collection('registered_teams').add(data).then(() => {
			this.setState({ page: 2 });
		},(e) => {
			this.setState({ infoMessage: 'Failed to register. Reason: '+e.message });
		});
	}

	submitted(){
		return (
			<div class={style.register}>
				<div class={style.title}>Submitted</div>
				<div class={style.card}>
					Your application is submitted. Contact Department of Physical Education for further clarification.
				</div>
			</div>
	
		);
	}
	
	constructor(props){
		
		super(props);
		
		
		this.handleSubmit=this.handleSubmit.bind(this);
		
		
		firebase.firestore().doc('/tournaments/'+this.props.id).onSnapshot((snapshot) => {
			if (!snapshot.exists){
				route('/404');
				return;
			}
			
			let d = snapshot.data();
			if (d.registrationEndDate<Date.now()){
				route('/404');
				return;
			}

			this.setState({
				render: true,
				title: d.title,
				desc: d.details,
				type: d.type,
				level: d.level,
				startDate: d.startDate,
				endDate: d.endDate,
				registrationEndDate: d.registrationEndDate,
				game: d.game,
				for: d.for,
				noOfParticipants: d.noOfParticipants,
				required: d.noOfParticipants.required,
				substitute: d.noOfParticipants.substitute,
				text: d.noOfParticipants.text,
				id: this.props.id,
				teamsPerClass: d.teamsPerClass,
				teamsPerClassCount: d.teamsPerClassCount
			});
			let total = Number(this.state.required)+Number(this.state.substitute);
			this.setState({ participantsList: Array(total).fill(1).map((v,i) => i) });
		
		});
		store.dispatch({ type: 'FORM_CHANGE',form: this });
	}
	
	render(){
		
		return this.state.page===2?this.submitted():(
			<div class={style.register}>
				<form method="post" onSubmit={this.handleSubmit} >
					<div class={style.title}>Registration</div>
					<div class={style.card+' '+style.form}>

					
						<div class={style.note}>
							<h3>Note:</h3>
							<ul>
								<li>Only registered class representatives of your class can register for team events.</li>
								<li> All fields marked * must be filled compulsorily</li>
							</ul>
							<pre>
								{this.state.desc}
							</pre>
						</div>
						<div>
							<b>Tournament: </b>
							{this.state.title}
						</div>
						<div>
							<b>For: </b>
							{this.state.for}
						</div>
					
						<div>
							<b> No of participants*: </b>
							{this.state.text?this.state.text:this.state.required+'+'+this.state.substitute}
						</div>
					
						{this.state.level==='Inter-class'||this.state.level==='Inter-year'?
							<div>
								<b>Class*: </b>
								<select name="year" onchange={input}>
									<option>Year</option>
									<option value="1">1st</option>
									<option value="2">2nd</option>
									<option value="3">3rd</option>
								</select>
								<select name="course" onChange={input}>
									<option>Course</option>
									<option>BA</option>
									<option>BSc</option>
									<option>BCom</option>
									<option>BBA</option>
									<option>BCA</option>
									<option>BVoc</option>
								</select>
								{
									this.state.hideSections?'':<select name="section" onchange={input}>
										<option>Section</option>
										{
											this.state.sections.map(val => <option>{val}</option>)
										}
									</select>
								}
						
							</div>
							:(this.state.level==='Inter-department'?
								<div>
									<b>Department*: </b>
									<select name="department" onchange={input}>
										<option>Department</option>
										<option>BA</option>
										<option>BSc</option>
										<option>BCom</option>
										<option>BBA</option>
										<option>BCA</option>
										<option>BVoc</option>
									</select>
						
								</div>:(this.state.level==='Inter-block'?
									<div>
										<b>Block*: </b>
										<select name="block" onchange={input}>
											<option>Block</option>
											<option value="admin">Administrative Block</option>
											<option value="arrupe">Arrupe Block</option>
											<option value="lcri">LCRI Block</option>
											<option value="maffei">Maffei (IT) Block</option>
											<option value="science">Science Block</option>
										</select>
						
									</div>:''))
						}
					
						<div>
							<b> Name of the captain/In-charge* : </b>
							<input type="text" name="captain" onchange={input} />
						</div>

						<div>
							<b> Mobile No of the captian/In-charge*: </b>
							<Country that={this} name="captainMobile" />
						</div>
						{this.state.level==='Inter-class'?
							<div>
								<b> Name of your class guide : </b>
								<input type="text" name="classGuide" onchange={input} />
							</div>
							:''}
					
						{this.state.participantsList.length>0?
							<table class={style.style1}>
								<caption>Team Details</caption>
								<thead>
									<th>No.</th>
									<th>Register Number</th>
									<th>Name</th>
								</thead>
								<tbody>
									{
										this.state.participantsList.map((value) =>
											(<tr class={value%2===0?style.rowColor:''}>
												<td>{value+1}{value+1> this.state.required?'':'*'}</td>
												<td>
													<input type="number" name={'reg['+(value+1)+']'}  onchange={input} />
												</td>
												<td>
													<input type="text" name={'name['+(value+1)+']'} onchange={input} />
												</td>
								
											</tr>)
										)
									}
								</tbody>
							</table>
							:''}

						<b>Date: {convertToDate(Date.now())}</b>
						<Info that={this} />
						<div style="text-align:right">
							<button>Submit</button>
						</div>
					</div>
				</form>
			</div>
		);
	}
	
	
}
