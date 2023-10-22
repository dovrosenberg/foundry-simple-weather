import { WindowPosition } from '@/window/WindowPosition';

export class WindowDrag {
  private _parent: HTMLElement;

  private mouseMoveCallback = (moveEvent: Event) => {
    this.mouseMove(moveEvent);
  };

  public start(parent: HTMLElement, mouseUpCallback: (windowPos: WindowPosition) => void) {
    this._parent = parent;

    document.addEventListener('mousemove', this.mouseMoveCallback);
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', this.mouseMoveCallback);

      const rect = this._parent.getBoundingClientRect();
      mouseUpCallback({        
        bottom: window.innerHeight - rect.bottom,
        left: rect.left,
      });
    }, {once: true});  // remove listener once called once
  }

  private mouseMove(event: Partial<MouseEvent>) {
    this._parent.style.top = this._parent.offsetTop + (event.movementY || 0) + 'px';
    this._parent.style.left = this._parent.offsetLeft + (event.movementX || 0) + 'px';
    this._parent.style.bottom = '';

    this._parent.style.position = 'fixed'; 
    this._parent.style.zIndex = '100';
  }
}
