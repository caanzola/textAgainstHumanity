import React, { Component } from 'react';
import {Button} from 'reactstrap';
import TimerDisplay from './TimerDisplay';
import moment from 'moment';
import * as timerStates from './timerStates';
import { Tasks } from '../../../api/tasks.js';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

class Timer extends Component {
  constructor(props){
    super(props);

    this.state= {
      currentTime: moment.duration( 3 , 'minutes' ),
      baseTime: moment.duration( 3 , 'minutes' ),
      timerState: timerStates.NOT_SET,
      timer:null,
      votingTime: moment.duration( 30 , 'seconds' ),
      gamePhase: 3
    };

    this.setBaseTime = this.setBaseTime.bind(this);
    this.setCurrentTime = this.setCurrentTime.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.reduceTimer = this.reduceTimer.bind(this);
    this.setGamePhase = this.setGamePhase.bind(this);
  }

  setBaseTime(newBaseTime) {
    this.setState({
      baseTime: newBaseTime,
      currentTime: newBaseTime
    });
  }

  setCurrentTime(newCurrentTime) {
    this.setState({
      currentTime: newCurrentTime
    });
  }

  startTimer() {
    console.log("llegue");
    if(this.state.timerState === timerStates.VOTING) {
      console.log('voting')
      //this.setCurrentTime(this.state.votingTime);
      //this.setState({
        timer: setInterval(this.reduceTimer, 1000)
      //});
    } else {
      console.log('not voting phase')
       this.setState({
        timerState:timerStates.RUNNING,
        timer: setInterval(this.reduceTimer, 1000)
      });
    }
  }

  reduceTimer() {
    if(this.state.currentTime.get('minutes') === 0 && this.state.currentTime.get('seconds') === 0 && this.state.gamePhase === 0)
    {
      this.setState({
        timerState:timerStates.COMPLETE,
      });
      clearInterval(this.state.timer); 
      return;
    }

    if (this.state.currentTime.get('minutes') === 0 && this.state.currentTime.get('seconds') === 0 && this.state.timerState === timerStates.VOTING) 
    {
      this.setCurrentTime(this.state.baseTime);
      this.setState({
        timerState:timerStates.RUNNING,
      });
      return;
    }

    if (this.state.currentTime.get('minutes') === 0 && this.state.currentTime.get('seconds') === 0 && this.state.gamePhase !== 0) 
    {
      this.setGamePhase();
      return;
    }
    
    

    const newTime = moment.duration(this.state.currentTime);
    newTime.subtract( 1 , 'second' );
    
    this.setCurrentTime(newTime);

    
    /*
    if(this.props.master) {
      Meteor.call('tasks.changeTime', this.props.task[0]._id, moment.duration(newTime));
    }
    else{
      console.log('sup change time?')
    }
    */

  }

  setGamePhase() {
    this.setState({
      timerState:timerStates.VOTING,
      gamePhase: this.state.gamePhase-1
    });
    clearInterval(this.state.timer);
    this.startTimer();
  }

  handleChange(event) {
    const newBaseTime = this.state.baseTime;

    if (event.target.id === 'minutes' ) {
      newBaseTime.subtract(newBaseTime.get('minutes'),'minutes').add(parseInt(event.target.value), 'minutes' );
    }

    this.setBaseTime(newBaseTime);
    

  }

  componentDidUpdate(prevProps, prevState){
    if(prevState.timerState !== this.state.timerState) {
      this.props.checkGameState(this.state.gamePhase,this.state.timerState);
    }
  }

  componentDidMount() {

  }

  renderConfig() {

    return this.props.master && this.state.timerState === timerStates.NOT_SET ?
      <div> 
        <div className="row">
          <h2 className="text-primary">Set Round Time</h2>
        </div>
        <div className="row">
          <div className="form-group">
            <div className="col-sm-3">
              <label htmlFor="minutes">Minutes</label>
            </div>
            <div className="col-sm-6">
              <input id="minutes" className="form-control" type="number" onChange={this.handleChange}/>
            </div>
            <Button className='startbtn'onClick = {this.startTimer } outline color="success"  block>
          Start game!
            </Button>
          </div>
        </div>
      </div>
      : <div></div>;
  }


  render() {
    return (
      <div>
        <h1>Rounds left: {this.state.gamePhase}</h1>
        <div className="container-fluid">
          {this.props.master?<TimerDisplay 
            currentTime={this.state.currentTime}
          />:<TimerDisplay 
            currentTime={moment.duration(this.props.game[0].time)}
          />}
          {this.renderConfig()}
        </div>    
      </div>
    );
  }
}

export default withTracker((props) => {
  
  console.log('It is timer time timeiemiemrir')
  Meteor.subscribe('gameTime',props.task[0]._id);
  
  return {
    game: Tasks.find({_id:props.task[0]._id}).fetch()
  };
})(Timer);

