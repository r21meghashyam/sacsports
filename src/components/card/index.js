import { h } from 'preact';
import style from './style';
import { convertToDate, icon } from '../../lib';
import { Link } from 'preact-router';

const Card = ({ doc }) => (
	
	<div class={style.card}>
		
		<h1>{doc.data().title}</h1>
		<pre>
			{doc.data().details.substr(0,100)}
		</pre>
		<div>
			<i class={icon('calendar')} /> Starts on {convertToDate(doc.data().startDate)}
		</div>
		<div>
			<i class={icon('pencil')} /> Registration closes on  {convertToDate(doc.data().registrationEndDate)}
		</div>
		<div>
			<Link href={'/tournaments/register/'+doc.id}><button>Register your team</button></Link>
		</div>
	</div>
);

export default Card;