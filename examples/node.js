var Tree = require('..').RBTree;

function aug_processer(node){
    var sum = 0;
    if(node.left!=null){
        sum += node.left.aug_data.sum;
    }
    if(node.right!=null){
        sum += node.right.aug_data.sum;
    }
    if(node.data!=undefined && node.data!=null){
        sum += node.data;
    }
    return {sum:sum}
}

// create a new tree, pass in the compare function
var tree = new Tree(function(a, b) { return a - b; },aug_processer);

// do some inserts

tree.insert(6);
tree.insert(7);
tree.insert(8);
tree.insert(9);
tree.insert(10);
tree.insert(1);
tree.insert(2);
tree.insert(3);
tree.insert(4);
tree.insert(5);

tree.remove(33);
// get smallest item
console.log(tree.min());
console.log(tree._root)