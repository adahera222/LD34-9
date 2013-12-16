(function() {
	var Level = function() {}
	
	var p = Level.prototype = new createjs.Container();
	
	p.BOW_SPEED = 10;
	p.width;
	p.height;
	p.assetQueue;
	p.data;
	p.archerilles;
	p.currentPower;
	p.arrowContainer;
	p.isFollowingArrow = false;
	p.activeArrow;
	p.walls;
	p.targetContainer;
	p.targetHelpers;
	p.targets = [];
	p.numberOfTargets = 0;
	p.dtWalls = [];
	p.bouncers = [];
	
	p.Container_initialize = p.initialize;
	p.initialize = function(width, height, levelId, assetQueue, data) {
		this.Container_initialize();
		
		this.width = width;
		this.height = height;
		this.assetQueue = assetQueue;
		this.data = data;
		
		this.archerilles = new Archerilles(data.startX, data.startY, assetQueue.getResult("archerilles"), assetQueue.getResult("bow"));
		this.x = -1 * data.startX + width / 2;
		this.y = -1 * data.startY + height / 2;
		
		this.arrowContainer = new createjs.Container();
		
		this.walls = SvgXmlHelper.createWallsFromXml(assetQueue.getResult("level-" + levelId), assetQueue);
		
		this.targetContainer = new createjs.Container();
		for (var t = 0; t < data.targets.length; t++) {
			var target = new createjs.Bitmap(assetQueue.getResult("target"));
			target.regX = 20;
			target.regY = 20;
			target.x = data.targets[t].x;
			target.y = data.targets[t].y;
			
			this.targets.push(target);
			this.targetContainer.addChild(target);
			this.numberOfTargets++;
		}
		
		this.addChild(this.targetContainer);
		this.addChild(this.arrowContainer);
		this.addChild(this.walls);
		this.addChild(this.archerilles);
		
		this.addEventListener("tick", update);
	}
	
	p.rotateCCW = function() {
		this.archerilles.rotateBow(-1 * this.BOW_SPEED);
	}
	
	p.rotateCW = function() {
		this.archerilles.rotateBow(this.BOW_SPEED);
	}
	
	p.fireArrow = function() {
		if (!this.isFollowingArrow) {
			var bowAngle = this.archerilles.getBowRotation();
			var arrow = new Arrow(this.archerilles.x + (86 * 0.75) * Math.cos(MathHelper.degreesToRadians(bowAngle)),
				this.archerilles.y + (-86 * 0.75) * Math.sin(MathHelper.degreesToRadians(bowAngle)), bowAngle, assetQueue.getResult("arrow"));
			
			this.isFollowingArrow = true;
			this.activeArrow = arrow;
			this.arrowContainer.addChild(arrow);
		}
	}
	
	p.switchPower = function(id) {
		this.currentPower = id;
	
		switch(id) {
			case 0:
				this.archerilles.switchLegs(this.assetQueue.getResult("move-left"));
				break;
			case 1:
				this.archerilles.switchLegs(this.assetQueue.getResult("move-right"));
				break;
			case 2:
				this.archerilles.switchLegs(this.assetQueue.getResult("jump"));
				break;
			case 3:
				this.archerilles.switchLegs(this.assetQueue.getResult("power-shot"));
				break;
			case 4:
				this.archerilles.switchLegs(this.assetQueue.getResult("quiver"));
				break;
		}
	}
	
	p.hitWall = function(deltaX, deltaY) {
		return this.walls.hitTest(this.archerilles.x + deltaX, this.archerilles.y + deltaY);
	}
	
	p.usePower = function() {
		switch(this.currentPower) {
			case 0:
				this.archerilles.isMovingLeft = true;
				break;
			case 1:
				this.archerilles.isMovingRight = true;
				break;
		}
	}
	
	p.stopPower = function() {
		switch(this.currentPower) {
			case 0:
				this.archerilles.isMovingLeft = false;
				break;
			case 1:
				this.archerilles.isMovingRight = false;
				break;
		}
	}
	
	p.getBeginningOverlay = function(assetQueue) {
		return assetQueue.getResult("overlay-normal");
	}
	
	p.deleteActiveArrow = function() {
		this.isFollowingArrow = false;
		this.arrowContainer.removeAllChildren();
		this.activeArrow = null;
	}
	
	function update(event) {
		var level = event.currentTarget;
	
		if (level.isFollowingArrow) {
			level.x = -1 * level.activeArrow.x + level.width / 2;
			level.y = -1 * level.activeArrow.y + level.height / 2;
			
			if (level.walls.metal.hitTest(level.activeArrow.x, level.activeArrow.y)) {
				if (level.walls.metal.hitTest(level.activeArrow.x, level.activeArrow.y - 52)) {
					level.activeArrow.deltaX *= -1;
				}
				else {
					level.activeArrow.deltaY *= -1;
				}
			}
			else if (level.walls.floor.hitTest(level.activeArrow.x, level.activeArrow.y)) {
				level.deleteActiveArrow();
			}
		}
		else {
			level.x = -1 * level.archerilles.x + level.width / 2;
			level.y = -1 * level.archerilles.y + level.height / 2;
		}
	}
	
	window.Level = Level;
}())