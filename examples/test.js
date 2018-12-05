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
function find_amount_arr(arr,amount){
    var location = 0
    var remaining = amount;
    while(location<arr.length&&remaining>0){
        //console.log("processing ",node.data);
        self_amount = arr[location];
        if(self_amount>=remaining){
            //the item can satisfy
            break;
        }else{
            remaining -= self_amount;
            location +=1;
        }
    }
    return location;
}


function generate_unique_numbers(n){
    var arr = []
    var arr_sum = 0;
    while(arr.length < n){
        var r = Math.floor(Math.random()*n*10) + 1;
        if(arr.indexOf(r) === -1){
            arr.push(r);
            arr_sum+=r;
        }    
    }
    return {arr, arr_sum};
}



// create a new tree, pass in the compare function
var tree = new Tree(function(a, b) { return a - b; },aug_processer);

// generate unique numbers
const n = 1000;

var {arr, arr_sum} = generate_unique_numbers(n);

console.log("arr generation complete, insert to tree");
arr.forEach(element=>{
    tree.insert(element);
});

//check sum calculation
console.log("sum:",arr_sum,"tree sum",tree._root.aug_data.sum);

console.log("starting to remove all elements, except the first one");
arr.slice(1).forEach(element=>{
    tree.remove(element);
});
console.log("first item:",arr[0],"tree sum:",tree._root.aug_data.sum);
console.log("populate tree again");
arr.slice(1).forEach(element=>{
    tree.insert(element);
});

//check sum calculation
console.log("sum:",arr_sum,"tree sum",tree._root.aug_data.sum);

//test find_amount function
arr.sort((a, b) => a - b);
for(i=1;i<=arr_sum;i++){
    arr_location = find_amount_arr(arr,i);
    tree_item = find_amount(tree,i).data;
    if(tree_item==arr[arr_location] || tree_item==arr[arr_location+1]){
        //OK
    }else{
        console.log("err at ", i, arr[arr_location], tree_item)
    }
}

//test time
//test find_amount function
console.log("test time")
for(i=1;i<=arr_sum;i++){
    tree_item = find_amount(tree,i).data;
}

console.log("done")