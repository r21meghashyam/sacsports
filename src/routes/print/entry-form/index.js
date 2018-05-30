import { h, Component } from 'preact';
import style from './style.less';
import * as firebase from 'firebase';
import { initCap } from '../../lib';

export default class EntryForm extends Component {
	state={
		participantsContact: {},
		block: '',
		department: ''
	}
	constructor(props){
		super(props);
		let tdoc=firebase.firestore().doc('tournaments/'+this.props.tid);
		tdoc.onSnapshot((d) => {
			let v=d.data();
			this.setState({
				game: v.game,
				for: v.for,
				level: v.level,
				noOfParticipants: v.noOfParticipants
			});
			
			tdoc.collection('registered_teams').doc(this.props.cid).onSnapshot((t) => {
				let data= t.data();
				this.setState({
					loaded: true,
					
					captain: data.captain,
					captainMobile: data.captainMobile,
					classGuide: data.classGuide,
					participants: data.participants
				});
				if (this.state.level==='Inter-class'||this.state.level==='Inter-year')
					this.setState({ className: 'I'.repeat(data.year)+' '+data.course+' '+data.section });
				else
					this.setState({ [this.state.level.replace('Inter-','')]: data[this.state.level.replace('Inter-','')] });
				let users=firebase.firestore().collection('users');
				
				Object.keys(data.participants).map(reg => {
					//console.log(reg);
					users.where('registerNumber','==',reg).onSnapshot(d => {
						
						if (d.docs.length){
							
							let participantsContact= this.state.participantsContact;
							participantsContact[reg]=d.docs[0].id;
							this.setState({ participantsContact });
						}
					});
				});
					
				
			});
		});
	}
	render() {
		let i=1;
		return (this.state.loaded?
			<div class={style.printLayout}>
				
				<div class={style.fs1}>St. Aloysius College, (Autonomous) Mangalore</div>
				<div class={style.fs1}>DEPARTMENT OF PHYSICAL EDUCATION</div>
				<div class={style.fs2+' '+style.u}>{this.state.level} Competition Entry Form</div>
				<div class={style.body}>
					<div class={style.fs2+' '+style.gap}>
						{
							this.props.level==='Inter-class'||this.props.level==='Inter-year'?
								<div>
									<b>Class:</b> {this.state.className}
								</div>
								:<div>
						
									<b>{initCap(this.state.level.replace('Inter-',''))}:</b> {this.state[this.state.level.replace('Inter-','')]}
								</div>
						}
						<div>Game: {this.state.game} ({this.state.for})</div>
						<div>Captain Name: {this.state.captain}</div>
						<div>Captain Phone Number: {this.state.captainMobile}</div>
						{this.state.level==='Inter-class'?
							<div>Class Guide: {this.state.classGuide}</div>
							:''}
					</div>
					<table>
						<tr><th>Sl. No.</th><th>Reg. No.</th><th>Name of the Player</th><th>Contact No.</th><th>Remarks</th></tr>
						{
							Object.keys(this.state.participants).map((k) => <tr><th>{i++}</th><td>{k}</td><td>{this.state.participants[k]}</td><td>{this.state.participantsContact[k]}</td><td /></tr>)
						}
						{
							'.'
								.repeat(this.state.noOfParticipants.required+this.state.noOfParticipants.substitute-Object.keys(this.state.participants).length)
								.split('')
								.map(() => <tr><th>{i++}</th><td /><td /><td /><td /></tr>)
						}
					</table>
				</div>
			</div>
			
			:'Loading...');
	}
}
 