/*
 * Running this will allow you to drag three.js around the screen.
 * 
 * feature requests:
 *  1. add rotation?
 *  2. axis lock
 *  3. inertia dragging
 *  4. activate/deactivate? prevent propagation?
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

    function onDocumentMouseMove(event) {

        event.preventDefault();

        _mouse.x = (event.clientX / _domElement.width) * 2 - 1;
        _mouse.y = -(event.clientY / _domElement.height) * 2 + 1;

        var ray = _projector.pickingRay(_mouse, _camera);

        if (_selected) {
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

        if (intersects.length > 0) {
            _selected = intersects[0];

            _offset.copy(_selected.point).subSelf(_selected.object.position);

            _domElement.style.cursor = 'move';

        }

        if (me.onHit) me.onHit(intersects.length > 0);



    }

    function onDocumentMouseUp(event) {

        event.preventDefault();

        if (_selected) {

            if (me.onDragged) me.onDragged();

            _selected = null;
        }

        _domElement.style.cursor = 'auto';

    }


}