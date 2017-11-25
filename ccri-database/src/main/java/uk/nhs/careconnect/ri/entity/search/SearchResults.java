package uk.nhs.careconnect.ri.entity.search;

import uk.nhs.careconnect.ri.entity.BaseResource;

import javax.persistence.*;

@Table(name = "SearchResults"
        )
@Entity
public class SearchResults  extends BaseResource {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name="SEARCH_ID")
        private Long searchId;
        public Long getID() {
            return this.searchId;
        }
}