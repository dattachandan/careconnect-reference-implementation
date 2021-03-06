import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllergyIntoleranceComponent } from './allergy-intolerance.component';

describe('AllergyIntoleranceComponent', () => {
  let component: AllergyIntoleranceComponent;
  let fixture: ComponentFixture<AllergyIntoleranceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllergyIntoleranceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllergyIntoleranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
