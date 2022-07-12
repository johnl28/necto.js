

class NectoElement {
  constructor(index, element, nectoContext)
  {
    this.InitProps();

    this.index = index;
    this.element = element;
    this.context = nectoContext;

    if(!this.context || !this.element) {
      console.error(`Couldn't create NectoElement. HTMLElement ${this.element}, Necto context ${this.context}.`);
      return;
    }

    this.element.ondragstart = (event) => event.preventDefault();
    this.InitDataSet(index);
    this.InitMouseDownEvent();
  }

  InitProps()
  {
    this.index = 0;
    this.context = null;
    this.element = null;
    this.initialCursorPosition = {};

    this.mouseDown = null;
  }

  InitDataSet(index)
  {
    this.element.dataset.nectoIndex = index;
    this.element.dataset.nectoContext = this.context.contextName;
  }

  InitMouseDownEvent()
  {
    this.mouseDown = (event) => this.OnMouseDown(event);

    this.element.addEventListener('mousedown', this.mouseDown);
  }

  OnMouseDown(event)
  {
    if(!this.canDrag || this.context.pickedElement) {
      return;
    }

    this.SetInitialCursorPosition(event.clientX, event.clientY);
    this.InitElementStyle();
    this.context.OnPickElement(event, this);
  }

  InitElementStyle()
  {
    const element = this.element;
    const initialY = element.getBoundingClientRect().top;
  
    element.style.width = `${element.clientWidth}px`;
    element.style.position = "fixed";
    element.style.userSelect = "none";
    element.style.zIndex = "999";
    element.style.top = `${initialY}px`;

    element.setAttribute('picked-element', '');
    // document.body.appendChild(element);
  }

  SetInitialCursorPosition(x, y)
  {
    this.initialCursorPosition = { x, y };
  }

  Release()
  {
    this.element.removeAttribute('picked-element');
    this.ResetElementStyle();
  }

  ResetElementStyle()
  {
    this.element.style = null;
  }

  OnMouseMove(event)
  {
    const { x, y } = this.initialCursorPosition;

    const newX = this.options.restrictX ? 0: event.clientX - x;
    const newY = this.options.restrictY ? 0: event.clientY - y;
    this.UpdatePosition(newX, newY);
  }

  UpdatePosition(x, y)
  {
    this.element.style.transform = `translate(${x}px, ${y}px)`;
  }

  Show()
  {
    this.element.style.display = '';
  }

  Hide()
  {
    this.element.style.display = 'none';
  }

  get options()
  {
    return this.context.options;
  }

  get width()
  {
    return this.element.getBoundingClientRect().width;
  }

  get height()
  {
    return this.element.getBoundingClientRect().height;
  }

  get x() 
  {
    return  this.element.getBoundingClientRect().x;
  }

  get y() 
  {
    return this.element.getBoundingClientRect().y;
  }

  get canDrag()
  {
    return !this.element.hasAttribute('disabled') && this.element.hasAttribute('draggable') && this.element.getAttribute('draggable') != 'false';
  }

  get data()
  {
    return JSON.parse(this.element.dataset.dragData);
  }
}

export default NectoElement;

