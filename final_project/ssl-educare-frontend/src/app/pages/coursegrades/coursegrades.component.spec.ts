import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursegradesComponent } from './coursegrades.component';

describe('CoursegradesComponent', () => {
  let component: CoursegradesComponent;
  let fixture: ComponentFixture<CoursegradesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoursegradesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursegradesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
