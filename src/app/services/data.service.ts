import { Injectable } from '@angular/core';
import {Socket} from 'ngx-socket-io';
import {Subject} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  fightersTable=this.socket.fromEvent<any>('fightersTable');
  fighters=this.socket.fromEvent<any>('followedFighters');
  calendar=this.socket.fromEvent<any>('calendar');
  followedFighter=this.socket.fromEvent<any>('followed');
  unfollowedFighter=this.socket.fromEvent<any>('unfollowed');
   $indicator = new Subject<number>();



  constructor(private socket:Socket) {}

  getCalendar(){
    this.socket.emit('loadCalendar');
  }

  getFighters(){
    this.socket.emit('getFollowedFighters')
  }

  searchFighter(name){
    this.socket.emit('loadFightersTable',name);
  }

  follow(fighter){
    this.socket.emit('follow',fighter);
    this.$indicator.next(1);
  }



  unfollow(fighter){
    this.socket.emit('unfollow',fighter)
  }

}

