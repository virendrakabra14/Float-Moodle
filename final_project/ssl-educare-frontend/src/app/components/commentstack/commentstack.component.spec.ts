import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentstackComponent } from './commentstack.component';

describe('CommentstackComponent', () => {
  let component: CommentstackComponent;
  let fixture: ComponentFixture<CommentstackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommentstackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentstackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
