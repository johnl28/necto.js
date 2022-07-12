import NectoJs from "./Necto-js";

const options = {
  contextName: "draggableList",
  visibleClone: true,
  deepClone: true,
  restrictX: true,

  onDragStart()
  {
    // console.log('onDragStart');
  },

  onDragEnter({targetElement, below})
  {
    console.log('onDragEnter, target element:', targetElement, below);
  },

  onDrop({targetElement, below})
  {
    console.log('onDrop, target element:', targetElement, below);
  },

  onDragEnd()
  {
    // console.log('onDragEnd');
  },
};


window.onload = function() {
  InitDraggableContext();
};

function InitDraggableContext()
{
  const container = document.getElementById('container');

  for(let i = 0; i < 10; i++) 
  {
    const draggable = document.createElement('div');
    draggable.classList.add('draggable');
    draggable.setAttribute('draggable', '');
    const dragData = { 'id': i };
    draggable.dataset.dragData = JSON.stringify(dragData);
    draggable.innerHTML = `<span>Draggable element ${i}</span>`;
    container.appendChild(draggable);
  }

  NectoJs(container, options);
}



