describe('constructor', function () {
  beforeEach(function () {
    createContainer()
  })

  afterEach(function () {
    removeContainers()
  })

  it('should throw an error when not given a first argument', function () {
    expect(function () {
      return new Resizer()
    }).toThrowError()
  })

  it('should throw an error when it can not find the css selection', function () {
    expect(function () {
      return new Resizer('unknown')
    }).toThrowError()
  })

  it('should init a resizer with the css selector of .container', function () {
    expect(function () {
      return new Resizer('.container')
    }).not.toThrowError()
  })

  it('should init a resizer with a element selection', function () {
    const container = document.querySelector('.container')
    var rz = new Resizer(container)
    expect(rz.container).toEqual(container)
  })

  it('should remove itself if it already has been init', function () {
    // TODO
  })
})

describe('static methods', function () {

  describe('createHandle()', function () {
    var handleElement
    var handleClass = 'myHandleClass'

    beforeAll(function () {
      handleElement = Resizer.createHandle(handleClass)
    })

    it('should be defined', function () {
      expect(Resizer.createHandle).toBeDefined()
    })

    it('should return a div', function () {
      expect(handleElement.nodeName).toBe('DIV')
    })

    it('should have a cursor of ew-resize', function () {
      expect(handleElement.style.cursor).toBe('ew-resize')
    })

    it('should have an attribute of data-rz-handle', function () {
      expect(handleElement.hasAttribute('data-rz-handle')).toBeTruthy()
    })

    it('should have an attribute of data-rz-handle equal to ' + handleClass, function () {
      expect(handleElement.dataset.rzHandle).toBe(handleClass)
    })
  })

  describe('createGhost()', function () {
    var ghost

    beforeAll(function () {
      ghost = Resizer.createGhost()
    })

    it('should be defined', function () {
      expect(Resizer.createGhost).toBeDefined()
    })

    it('should return a div', function () {
      expect(ghost.nodeName).toBe('DIV')
    })

    it('should be absolutely positioned', function () {
      expect(ghost.style.position).toBe('absolute')
    })

    it('should be have a zIndex of above 9000!', function () {
      expect(parseInt(ghost.style.zIndex)).toBeGreaterThan(9000)
    })

    it('should have a top position of 0', function () {
      expect(ghost.style.top).toBe('0px')
    })

    it('should have a bottom position of 0', function () {
      expect(ghost.style.bottom).toBe('0px')
    })

    it('should have a display style of none', function () {
      expect(ghost.style.display).toBe('none')
    })
  })
})

describe('methods', function () {
  var rz, clientWidth

  beforeEach(function () {
    createContainer()
    rz = new Resizer('.container')
    clientWidth = rz.container.clientWidth
  })

  afterEach(function () {
    removeContainers()
  })

  describe('remove()', function () {
    beforeEach(function () {
      rz.handleX = 10
      rz.remove()
    })

    it('should remove the Resizer property from the container', function () {
      expect(rz.container.Resizer).toBeUndefined()
    })

    it('should remove the contains style position', function () {
      expect(rz.container.style.position).toBeFalsy()
    })

    it('should remove the handle element', function () {
      expect(rz.container.querySelector('[data-rz-handle]')).toBeNull()
    })

    it('should reset the target flex value', function () {
      expect(rz.target.style.flex).toBeNull()
    })
  })

  describe('setHandleX()', function () {
    it('should set the the ghost left position to handleX', function () {
      rz.setHandleX(clientWidth - 1)
      expect(rz.ghost.style.left).toEqual(clientWidth - 1 + 'px')
    })

    it('should be max width to the container client width', function () {
      rz.setHandleX(clientWidth + 100)
      expect(rz.ghost.style.left).toEqual(clientWidth + 'px')
    })

    it('should not be able to set less than 0', function () {
      rz.setHandleX(-100)
      expect(rz.ghost.style.left).toEqual('0px')
    })

    it('should return value', function () {
      rz.setHandleX(1)
      expect(rz.handleX).toEqual(1)
    })
  })

  describe('setDragging()', function () {
    afterEach(function () {
      rz.setHandleX(1)
      rz.setDragging(false)
    })

    it('should not be dragging by default', function () {
      expect(rz.setDragging()).toBeTruthy()
      expect(rz.dragging).toBeTruthy()
    })

    it('should show ghost when dragging', function () {
      expect(rz.setDragging()).toBeTruthy()
      expect(rz.dragging).toBeTruthy()
      expect(rz.ghost.style.display).toBe('block')
    })

    it('should hide ghost when not dragging', function () {
      expect(rz.dragging).toBeFalsy()
      expect(rz.ghost.style.display).toBe('none')
    })
  })

  describe('MouseEvent Methods', function () {
    var evt
    beforeAll(function () {
      rz.setDragging(false)
      evt = {
        preventDefault: function () {},
        pageX: 10,
        offsetX: 2,
        shiftKey: true
      }
    })

    describe('onDown()', function () {
      it('should prevent default on the event', function () {
        spyOn(evt, 'preventDefault')
        rz.onDown(evt)
        expect(evt.preventDefault).toHaveBeenCalled()
      })

      it('should set offsetX to event offsetX', function () {
        rz.onDown(evt)
        expect(rz.offsetX).toEqual(evt.offsetX)
      })

      it('should not change the offset when already dragging', function () {
        rz.dragging = true
        rz.onDown(evt)
        expect(rz.offsetX).toEqual(0)
      })

      it('should set dragging to true when not dragging', function () {
        spyOn(rz, 'setDragging')
        rz.onDown(evt)
        expect(rz.setDragging).toHaveBeenCalledWith(true)
      })
    })

    describe('onUp()', function () {
      beforeAll(function () {
        evt.pageX = 20
      })

      beforeEach(function () {
        rz.setDragging(true)
      })

      it('should prevent default on the event', function () {
        spyOn(evt, 'preventDefault')
        rz.onUp(evt)
        expect(evt.preventDefault).toHaveBeenCalled()
      })

      it('should set dragging to false when dragging', function () {
        spyOn(rz, 'setDragging')
        rz.onUp(evt)
        expect(rz.setDragging).toHaveBeenCalledWith(false)
      })
    })

    describe('onMove()', function () {
      beforeEach(function () {
        evt.pageX = 0
      })

      beforeEach(function () {
        rz.setDragging(true)
      })

      it('should prevent default on the event', function () {
        spyOn(evt, 'preventDefault')
        rz.onMove(evt)
        expect(evt.preventDefault).toHaveBeenCalled()
      })

      it('should set handleX position', function () {
        spyOn(rz, 'setHandleX')
        rz.onMove(evt)
        expect(rz.setHandleX).toHaveBeenCalled()
      })

      it('should not set handleX position when not being dragged', function () {
        rz.dragging = false
        spyOn(rz, 'setHandleX')
        rz.onMove(evt)
        expect(rz.setHandleX).not.toHaveBeenCalled()
      })
    })
  })
})

describe('properties', function () {
  var rz
  beforeEach(function () {
    createContainer()
  })

  afterEach(function () {
    removeContainers()
  })

  it('should have offsetX property', function () {
    rz = new Resizer('.container')
    expect(rz.offsetX).toBeDefined()
    expect(rz.offsetX).toBe(0)
  })

  it('should have dragging property', function () {
    rz = new Resizer('.container')
    expect(rz.dragging).toBeDefined()
    expect(rz.dragging).toBeFalsy()
  })

  describe('options', function () {
    it('defaults', function () {
      expect(Resizer.defaultOptions.width).toBeDefined()
      expect(Resizer.defaultOptions.width).toBe(8)
    })

    it('should set the width', function () {
      var width = 10
      rz = new Resizer('.container', {width: width})
      expect(rz.options.width).toBe(width)
    })
  })
})

function createContainer() {
  var container = document.createElement('div')
  container.className = 'container'

  var item1 = document.createElement('div')
  item1.className = 'item'

  var item2 = document.createElement('div')
  item2.className = 'item'

  container.appendChild(item1)
  container.appendChild(item2)

  document.body.appendChild(container)
}

function removeContainers() {
  document.body.removeChild(document.querySelector('.container'))
}
