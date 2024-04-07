import React from 'react';
import img from '../javascript.png';
import './app.scss';
import {Button} from '@components/Button/Button';
function App() {
	return (
		<>
			<Button label='Button' onClick={() => {}} primary />
			<div className='App'>React18 + Ts5 + webpack5 开发模板搭建</div>;
			<img src={img}></img>
		</>
	);
}

export default App;
