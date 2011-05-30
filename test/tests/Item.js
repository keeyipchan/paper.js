module('Item');

test('copyTo(project)', function() {
	var project = paper.project;
	var path = new Path();
	var secondDoc = new Project();
	var copy = path.copyTo(secondDoc);
	equals(function() {
		return secondDoc.activeLayer.children.indexOf(copy) != -1;
	}, true);
	equals(function() {
		return project.activeLayer.children.indexOf(copy) == -1;
	}, true);
	equals(function() {
		return copy != path;
	}, true);
});

test('copyTo(layer)', function() {
	var project = paper.project;
	var path = new Path();

	var layer = new Layer();
	var copy = path.copyTo(layer);
	equals(function() {
		return layer.children.indexOf(copy) != -1;
	}, true);
	equals(function() {
		return project.layers[0].children.indexOf(copy) == -1;
	}, true);
});

test('clone()', function() {
	var project = paper.project;
	var path = new Path();
	var copy = path.clone();
	equals(function() {
		return project.activeLayer.children.length;
	}, 2);
	equals(function() {
		return path != copy;
	}, true);
});

test('appendTop(item)', function() {
	var project = paper.project;
	var path = new Path();
	project.activeLayer.appendTop(path);
	equals(function() {
		return project.activeLayer.children.length;
	},  1);
});

test('item.parent / item.isChild / item.isParent', function() {
	var project = paper.project;
	var secondDoc = new Project();
	var path = new Path();
	project.activeLayer.appendTop(path);
	equals(function() {
		return project.activeLayer.children.indexOf(path) != -1;
	}, true);
	secondDoc.activeLayer.appendTop(path);
	equals(function() {
		return project.activeLayer.isChild(path);
	}, false);
	equals(function() {
		return path.isParent(project.activeLayer);
	}, false);
	equals(function() {
		return secondDoc.activeLayer.isChild(path);
	}, true);
	equals(function() {
		return path.isParent(secondDoc.activeLayer);
	}, true);
	equals(function() {
		return project.activeLayer.children.indexOf(path) == -1;
	}, true);
	equals(function() {
		return secondDoc.activeLayer.children.indexOf(path) == 0;
	}, true);
});

test('item.lastChild / item.firstChild', function() {
	var project = paper.project;
	var path = new Path();
	var secondPath = new Path();
	equals(function() {
		return project.activeLayer.firstChild == path;
	}, true);
	equals(function() {
		return project.activeLayer.lastChild == secondPath;
	}, true);
});

test('appendBottom(item)', function() {
	var project = paper.project;
	var path = new Path();
	var secondPath = new Path();
	project.activeLayer.appendBottom(secondPath);
	equals(function() {
		return secondPath.index < path.index;
	}, true);
});

test('moveAbove(item)', function() {
	var project = paper.project;
	var path = new Path();
	var secondPath = new Path();
	path.moveAbove(secondPath);
	equals(function() {
		return project.activeLayer.lastChild == path;
	}, true);
});

test('moveBelow(item)', function() {
	var project = paper.project;
	var firstPath = new Path();
	var secondPath = new Path();
	equals(function() {
		return secondPath.index > firstPath.index;
	}, true);
	secondPath.moveBelow(firstPath);
	equals(function() {
		return secondPath.index < firstPath.index;
	}, true);
});

test('isDescendant(item) / isAncestor(item)', function() {
	var project = paper.project;
	var path = new Path();
	equals(function() {
		return path.isDescendant(project.activeLayer);
	}, true);
	equals(function() {
		return project.activeLayer.isDescendant(path);
	}, false);
	equals(function() {
		return path.isAncestor(project.activeLayer);
	}, false);
	equals(function() {
		return project.activeLayer.isAncestor(path);
	}, true);
	
	// an item can't be its own descendant:
	equals(function() {
		return project.activeLayer.isDescendant(project.activeLayer);
	}, false);
	// an item can't be its own ancestor:
	equals(function() {
		return project.activeLayer.isAncestor(project.activeLayer);
	}, false);
});

test('isGroupedWith', function() {
	var project = paper.project;
	var path = new Path();
	var secondPath = new Path();
	var group = new Group([path]);
	var secondGroup = new Group([secondPath]);
	
	equals(function() {
		return path.isGroupedWith(secondPath);
	}, false);
	secondGroup.appendTop(path);
	equals(function() {
		return path.isGroupedWith(secondPath);
	}, true);
	equals(function() {
		return path.isGroupedWith(group);
	}, false);
	equals(function() {
		return path.isDescendant(secondGroup);
	}, true);
	equals(function() {
		return secondGroup.isDescendant(path);
	}, false);
	equals(function() {
		return secondGroup.isDescendant(secondGroup);
	}, false);
	equals(function() {
		return path.isGroupedWith(secondGroup);
	}, false);
	paper.project.activeLayer.appendTop(path);
	equals(function() {
		return path.isGroupedWith(secondPath);
	}, false);
	paper.project.activeLayer.appendTop(secondPath);
	equals(function() {
		return path.isGroupedWith(secondPath);
	}, false);
});

test('getPreviousSibling() / getNextSibling()', function() {
	var firstPath = new Path();
	var secondPath = new Path();
	equals(function() {
		return firstPath.nextSibling == secondPath;
	}, true);
	equals(function() {
		return secondPath.previousSibling == firstPath;
	}, true);
	equals(function() {
		return secondPath.nextSibling == null;
	}, true);
});

test('reverseChildren()', function() {
	var project = paper.project;
	var path = new Path();
	var secondPath = new Path();
	var thirdPath = new Path();
	equals(function() {
		return project.activeLayer.firstChild == path;
	}, true);
	project.activeLayer.reverseChildren();
	equals(function() {
		return project.activeLayer.firstChild == path;
	}, false);
	equals(function() {
		return project.activeLayer.firstChild == thirdPath;
	}, true);
	equals(function() {
		return project.activeLayer.lastChild == path;
	}, true);
});

test('Check item#project when moving items across projects', function() {
	var project = paper.project;
	var doc1 = new Project();
	var path = new Path();
	var group = new Group();
	group.appendTop(new Path());
	
	equals(function() {
		return path.project == doc1;
	}, true);
	var doc2 = new Project();
	doc2.activeLayer.appendTop(path);
	equals(function() {
		return path.project == doc2;
	}, true);
	
	doc2.activeLayer.appendTop(group);
	equals(function() {
		return group.children[0].project == doc2;
	}, true);
});

test('group.selected', function() {
	var path = new Path([0, 0]);
	var path2 = new Path([0, 0]);
	var group = new Group([path, path2]);
	path.selected = true;
	equals(function() {
		return group.selected;
	}, true);
	
	path.selected = false;
	equals(function() {
		return group.selected;
	}, false);
	
	group.selected = true;
	equals(function() {
		return path.selected;
	}, true);
	equals(function() {
		return path2.selected;
	}, true);
	
	group.selected = false;
	equals(function() {
		return path.selected;
	}, false);
	equals(function() {
		return path2.selected;
	}, false);
});

test('Check parent children object for named item', function() {
	var path = new Path();
	path.name = 'test';
	equals(function() {
		return paper.project.activeLayer.children['test'] == path;
	}, true);
	
	var path2 = new Path();
	path2.name = 'test';
	
	equals(function() {
		return paper.project.activeLayer.children['test'] == path2;
	}, true);
	
	path2.remove();
	
	equals(function() {
		return paper.project.activeLayer.children['test'] == path;
	}, true);
	
	path.remove();
	
	equals(function() {
		return !paper.project.activeLayer.children['test'];
	}, true);
});

test('Named child access', function() {
	var path = new Path();
	path.name = 'test';

	var path2 = new Path();
	path2.name = 'test';
	
	path.remove();
	
	equals(function() {
		return paper.project.activeLayer.children['test'] == path2;
	}, true);
});

test('Named child access 2', function() {
	var path = new Path();
	path.name = 'test';

	var path2 = new Path();
	path2.name = 'test';
	
	path.remove();
	
	equals(function() {
		return paper.project.activeLayer.children['test'] == path2;
	}, true);
	
	equals(function() {
		return paper.project.activeLayer._namedChildren['test'].length == 1;
	}, true);
	
	path2.remove();

	equals(function() {
		return !paper.project.activeLayer._namedChildren['test'];
	}, true);
	
	equals(function() {
		return paper.project.activeLayer.children['test'] === undefined;
	}, true);
});

test('Named child access 2', function() {
	var path = new Path();
	path.name = 'test';

	var path2 = new Path();
	path2.name = 'test';
	
	var group = new Group();
	
	group.appendTop(path2);
	
	equals(function() {
		return paper.project.activeLayer.children['test'] == path;
	}, true);
	
	equals(function() {
		return paper.project.activeLayer._namedChildren['test'].length == 1;
	}, true);

	equals(function() {
		return group.children['test'] == path2;
	}, true);
	
	equals(function() {
		return group._namedChildren['test'].length == 1;
	}, true);
	
	paper.project.activeLayer.appendTop(path2);

	equals(function() {
		return group._namedChildren['test'] === undefined;
	}, true);
	
	equals(function() {
		return paper.project.activeLayer._namedChildren['test'].length == 2;
	}, true);
});

test('Setting name of child back to null', function() {
	var path = new Path();
	path.name = 'test';

	var path2 = new Path();
	path2.name = 'test';

	equals(function() {
		return paper.project.activeLayer.children['test'] == path2;
	}, true);

	path2.name = null;

	equals(function() {
		return paper.project.activeLayer.children['test'] == path;
	}, true);
	
	path.name = null;
	
	equals(function() {
		return paper.project.activeLayer.children['test'] === undefined;
	}, true);
});

test('Renaming item', function() {
	var path = new Path();
	path.name = 'test';
	
	path.name = 'test2';
	
	equals(function() {
		return paper.project.activeLayer.children['test'] === undefined;
	}, true);
	
	equals(function() {
		return paper.project.activeLayer.children['test2'] == path;
	}, true);
});

test('Changing item#position.x', function() {
	var path = new Path.Circle(new Point(50, 50), 50);
	path.position.x += 5;
	equals(path.position.toString(), '{ x: 55, y: 50 }', 'path.position.x += 5');
});