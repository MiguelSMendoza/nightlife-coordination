import { People } from './people.model';
import { Coordinates } from './coordinates.model';
import { Category } from './category.model';
import { Review } from './review.model';

export class Business {

    constructor(
        public id: string,
        public name: string,
        public image_url: string,
        public url: string,
        public price: string,
        public rating: number,
        public review_count: number,
        public phone: string,
        public going: People[],
        public coords: Coordinates,
        public categories: Category[],
        public reviews: Review[]
    ) { }
}
