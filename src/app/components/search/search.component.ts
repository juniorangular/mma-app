import {Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {DataService} from '../../services/data.service';
import * as $ from 'jquery';
import {Fighter} from '../../models/fighter.model';
import {zip} from 'rxjs';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  encapsulation: ViewEncapsulation.None

})
export class SearchComponent implements OnInit,OnDestroy {

  followedFighters=[];
  _sub;
  indicator=0;
  constructor(private data:DataService) {}

  ngOnInit() {}
  removeFollowedFightersFollowBtn(){
    this._sub=zip(this.data.fightersTable,this.data.fighters).subscribe(([table,fighters])=>{//append, traverse rows and remove already followed fighters
      this.appendTable(table);
      this.indicator=0;
      let trs=Array.from(document.getElementsByTagName('tr'));
      this.removeFollowedButton(trs,fighters)
    })
  }
  removeFollowedButton(trs,fighters){
    trs.forEach(tr=>{
      fighters.forEach(fighter=>{
        if($(tr).find('a').attr('href')==fighter.url){$(tr).find('button').remove()}
      })
    })
  }
  appendTable(table){
    let div=document.getElementsByClassName('tableCont')[0];
    div.innerHTML=table;
    let td=document.getElementsByClassName('follTd');
    this.createButtons(td);
  }
  createButtons(td){
    let _this=this;
    $(td).each(function() {
      let b=document.createElement('button');
      b.innerText='follow';
      b.addEventListener('click',function() {
        _this.follow(this.parentNode.parentNode);
        $(b).hide();
      });
      this.appendChild(b);
    })
  }
  searchFighter(name){
    if(document.getElementsByClassName('fcLeaderboard').length)
       document.getElementsByClassName('fcLeaderboard')[0].remove();

    this.data.getFighters();
    this.removeFollowedFightersFollowBtn();
    let fighter=name.value;
    this.data.searchFighter(fighter);
    this.indicator=1;
    name.value='';
  }
  follow(tr){
    let fighter:Fighter={};
    let tds = Array.from(tr.children);
    tds.forEach((td,index)=>{
          switch (index) {
            case 0:{
              fighter.name=$(td).text();
              fighter.url=$(td).children()[0].href;
              break;
            }
            case 2:
              fighter.weight=$(td).text();
              break;
            case 4:
              fighter.record=$(td).text();
              break;
            case 6:
              fighter.country=$(td).text();
              break;
          }
    });
    this.data.follow(fighter);
  }
  ngOnDestroy(): void {
    if(this._sub)
    this._sub.unsubscribe();
  }
}






























