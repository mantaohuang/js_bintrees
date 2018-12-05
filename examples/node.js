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
function get_sum(node){
    if(node==null){
        return 0;
    }
    return node.aug_data.sum;
}
function find_amount(tree,amount){
    var node = tree._root;
    var remaining = amount;
    var location = null;
    while(node!=null&&remaining>0){
        //console.log("processing ",node.data);
        left_amount = get_sum(node.left);
        self_amount = node.data;
        if(left_amount>remaining){
            //Too much on the left side, descent to the left child
            //console.log("go left, remaining", remaining);
            node = node.left;
            continue;
        }
        if(left_amount<=remaining && left_amount + self_amount>=remaining){
            //the node can satisfy
            location = node;
            break;
        }
        if(left_amount + self_amount < remaining){
            //need the left and the node, and more. decent to the right child
            remaining -= left_amount + self_amount;
            //console.log("go right, remaining", remaining);
            node = node.right;
        }
    }
    return location;
}


// create a new tree, pass in the compare function
var tree = new Tree(function(a, b) { return a - b; },aug_processer);

// do some inserts

tree.insert(6);
tree.insert(7);
tree.insert(8);
tree.insert(4);
tree.insert(5);
tree.insert(9);
tree.insert(10);
tree.insert(1);
tree.insert(2);
tree.insert(3);

tree.remove(10);
// get smallest item
console.log(tree.min());
for(i=0;i<56;i++){
    var node = find_amount(tree,i);
    if(node!=null){
        console.log(i,node.data);
    }else{
        console.log(i,"cannot find");
    }
}