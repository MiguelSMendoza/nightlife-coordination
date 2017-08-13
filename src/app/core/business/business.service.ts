import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Business } from '../../model/business.model';
import { Review } from '../../model/review.model';
import { Subscription } from 'rxjs/Subscription';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AuthService } from '../../auth/auth.service';
import { People } from '../../model/people.model';
import { User } from 'firebase';

@Injectable()
export class BusinessService {
  locale = 'es_ES';
  subs: Subscription;
  people: FirebaseListObservable<People[]>;
  userPeople: People;

  constructor(private http: Http, private db: AngularFireDatabase, private authService: AuthService) {
    this.people = db.list('/people');
    this.authService.user.subscribe(
      (user: User) => {
        if (user) {
          this.userPeople = new People(user.displayName, user.uid, user.providerData[0].photoURL);
        } else {
          this.userPeople = null;
        }
      }
    );
    this.http.get('http://freegeoip.net/json/').subscribe(
      (response) => {
        const data = JSON.parse(response.text());
        this.locale = navigator.language + '_' + data.country_code;
      }
    );
  }

  getTimestamp() {
    const now = new Date();
    let startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    startOfDay = startOfDay / 1000;
    return startOfDay;
  }

  getPeople(id: string) {
    return this.db.list('/people/' + id, {
      query: {
        orderByChild: 'timestamp',
        startAt: this.getTimestamp()
      }
    });
  }

  goingTo(id: string) {
    if (this.userPeople) {
      this.userPeople['timestamp'] = this.getTimestamp();
      return this.db.object('/people/' + id + '/' + this.userPeople.uid).set(this.userPeople);
    } else {
      return false;
    }
  }

  notGoingTo(id: string) {
    if (this.userPeople) {
      return this.db.object('/people/' + id + '/' + this.userPeople.uid).remove();
    } else {
      return false;
    }
  }

  getBusiness(search: string, offset?: number) {
    if (!offset) {
      offset = 0;
    }
    return this.http.get('https://smendoza.net/yelp/search/' + search + '/' + offset)
    .map(res => <Business[]>res.json());
  }

  getReviews(id: string) {
    return this.http.get('https://smendoza.net/yelp/reviews/' + id + '/' + this.locale)
    .map(res => <Review[]>res.json());
  }

}
