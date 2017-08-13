import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirebaseListObservable } from 'angularfire2/database';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subscription } from 'rxjs/Subscription';
import { Business } from '../../model/business.model';
import { BusinessService } from '../business/business.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger(
      'listItem', [
        transition(':enter', [
          style({ transform: 'translateY(-10px)', opacity: 0}),
          animate('200ms', style({transform: 'translateY(0)', opacity: 1}))
        ])
      ]
    )
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  totalBusinesses: Business[];
  businesses: Business[];
  position;
  next = 0;
  page = -1;
  search = '';

  constructor(private businessService: BusinessService, private sanitizer: DomSanitizer) {
    this.businesses = [];
    this.totalBusinesses = [];
   }

   cleanStyle (data: string) {
    return this.sanitizer.bypassSecurityTrustStyle(data);
   }

   cleanUrl (data: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(data);
   }

  ngOnInit() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.position = position;
          this.search = this.position.coords.latitude + '/' + this.position.coords.longitude;
          this.businesses = [];
          this.totalBusinesses = [];
          this.onMore();
        }
      );
    } else {
      this.search = 'Albacete';
      this.businesses = [];
      this.totalBusinesses = [];
      this.onMore();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  doNext() {
    if (this.next < this.totalBusinesses.length) {
      this.businesses.push(this.totalBusinesses[this.next++]);
    }
  }

  onMore() {
    this.page += 1;
    this.subscription = this.businessService.getBusiness(this.search, this.page).subscribe(
      businesses => {
        this.totalBusinesses = this.totalBusinesses.concat(businesses);
          this.totalBusinesses.forEach(
            (business) => {
              this.businessService.getReviews(business.id).subscribe(
                (reviews) => {
                  business['reviews'] = reviews;
                },
                (err) => { }
              );
            }
          );
          this.doNext();
      }
    );
  }

  onSearch(search) {
    this.search = search;
    this.businesses = [];
    this.next = 0;
    this.page = -1;
    this.totalBusinesses = [];
    this.onMore();
  }

}
