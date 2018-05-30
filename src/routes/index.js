import { Router } from 'preact-router';
import { handleRoute } from '../lib';

//Components
import Title from '../components/title';

//PAGES
import Home from './home';
import Registration from './register';
import Login from './Login';
import Tournament from './tournaments';
import Admin from './admin';
import Profile from './profile';
import About from './about';
import Report from './report';
import Update from './update';
import AppPage from './admin/app';
import Stocks from './admin/stocks';
import Attendance from './student/attendance';
import AttendanceManagement from './staff/attendance';
import ClassManagement from './admin/class';
import Logout from './logout';

const Routes  = () => (
	<Router onChange={handleRoute}>
		<Home path="/" />
		<Registration path="tournaments/register/:id" />
		<Tournament path="/tournaments" />
		<Tournament path="/tournaments/:tab" />
		<Tournament path="/tournaments/:tid/fixture" />
		<Login path="/login" />
		<Admin path="/admin" />
		<Logout path="/logout" />
		<Profile path="/profile" />
		<About path="/about" />
		<Report path="/report" />
		<Update path="/update" />
		<AppPage path="/admin/app" />
		<Stocks path="/admin/stocks" />
		<Stocks path="/admin/stocks/:any" />
		<Attendance path="/student/attendance" />
		<Attendance path="/student/attendance/:tab" />
		<AttendanceManagement path="/staff/attendance" />
		<AttendanceManagement path="/staff/attendance/:tab" />
		<ClassManagement path="/admin/attendance" />
		<ClassManagement path="/admin/attendance/:tab" />
		<Title default>
			Page Not Found
		</Title>
	</Router>
);

export default Routes;