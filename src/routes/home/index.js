import { h, Component } from 'preact';
import style from './style';
import { Link } from 'preact-router';
import * as firebase from 'firebase';
import { convertToDate, icon } from '../../lib';

class Card extends Component{
	gdate(date){
		let d=new Date(date);
		return d.toLocaleString('en-us', {
			weekday: 'short',
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour12: true,
			hour: 'numeric',
			minute: 'numeric',
			timeZoneName: 'long',
			timeZone: 'Asia/Kolkata'
		});
	}
	render(){
		return (
			<div class={style.card}>
				<h1>{this.props.data.data().title}</h1>
				<pre>
					{this.props.data.data().details.substr(0,100)}
				</pre>
				<div>
					<i class={icon('calendar')} /> Starts on {convertToDate(this.props.data.data().startDate)}
				</div>
				<div>
					<i class={icon('pencil')} /> Registration closes on  {convertToDate(this.props.data.data().registrationEndDate)}
				</div>
				<div>
					<Link href={'/tournaments/register/'+this.props.data.id}><button>Register your team</button></Link>
				</div>
			</div>
		);
	}
}

export default class Home extends Component {
	state={
		cards: []
	}
	constructor(props){
		super(props);
		firebase.firestore().collection('tournaments').where('registrationEndDate','>',Date.now()).orderBy('registrationEndDate','desc').onSnapshot((e) => {
			if (e.docs.length===0&&window.navigator.onLine)
				this.setState({ noTournaments: true });
			this.setState({ cards: e.docs });
		});
		document.title='Sports | St. Aloysius College, Mangaluru';
	}
	render() {
		
		return (
			<div>
				<div class={style.home}>
					<h1 style="text-align:center;">Department of Physical Education,<br /> St. Aloysius College, <br />Mangaluru.</h1>
					
				</div>
				{
					this.state.cards.length>0?
						this.state.cards.map((e) => <Card data={e} />):
						<div class={style.card}>
							{this.state.noTournaments?'Currently there is no tournament to register.':<div class={style.skeleton} />}
					
						
						</div>
				}
				
				
			</div>
			
		);
	}
}
 