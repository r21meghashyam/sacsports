import { h } from 'preact';
import { route } from 'preact-router';
import * as firebase from 'firebase';

const Logout=() => firebase.auth().signOut().then(() => route('/'));

export default Logout;