import { WindowPosition } from '@/window/WindowPosition';

export class WindowDrag {
  private parent: HTMLElement;
  private mouseMoveCallback = (moveEvent: Event) => {
    this.mouseMove(moveEvent);
  };

  public start(parent: HTMLElement, mouseUpCallback: (windowPos: WindowPosition) => void) {
    this.parent = parent;

    document.addEventListener('mousemove', this.mouseMoveCallback);
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', this.mouseMoveCallback);
      mouseUpCallback({        
        top: this.parent.offsetTop,
        left: this.parent.offsetLeft,
      });
    }, {once: true});  // remove listener once called once
  }

  private mouseMove(event: Partial<MouseEvent>) {
    this.parent.style.top = this.parent.offsetTop + (event.movementY || 0) + 'px';
    this.parent.style.left = this.parent.offsetLeft + (event.movementX || 0) + 'px';
    this.parent.style.position = 'fixed';
    this.parent.style.zIndex = '100';
  }
}
