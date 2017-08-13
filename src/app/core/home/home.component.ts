import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirebaseListObservable } from 'angularfire2/database';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subscription } from 'rxjs/Subscription';
import { Business } from '../../model/business.model';
import { BusinessService } from '../business/business.service';
import { DomSanitizer } from '@angular/platform-browser';
import { People } from '../../model/people.model';
import { Review } from '../../model/review.model';
import { AuthService } from "../../auth/auth.service";
import { User } from "firebase/app";

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
  subscriptions: Subscription[];
  totalBusinesses: Business[];
  businesses: Business[];
  position;
  next = 0;
  page = -1;
  search = '';
  locale = 'es_ES';
  isAuthenticated: boolean;
  uid: string;

  constructor(private businessService: BusinessService,
    private sanitizer: DomSanitizer,
    private authService: AuthService) {
    this.businesses = [];
    this.totalBusinesses = [];
    this.subscriptions = [];
   }

   cleanStyle (data: string) {
    return this.sanitizer.bypassSecurityTrustStyle(data);
   }

   cleanUrl (data: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(data);
   }

  ngOnInit() {
    const userSub = this.authService.user.subscribe(
      (user: User) => {
        this.isAuthenticated = (user) ? true : false;
        if (this.isAuthenticated) {
          this.uid = user.uid;
        } else {
          this.uid = null;
        }
      }
    );
    this.subscriptions.push(userSub);
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
    this.subscriptions.forEach(
      (subscription) => subscription.unsubscribe()
    );
  }

  doNext() {
    if (this.next < this.totalBusinesses.length) {
      this.businesses.push(this.totalBusinesses[this.next++]);
    }
  }

  onMore() {
    this.page += 1;
    const sub = this.businessService.getBusiness(this.search, this.page).subscribe(
      businesses => {
        this.totalBusinesses = this.totalBusinesses.concat(businesses);
          this.totalBusinesses.forEach(
            (business: Business) => {
              const subsc = this.businessService.getReviews(business.id).subscribe(
                (reviews: Review[]) => {
                  business['reviews'] = reviews;
                },
                (err) => { }
              );
              this.subscriptions.push(subsc);
              const subsr = this.businessService.getPeople(business.id).subscribe(
                (people: People[]) => {
                  business['going'] = people;
                }
              );
            }
          );
          this.doNext();
      }
    );
    this.subscriptions.push(sub);
  }

  onSearch(search) {
    this.search = search;
    this.businesses = [];
    this.next = 0;
    this.page = -1;
    this.totalBusinesses = [];
    this.onMore();
  }

  userIsGoing(business: Business, uid: string) {
    if (!business.going) {
      return false;
    }
    const find = business.going.find(x => x.uid === uid);
    return find !== undefined;
  }

  onGoing(business: Business) {
    if (!this.uid) {
      this.authService.login();
    }
    if (this.userIsGoing(business, this.uid)) {
      this.businessService.notGoingTo(business.id);
    } else {
      this.businessService.goingTo(business.id);
    }
  }

}
