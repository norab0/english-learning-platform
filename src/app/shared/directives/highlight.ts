import { Directive, ElementRef, Input, OnInit, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective implements OnInit {
  @Input() appHighlight = 'yellow';
  @Input() appHighlightOpacity = 0.3;

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  constructor() {
    // Services are injected using inject() function
  }

  ngOnInit(): void {
    this.renderer.setStyle(
      this.el.nativeElement,
      'background-color',
      this.appHighlight
    );
    this.renderer.setStyle(
      this.el.nativeElement,
      'opacity',
      this.appHighlightOpacity.toString()
    );
    this.renderer.setStyle(
      this.el.nativeElement,
      'padding',
      '2px 4px'
    );
    this.renderer.setStyle(
      this.el.nativeElement,
      'border-radius',
      '4px'
    );
  }
}
