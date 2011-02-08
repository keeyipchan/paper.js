ToolHandler = Base.extend({
	/**
	 * Initializes the tool's settings, so a new tool can be assigned to it
	 */
	initialize: function(handlers) {
		this.firstMove = true;
		this.count = 0;
		this.downCount = 0;
		for(var i in handlers) {
			this[i] = handlers[i];
		}
	},
	
	
	/**
	 * The minimum distance the mouse has to drag before firing the onMouseDrag
	 * event, since the last onMouseDrag event.
	 * 
	 * Sample code:
	 * <code>
	 * // Fire the onMouseDrag event after the user has dragged
	 * // more then 5 points from the last onMouseDrag event:
	 * tool.minDistance = 5;
	 * </code>
	 */
	getMinDistance: function() {
		return this.minDistance;
	},

	setMinDistance: function(minDistance) {
		this.minDistance = minDistance;
		if (this.minDistance != null && this.maxDistance != null
				&& this.minDistance > this.maxDistance)
			this.maxDistance = this.minDistance;
	},

	getMaxDistance: function() {
		return this.maxDistance;
	},

	setMaxDistance: function(maxDistance) {
		this.maxDistance = maxDistance;
		if (this.minDistance != null && this.maxDistance != null
				&& this.maxDistance < this.minDistance)
			this.minDistance = maxDistance;
	},

	getFixedDistance: function() {
		if (this.minDistance != null && this.minDistance.equals(this.maxDistance))
			return this.minDistance;
		return null;
	},

	setFixedDistance: function(distance) {
		this.minDistance = distance;
		this.maxDistance = distance;
	},

	updateEvent: function(type, pt, minDistance, maxDistance, start,
			needsChange, matchMaxDistance) {
		if (!start) {
			if (minDistance != null || maxDistance != null) {
				var minDist = minDistance != null ? minDistance : 0;
				var vector = pt.subtract(this.point);
				var distance = vector.getLength();
				if (distance < minDist)
					return false;
				// Produce a new point on the way to pt if pt is further away
				// than maxDistance
				var maxDist = maxDistance != null ? maxDistance : 0;
				if (maxDist != 0) {
					if (distance > maxDist)
						pt = this.point.add(vector.normalize(maxDist));
					else if (matchMaxDistance)
						return false;
				}
			}
			if (needsChange && pt.equals(this.point))
				return false;
		}
		this.lastPoint = this.point;
		this.point = pt;
		switch (type) {
		case 'MOUSE_DOWN':
			this.lastPoint = this.downPoint;
			this.downPoint = this.point;
			this.downCount++;
			break;
		case 'MOUSE_UP':
			// Mouse up events return the down point for last point,
			// so delta is spanning over the whole drag.
			this.lastPoint = this.downPoint;
			break;
		}
		if (start) {
			this.count = 0;
		} else {
			this.count++;
		}
		return true;
	},

	onHandleEvent: function(type, pt, modifiers) {
		try {
			switch (type) {
			case 'MOUSE_DOWN':
				this.updateEvent(type, pt, null, null, true, false, false);
				if(this.onMouseDown)
					this.onMouseDown(new ToolEvent(this, type, modifiers));
				break;
			case 'MOUSE_DRAG':
				// In order for idleInterval drag events to work, we need to
				// not check the first call for a change of position. 
				// Subsequent calls required by min/maxDistance functionality
				// will require it, otherwise this might loop endlessly.
				this.needsChange = false;
				// If the mouse is moving faster than maxDistance, do not
				// produce events for what is left after the first event is
				// generated in case it is shorter than maxDistance, as this
				// would produce weird results. matchMaxDistance controls this.
				this.matchMaxDistance = false;
				while (this.updateEvent(type, pt, this.minDistance,
					this.maxDistance, false, this.needsChange, this.matchMaxDistance)) {
					try {
						if(this.onMouseDrag)
							this.onMouseDrag(new ToolEvent(this, type, modifiers));
					} catch (e) {
						// ScriptographerEngine.reportError(e);
					}
					this.needsChange = true;
					this.matchMaxDistance = true;
				}
				break;
			case 'MOUSE_UP':
				// If the last mouse drag happened in a different place, call
				// mouse drag first, then mouse up.
				if ((this.point.x != pt.x || this.point.y != pt.y) && this.updateEvent(
						'MOUSE_DRAG', pt, this.minDistance, this.maxDistance, false, false, false)) {
					try {
						if(this.onMouseDrag)
							this.onMouseDrag(new ToolEvent(this, type, modifiers));
					} catch (e) {
						// ScriptographerEngine.reportError(e);
					}
				}
				this.updateEvent(type, pt, null, this.maxDistance, false,
						false, false);
				try {
					this.onMouseUp(new ToolEvent(this, type, modifiers));
				} catch (e) {
					// ScriptographerEngine.reportError(e);
				}
				// Start with new values for TRACK_CURSOR
				this.updateEvent(type, pt, null, null, true, false, false);
				this.firstMove = true;
				break;
			case 'MOUSE_MOVE':
				while (this.updateEvent(type, pt, this.minDistance,
						this.maxDistance, this.firstMove, true, false)) {
					try {
						if(this.onMouseMove)
							this.onMouseMove(new ToolEvent(this, type, modifiers));
					} catch (e) {
						// ScriptographerEngine.reportError(e);
					}
					this.firstMove = false;
				}
				break;
			}
		} catch (e) {
			//ScriptographerEngine.reportError(e);
		}
	}
});