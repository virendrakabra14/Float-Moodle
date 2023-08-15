import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembertableComponent } from './membertable.component';

describe('MembertableComponent', () => {
  let component: MembertableComponent;
  let fixture: ComponentFixture<MembertableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MembertableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MembertableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
