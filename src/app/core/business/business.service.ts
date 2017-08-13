import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Business } from '../../model/business.model';
import { Review } from '../../model/review.model';

@Injectable()
export class BusinessService {

  constructor(private http: Http) { }

  getBusiness(search: string, offset?: number) {
    if (!offset) {
      offset = 0;
    }
    return this.http.get('http://localhost:4242/yelp/search/' + search + '/' + offset)
    .map(res => <Business[]>res.json());
  }

  getReviews(id: string) {
    return this.http.get('http://localhost:4242/yelp/reviews/' + id)
    .map(res => <Review[]>res.json());
  }

}
