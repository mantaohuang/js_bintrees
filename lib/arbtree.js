
var TreeBase = require('./treebase');

function Node(data, aug_processer) {
    this.data = data;
    this.left = null;
    this.right = null;
    this.red = true;
    this.parent = null;
    this.aug_processer = aug_processer;
    this.aug_data = this.aug_processer(this);
}

Node.prototype.get_child = function(dir) {
    return dir ? this.right : this.left;
};

Node.prototype.set_child = function(dir, val) {
    if(dir) {
        
        if(this.right!=null && this.right.parent==this){
            this.right.parent = null;
        }
        
        this.right = val;
        this.aug_data = this.aug_processer(this);
    }
    else {
        
        if(this.left!=null && this.left.parent==this){
            this.left.parent = null;
        }
        
        this.left = val;
        this.aug_data = this.aug_processer(this);
    }
    if(val!=null){
        val.parent = this;
    }
};

Node.prototype.walk_up_aug = function(){
    var q = this;
    while(q!=null){
        q.aug_data = q.aug_processer(q);
        q = q.parent
    }    
}


function ARBTree(comparator,aug_processer) {
    this._root = null;
    this._comparator = comparator;
    this._aug_processer = aug_processer;
    this.size = 0;
}

ARBTree.prototype = new TreeBase();
// return the node that compares equally with data, returns null if not found
ARBTree.prototype.find_node = function(data) {
    var res = this._root;

    while(res !== null) {
        var c = this._comparator(data, res.data);
        if(c === 0) {
            return res;
        }
        else {
            res = res.get_child(c > 0);
        }
    }

    return null;
};
// returns true if inserted, false if duplicate
ARBTree.prototype.insert = function(data) {
    var ret = false;

    if(this._root === null) {
        // empty tree
        this._root = new Node(data, this._aug_processer);
        ret = true;
        this.size++;
    }
    else {
        var head = new Node(undefined, this._aug_processer); // fake tree root

        var dir = 0;
        var last = 0;

        // setup
        var gp = null; // grandparent
        var ggp = head; // grand-grand-parent
        var p = null; // parent
        var node = this._root;
        ggp.right = this._root;

        // search down
        while(true) {
            if(node === null) {
                // insert new node at the bottom
                node = new Node(data, this._aug_processer);
                p.set_child(dir, node);
                ret = true;
                this.size++;
                // need to update the values down up
                node.walk_up_aug();
            }
            else if(is_red(node.left) && is_red(node.right)) {
                // color flip
                node.red = true;
                node.left.red = false;
                node.right.red = false;
            }

            // fix red violation
            if(is_red(node) && is_red(p)) {
                var dir2 = ggp.right === gp;

                if(node === p.get_child(last)) {
                    ggp.set_child(dir2, single_rotate(gp, !last));
                }
                else {
                    ggp.set_child(dir2, double_rotate(gp, !last));
                }
            }

            var cmp = this._comparator(node.data, data);

            // stop if found
            if(cmp === 0) {
                break;
            }

            last = dir;
            dir = cmp < 0;

            // update helpers
            if(gp !== null) {
                ggp = gp;
            }
            gp = p;
            p = node;
            node = node.get_child(dir);
        }

        // update root
        this._root = head.right;
    }

    // make root black
    this._root.red = false;
    this._root.parent = null;
    return ret;
};

// returns true if removed, false if not found
ARBTree.prototype.remove = function(data) {
    if(this._root === null) {
        return false;
    }

    var head = new Node(undefined, this._aug_processer); // fake tree root
    var node = head;
    node.right = this._root;
    var p = null; // parent
    var gp = null; // grand parent
    var found = null; // found item
    var dir = 1;

    while(node.get_child(dir) !== null) {
        var last = dir;

        // update helpers
        gp = p;
        p = node;
        node = node.get_child(dir);
        
        var cmp = this._comparator(data, node.data);

        dir = cmp > 0;

        // save found node
        if(cmp === 0) {
            found = node;
        }

        // push the red node down
        if(!is_red(node) && !is_red(node.get_child(dir))) {
            if(is_red(node.get_child(!dir))) {
                var sr = single_rotate(node, dir);
                p.set_child(last, sr);
                p = sr;
            }
            else if(!is_red(node.get_child(!dir))) {
                var sibling = p.get_child(!last);
                if(sibling !== null) {
                    if(!is_red(sibling.get_child(!last)) && !is_red(sibling.get_child(last))) {
                        // color flip
                        p.red = false;
                        sibling.red = true;
                        node.red = true;
                    }
                    else {
                        var dir2 = gp.right === p;

                        if(is_red(sibling.get_child(last))) {
                            gp.set_child(dir2, double_rotate(p, last));
                        }
                        else if(is_red(sibling.get_child(!last))) {
                            gp.set_child(dir2, single_rotate(p, last));
                        }

                        // ensure correct coloring
                        var gpc = gp.get_child(dir2);
                        gpc.red = true;
                        node.red = true;
                        gpc.left.red = false;
                        gpc.right.red = false;
                    }
                }
            }
        }
    }

    // replace and remove if found
    if(found !== null) {
        found.data = node.data;
        found.aug_data = node.aug_data;
        p.set_child(p.right === node, node.get_child(node.left === null));
        node.parent = null;
        this.size--;
        //need to go up
        p.walk_up_aug();
    }

    // update root and make it black
    this._root = head.right;
    if(this._root !== null) {
        this._root.red = false;
        this._root.parent = null;
    }

    return found !== null;
};

function is_red(node) {
    return node !== null && node.red;
}

function single_rotate(root, dir) {
    var save = root.get_child(!dir);

    root.set_child(!dir, save.get_child(dir));
    save.set_child(dir, root);

    root.red = true;
    save.red = false;

    return save;
}

function double_rotate(root, dir) {
    root.set_child(!dir, single_rotate(root.get_child(!dir), !dir));
    return single_rotate(root, dir);
}

module.exports = ARBTree;
