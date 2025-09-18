import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective implements OnInit {
  @Input() appHighlight: string = 'yellow';
  @Input() appHighlightOpacity: number = 0.3;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

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
