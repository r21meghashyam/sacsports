import { h, Component } from 'preact';
import style from './style';

export default class Title extends Component{
	componentDidUpdate(props){
		document.title=this.props.children[0]+' | St. Aloysius Network';
	}
	render = ({ children }) => (
		<div>
			<div class={style.title}>{children[0]}</div>
		</div>
	);
}
