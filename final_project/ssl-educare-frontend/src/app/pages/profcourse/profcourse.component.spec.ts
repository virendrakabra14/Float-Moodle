import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfcourseComponent } from './profcourse.component';

describe('ProfcourseComponent', () => {
  let component: ProfcourseComponent;
  let fixture: ComponentFixture<ProfcourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfcourseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfcourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
