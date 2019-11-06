import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit,OnDestroy {

  h4='Fetching Calendar...';
  _sub;_sub2;
  calendar;
  indicator;
  constructor(private data:DataService) { }

  ngOnInit() {
    this.data.getCalendar();
    this._sub=this.data.calendar.subscribe(c=>{
      c=this.filterEmpty(c);
      this.removeDuplicates(c);
      this.sortByDate(c);
      this.calendar=c;
      this.indicator=0
    });
    this._sub2=this.data.$indicator.subscribe(followed=>{this.indicator=1;this.h4='Updating Calendar...'});
    this.indicator=1
  }
  sortByDate(matches){
    matches.sort(function(a,b){
      let  da = new Date(a.date).getTime();
      let db = new Date(b.date).getTime();
      return da < db ? -1 : da > db ? 1 : 0
    });
  }
  removeDuplicates(matches) {
    matches.forEach((m1) => {
      matches.forEach((m2, index2) => {
        if (m1.fighter === m2.opponent && m1.date === m2.date && m1.fighter !== m2.fighter && m1.opponent !== m2.opponent) {
          matches.splice(index2, 1);
        }
      })
    });
  }
  filterEmpty(matches){
    return matches.filter(m=>(!this.isEmpty(m)));
  }
  isEmpty(obj) {
    for(let key in obj) {
      if(obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  ngOnDestroy(): void {
    this._sub.unsubscribe();
    this._sub2.unsubscribe();
  }
}
