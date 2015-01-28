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
    var _raycaster = new THREE.Raycaster();

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
    var _listeners = {

    };

    this.on = function(event, handler) {
        if (!_listeners[event]) _listeners[event] = [];

        _listeners[event].push(handler);
        return me;
    };

    this.off = function(event, handler) {
        var l = _listeners[event];
        if (!l) return me;

        if (l.indexOf(handler)>-1) {
            l.splice(handler, 1);
        }

        return me;

    };

    var notify = function(event, data, member) {
        var l = _listeners[event];
        if (!l) return;

        if (!member) {
            for (var i=0;i<l.length;i++) {
                l[i](data);
            }
        }
    };

    this.setObjects = function(objects) {
        if (objects instanceof THREE.Scene) {
            _objects = objects.children;
        } else {
            _objects = objects;
        }
    };


    // Drag constrains (eg. move along x-axis only, y only, x and y, or default xyz)
    var moveX, moveY, moveZ;
    moveX = moveY = moveZ = true;

    this.constrains = function(xyz) {

        if (xyz === undefined) 
            xyz = 'xyz'; 

        moveX = moveY = moveZ = false;

        if (xyz.indexOf('x') > -1) {
            moveX = true;
        } 

        if (xyz.indexOf('y') > -1) {
            moveY = true;
        } 

        if (xyz.indexOf('z') > -1) {
            moveZ = true;
        } 

        return this;

    };


    function onDocumentMouseMove(event) {

        if (!me.enabled) return;

        event.preventDefault();

        _mouse.x = (event.clientX / _domElement.width) * 2 - 1;
        _mouse.y = -(event.clientY / _domElement.height) * 2 + 1;

        _raycaster.setFromCamera( _mouse, _camera );
        var intersects = _raycaster.intersectObjects(_objects);
        var ray = _raycaster.ray;


        if (me.enabled && _selected) {
            var targetPos = ray.direction.clone().multiplyScalar(_selected.distance).add(ray.origin);
            targetPos.sub(_offset);
            // _selected.object.position.copy(targetPos.sub(_offset));

            // Reverse Matrix?
            // Hmm, quick hack - should do some kind of planar projection..
            if (moveX) _selected.object.position.x = targetPos.x;
            if (moveY) _selected.object.position.y = targetPos.y;
            if (moveZ) _selected.object.position.z = targetPos.z;
            notify('drag', _selected);
            return;

        }

        var intersects = _raycaster.intersectObjects(_objects);

        if (intersects.length > 0) {

            _domElement.style.cursor = 'pointer';

        } else {

            _domElement.style.cursor = 'auto';

        }

    }

    function onDocumentMouseDown(event) {

        if (!me.enabled) return;

        event.preventDefault();

        _mouse.x = (event.clientX / _domElement.width) * 2 - 1;
        _mouse.y = -(event.clientY / _domElement.height) * 2 + 1;

        _raycaster.setFromCamera( _mouse, _camera );
        var intersects = _raycaster.intersectObjects(_objects);

        var hit = intersects.length > 0;

        if (hit) {
            _selected = intersects[0];
            
            _offset.copy(_selected.point).sub(_selected.object.position);

            _domElement.style.cursor = 'move';

            _selected.hit = hit;

            notify('dragstart', _selected);
            notify('mousedown', _selected);
        } else {
            notify('mousedown', { hit: hit });
        }

    }

    function onDocumentMouseUp(event) {

        if (!me.enabled) return;

        event.preventDefault();

        var dragged = false;
        if (_selected) {
            dragged = true;
            notify('dragend', _selected);

            _selected = null;
        }

        _domElement.style.cursor = 'auto';

        notify('mouseup', {
            dragged: dragged
        });

    }

}