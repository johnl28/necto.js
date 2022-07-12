

import NectoElement from "./NectoElement";

/**
 * Create a drag area context and make draggable children
 * @param containerElement - The container element 
 * @param options - 
 *  */ 
class NectoContext {
  constructor(containerElement, options) 
  {
    this.InitProps();
    this.InitOptions();

    if(!containerElement || !options) {
      console.error(`Couldn't create a Necto context for element ${containerElement}, options ${options}`);
      return;
    }

    this.containerElement = containerElement;

    this.SetOptions(options);

    this.InitContext();
    this.InitMouseEventHandlers();
    this.InitDraggableChilds();
  }

  InitProps()
  {
    this.containerElement = null;
    this.pickedElement = null;
    this.pickedElementClone = null;
    this.targetElement = null;

    this.elements = {};

    this.mouseMoveHandler = null;
    this.mouseUpHandler = null;
    this.contextMenuHandler = null;
  }

  InitOptions()
  {
    this.options = {
      contextName: null,
      clonePickedElement: true,
      visibleClone: false,
      deepClone: false,
      restrictX: false,
      restrictY: false,

      onDragStart: null,
      onDragEnter: null,
      onDragLeave: null,
      onDrop: null,
      onDragEnd: null
    };
  }

  SetOptions(options)
  {
    Object.keys(options)
          .filter(key => key in this.options)
          .forEach(key => this.options[key] = options[key]);
  }

  InitContext()
  {
    if(!this.contextName) {
      console.error(`Couldn't create a Necto context for element ${this.containerElement}, contextName: ${this.contextName}`);
      return;
    }

    this.containerElement.nectoContext = this;
    this.containerElement.dataset.nectoContext = this.contextName;
  }

  RefreshDraggableChilds()
  {
    this.elements = {};
    this.InitDraggableChilds();
  }

  InitDraggableChilds()
  {
    const children = this.containerElement.children;

    for(let i = 0; i < children.length; i++) {
      const childElement = children[i];
      this.elements[i] = new NectoElement(i, childElement, this);
    }
  }

  InitMouseEventHandlers()
  {
    this.InitMouseUpHandler();
    this.InitMouseMoveHandler();
    this.InitContextMenuHandler();
  }

  Destroy()
  {
    this.RemoveMouseEventHandlers();
    this.InitProps();
  }

  RemoveMouseEventHandlers()
  {
    document.removeEventListener('mouseup', this.mouseUpHandler);
    document.removeEventListener('mousemove', this.mouseMoveHandler);
    document.removeEventListener('contextmenu', this.contextMenuHandler);
  }

  InitContextMenuHandler()
  {
    this.contextMenuHandler = (event) => {
      if(!this.pickedElement) {
        return;
      }

      event.preventDefault();
      this.OnMouseUp(event);
    };

    document.addEventListener('contextmenu', this.contextMenuHandler);
  }

  InitMouseUpHandler()
  {
    this.mouseUpHandler = (event) => this.OnMouseUp(event);
    document.addEventListener('mouseup', this.mouseUpHandler);
  }

  OnMouseUp(event)
  {
    if(!this.pickedElement) {
      return;
    }

    if(this.targetElement) {
      this.DropPickedElement(event);
    }

    this.OnDragEnd(event);

    this.DestroyPickedElementClone();
    this.ReleasePickedElement();
    this.targetElement = null;
  }

  OnDragEnd(event)
  {
    if(!this.options.onDragEnd) {
      return;
    }

    this.options.onDragEnd(event);
  }

  DropPickedElement(event)
  {
    this.OnDrop(event);
    this.containerElement.replaceChild(this.pickedElement.element, this.pickedElementClone);
  }

  OnDrop(event)
  {
    if(!this.options.onDrop) {
      return;
    }

    this.options.onDrop({event, 
      pickedElement: this.pickedElement, 
      targetElement: this.targetNectoElement,
      below: this.IsCursorBelowTarget(event.clientY)
    });
  }

  ReleasePickedElement()
  {
    this.pickedElement.Release();
    this.pickedElement = null;
  }

  InitMouseMoveHandler()
  {
    this.mouseMoveHandler = (event) => this.OnMouseMove(event);
    document.addEventListener('mousemove', this.mouseMoveHandler);
  }

  OnMouseMove(event)
  {
    if(!this.pickedElement) {
      return;
    }

    this.pickedElement.OnMouseMove(event);
    this.CheckTargetElement(event);
  }

  CheckTargetElement(event)
  {
    const curTargetElement = this.GetTargetElementFromXY(event.clientX, event.clientY);
    this.UpdatePickedElementClone(event);
    if(curTargetElement == this.targetElement) {
      return;
    }

    if(this.targetElement) {
      this.OnDragLeave(event);
    }

    if(!curTargetElement) {
      return;
    }

    this.targetElement = curTargetElement;

    this.OnDragEnter(event);
  }

  GetTargetElementFromXY(x, y)
  {
    const targetElement = this.GetElementFromPos(x, y);
    if(!targetElement) {
      return null;
    }

    return targetElement.closest(`[data-necto-context=${this.contextName}][draggable]`);
  }

  GetElementFromPos(x, y)
  {
    this.pickedElement.Hide();
    const element = document.elementFromPoint(x, y);
    this.pickedElement.Show();

    return element;
  }

  OnDragLeave(event)
  {
    if(!this.options.onDragLeave) {
      return;
    }

    this.options.onDragLeave({ event,
      pickedElement: this.pickedElement, 
      targetElement: this.targetNectoElement,
      below: this.IsCursorBelowTarget(event.clientY)
    });
  }

  OnDragEnter(event)
  {
    if(!this.options.onDragEnter) {
      return;
    }

    this.options.onDragEnter({ event, 
      pickedElement: this.pickedElement, 
      targetElement: this.targetNectoElement,
      below: this.IsCursorBelowTarget(event.clientY)
    });
  }

  OnPickElement(event, nectoElement)
  {
    this.SetPickedElement(nectoElement);
    this.CreatePickedElementClone();
    this.OnDragStart(event);
  }

  OnDragStart(event)
  {
    if(!this.options.onDragStart) {
      return;
    }

    this.options.onDragStart({ event, pickedElement: this.pickedElement });
  }

  SetPickedElement(nectoElement) 
  {
    this.pickedElement = nectoElement;
  }

  CreatePickedElementClone()
  {
    if(!this.options.clonePickedElement) {
      return;
    }

    this.pickedElementClone = this.pickedElement.element.cloneNode(this.options.deepClone);
    this.pickedElementClone.style = null;

    if(!this.options.visibleClone)
      this.pickedElementClone.style.visibility = 'hidden';

    this.pickedElementClone.setAttribute('clone-element', '');
    this.pickedElementClone.removeAttribute('draggable');
    this.pickedElementClone.removeAttribute('picked-element');
  }

  UpdatePickedElementClone(event)
  {
    if(!this.pickedElementClone) {
      return;
    }

    if(!this.targetElement) {
      if(this.containerElement.contains(this.pickedElementClone)) {
        this.pickedElementClone.style.display = 'none';
        this.containerElement.removeChild(this.pickedElementClone);
      }

      return;
    }

    this.pickedElementClone.style.display = '';

    if(!this.IsCursorBelowTarget(event.clientY))
      this.containerElement.insertBefore(this.pickedElementClone, this.targetElement);
    else
      this.containerElement.insertBefore(this.pickedElementClone, this.targetElement.nextSibling);
  }

  DestroyPickedElementClone()
  {
    if(!this.pickedElementClone) {
      return;
    }

    this.pickedElementClone.remove();
    this.pickedElementClone = null;
  }

  IsCursorBelowTarget(cursorClientY)
  {
    if(!this.targetElement) {
      return false;
    }

    const targetElementClientRect = this.targetElement.getBoundingClientRect();
    return cursorClientY > (targetElementClientRect.y + targetElementClientRect.height / 2);
  }

  get targetNectoElement()
  {
    const id = this.targetElement.getAttribute('data-necto-index');
    return this.targetElement ? this.elements[id]: null;
  }

  get contextName()
  {
    return this.options.contextName;
  }
}


export default NectoContext;

