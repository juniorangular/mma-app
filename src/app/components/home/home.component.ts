import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit,OnDestroy {
  followedFighters=[];
  sub;sub2;sub3;
  constructor(private data:DataService) {
  }

  ngOnInit() {
    this.data.getFighters();
    this.sub=this.data.fighters.subscribe(f=>{this.followedFighters=f});
    this.sub2=this.data.unfollowedFighter.subscribe(fighter=>{this.followedFighters= this.followedFighters.filter(function(f) { return f.url != fighter.url; });});
    this.sub3=this.data.followedFighter.subscribe(fighter=>this.followedFighters.push(fighter));
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.sub2.unsubscribe();
    this.sub3.unsubscribe();
  }

  getImage(fighter){
    return 'http://localhost:4444/'+fighter.image
  }

  unfollow(fighter){
    this.data.unfollow(fighter);
  }

}
