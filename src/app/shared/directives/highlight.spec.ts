import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { HighlightDirective } from './highlight';

@Component({
  template: '<div appHighlight="red" appHighlightOpacity="0.5">Test</div>'
})
class TestComponent {}

describe('HighlightDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HighlightDirective],
      declarations: [TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply highlight styles', () => {
    const element = fixture.nativeElement.querySelector('div');
    expect(element.style.backgroundColor).toBe('red');
    expect(element.style.opacity).toBe('0.5');
    expect(element.style.padding).toBe('2px 4px');
    expect(element.style.borderRadius).toBe('4px');
  });
});
