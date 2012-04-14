/*
 * DragControls dragging of three.js objects in any scene easily.
 * 
 * Usage: new DragControls(camera, objects, renderer.domElement);
 *
 * feature requests:
 *  1. add rotation?
 *  2. axis lock
 *  3. inertia dragging
 *  4. activate/deactivate? prevent propagation?
 *
 * issues:
 *  deal with object parent's matrix?
 *
 * @author zz85 from https://github.com/zz85
 * follow on http://twitter.com/blurspline
 */
THREE.DragControls = function(_camera, _objects, _domElement) {

    if (_objects instanceof THREE.Scene) {
        _objects = _objects.children;
    }
    var _projector = new THREE.Projector();

    var _mouse = new THREE.Vector3(),
        _offset = new THREE.Vector3();
    var _selected;

    var me = this;

    _domElement.addEventListener('mousemove', onDocumentMouseMove, false);
    _domElement.addEventListener('mousedown', onDocumentMouseDown, false);
    _domElement.addEventListener('mouseup', onDocumentMouseUp, false);

    // Enable Drag
    this.enabled = true; 

    /* Custom Event Handling */
    var listeners = {

    };

    this.on = function(event, handler) {
        if (!listeners[event]) listeners[event] = [];

        listeners[event].push(handler);

    };

    this.off = function(event, handler) {
        var l = listeners[event];
        if (!l) return;

        if (l.indexOf(handler)>-1) {
            l.splice(handler, 1);
        }

    };

    var notify = function(event, data, member) {
        var l = listeners[event];
        if (!l) return;

        if (!member) {
            for (var i=0;i<l.length;i++) {
                l[i](data);
            }
        }
    };



    function onDocumentMouseMove(event) {

        event.preventDefault();

        _mouse.x = (event.clientX / _domElement.width) * 2 - 1;
        _mouse.y = -(event.clientY / _domElement.height) * 2 + 1;

        var ray = _projector.pickingRay(_mouse, _camera);

        if (me.enabled && _selected) {
            var targetPos = ray.direction.clone().multiplyScalar(_selected.distance).addSelf(ray.origin);
            targetPos.subSelf(_offset);
            // _selected.object.position.copy(targetPos.subSelf(_offset));

            var moveX, moveY, moveZ;

            moveX = moveY = moveZ = true;

            if (me.xLock) {
                moveX = false;
            } else if (me.yLock) {
                moveY = false;
            } else if (me.zLock) {
                moveZ = false;
            }

            // Reverse Matrix?
            if (moveX) _selected.object.position.x = targetPos.x;
            if (moveY) _selected.object.position.y = targetPos.y;
            if (moveZ) _selected.object.position.z = targetPos.z;

            return;

        }

        var intersects = ray.intersectObjects(_objects);

        if (intersects.length > 0) {

            _domElement.style.cursor = 'pointer';

        } else {

            _domElement.style.cursor = 'auto';

        }

    }

    function onDocumentMouseDown(event) {

        event.preventDefault();

        _mouse.x = (event.clientX / _domElement.width) * 2 - 1;
        _mouse.y = -(event.clientY / _domElement.height) * 2 + 1;

        var ray = _projector.pickingRay(_mouse, _camera);
        var intersects = ray.intersectObjects(_objects);

        var hit = intersects.length > 0;

        if (hit) {
            _selected = intersects[0];
            
            _offset.copy(_selected.point).subSelf(_selected.object.position);

            _domElement.style.cursor = 'move';

            _selected.hit = hit;
            notify('mousedown', _selected);
        } else {
            notify('mousedown', { hit: hit });
        }

    }

    function onDocumentMouseUp(event) {

        event.preventDefault();

        var dragged = false;
        if (_selected) {
            dragged = true;
            notify('dragged', _selected);

            _selected = null;
        }

        _domElement.style.cursor = 'auto';

        notify('mouseup', {
            dragged: dragged
        });

    }

}