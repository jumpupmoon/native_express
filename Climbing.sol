pragma solidity ^0.5.0;

contract Climbing {
    address private _manager;
    
    struct climbing{
        uint8 course;
        uint8 score;
        uint256 start;
        uint256 end;
    }
    
    constructor() public {
        _manager = msg.sender;
    }

    mapping (address=>climbing[]) record;
    
    function start(address user, uint8 num) public returns(uint256) {
        require(msg.sender == _manager, 'only manager');
        record[user].push(climbing(num, 0, now, 0));
        return record[user].length - 1;
    } 
    
    function end(address user, uint8 idx, uint8 score) public{
        require(msg.sender == _manager, 'only manager');
        require(record[user][idx].start != 0, 'not started');
        require(record[user][idx].end == 0, 'end score');
        
        record[user][idx].end = now;
        record[user][idx].score = score;
    }
    
    function getRecord(address user, uint8 idx) public view returns(uint8, uint256, uint8, uint256){
        climbing memory data = record[user][idx];
        return (data.course, data.start, data.score, data.end);
    }
    
    function getLength(address user) public view returns(uint) {
        return record[user].length;
    }
}