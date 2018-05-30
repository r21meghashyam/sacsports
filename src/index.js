import './style';
import App from './components/app';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { store } from './lib';


firebase.initializeApp({
	apiKey: 'AIzaSyC_1lPjLZAjO8vNwtLpi8jgFGGE5h35cgw',
	authDomain: 'sacsports-b8f9d.firebaseapp.com',
	databaseURL: 'https://sacsports-b8f9d.firebaseio.com',
	projectId: 'sacsports-b8f9d',
	storageBucket: 'sacsports-b8f9d.appspot.com',
	messagingSenderId: '504567376967'
});
firebase.auth().onAuthStateChanged(i => store.dispatch({ type: 'AUTH_CHANGE', state: i }));

let firestore = firebase.firestore();
const settings = { timestampsInSnapshots: true };
firestore.settings(settings);

export default App;
