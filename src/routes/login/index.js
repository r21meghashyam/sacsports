import { h, Component } from 'preact';
import style from './style';
import { route } from 'preact-router';
import * as firebase from 'firebase';
import { Country,input,store,Info } from '../../lib';

export default class Login extends Component {
	 

	handleSubmit(event){
		
		event.preventDefault();

		let element=document.querySelector('button');
		
		if (this.state.recaptchaWidgetId===null){
			this.setState({ infoMessage: 'Some error occured. Reload the page.' });
			return;
		}
		if (this.state.phoneNumber.length!==this.state.phone[3].match(/\./g).length){
			this.setState({ infoMessage: 'Does not appear as a phone number from '+this.state.phone[0] });
			
			return;
		}
		
		element.innerHTML='Please wait...';
		element.disabled=true;
		//let d = grecaptcha.getResponse(this.state.recaptchaWidgetId);
		firebase.auth().signInWithPhoneNumber('+'+this.state.phoneNumber, this.state.recaptchaVerifier)
			.then((confirmationResult) => {
				this.state.recaptchaVerifier.clear();
				// SMS sent. Prompt user to type the code from the message, then sign the
				// user in with confirmationResult.confirm(code).
				this.setState({ confirmationResult,page: 'verify' });
			},() => {
			}).catch( (error) => {
			// Error; SMS not sent
			// ...
				this.setState({ infoMessage: 'Error: message could not sent. Reload and try again' });
			});
		
	}


	state={
		message: '',
		page: 'entry',
		phone: ['India','in',91,'+.. .....-.....'],
		phoneNumber: 91
	}
	handleResend(e){
		e.preventDefault();
		firebase.auth().signInWithPhoneNumber('+'+this.state.phoneNumber, this.state.recaptchaVerifier)
			.then((confirmationResult) => {
				this.state.recaptchaVerifier.clear();
				// SMS sent. Prompt user to type the code from the message, then sign the
				// user in with confirmationResult.confirm(code).
				this.setState({ confirmationResult,infoMessage: 'Code has been resent.' });
			},() => {
			}).catch( (error) => {
			// Error; SMS not sent
			// ...
				this.setState({ infoMessage: 'Error: message could not sent. Reload and try again' });
			});
	}
	verify(){
		return (<form method="post" onSubmit={this.handleVerify}>
			<div class={style.title}>Verify Code</div>
			<div class={style.card+' '+style.regForm}>
				<div>An verification code has been sent to your phone number <b>+{this.state.phoneNumber}</b>. Enter the code in the below field and press <b>Verify Code</b> to Log in.</div>
				<div>
					<b>Enter verification code: </b><br />
					<input type="text" name="code" onChange={input} autocomplete="off" />
				</div>
				<Info that={this} />
				<div>
					<button>Verify Code</button><button onClick={this.handleResend}>Resend code</button>
				</div>
			</div>
		</form>);
	}

	handleVerify(event){
		event.preventDefault();
		let element=document.querySelector('button');
		element.innerHTML='Please wait...';
		element.disabled=true;

		this.state.confirmationResult.confirm(this.state.code).then( () => {
			//firebase.database().ref("users").child(firebase.auth().currentUser.uid).set({number:this.state.mobile})
			route('/');
			// ...
		}).catch( (error) => {
			// User couldn't sign in (bad verification code?)
			// ...
			this.setState({ infoMessage: error.message });
		});
	}
 
	constructor(props){
		super(props);
		this.handleSubmit=this.handleSubmit.bind(this);
		this.handleVerify=this.handleVerify.bind(this);
		this.handleResend=this.handleResend.bind(this);
		store.dispatch({ type: 'FORM_CHANGE',form: this });
	}
	
	componentDidMount(){
		
		/*eslint-disable */
		this.setState({
			recaptchaVerifier: new firebase.auth.RecaptchaVerifier('submit',{
				size: 'invisible',
				callback: (response) => {
				  // reCAPTCHA solved, allow signInWithPhoneNumber.
				  
				  
				}
			  })
		});
		/*eslint-enable */

		
	}
	render() {
		return this.state.page!=='entry'?this.verify():(
			<form method="post" onSubmit={this.handleSubmit}>
				<div class={style.title}>Login</div>
				<div class={style.card+' '+style.regForm}>
					<div>
						<div>Enter your phone number:</div>
						<Country that={this} name="phoneNumber" />
					</div>
					<Info that={this} />
					<div>
						<button id="submit">Send verification code to my phone number</button>
					</div>
				</div>
			</form>
		);
	}
}
