pragma solidity ^0.5.0;

contract Climbing {
    address private _manager;
    
    struct climbing{
        uint8 course;
        uint8 score;
        uint256 start;
        uint256 end;
        uint256 idx;
    }
    
    constructor() public {
        _manager = msg.sender;
    }

    mapping (address=>climbing[]) record;
    
    function start(address user, uint8 num) public {
        require(msg.sender == _manager, 'only manager');
        record[user].push(climbing(num, 0, now, 0,0));
        
    } 
    
    function end(address user, uint8 idx, uint8 score) public{
        require(msg.sender == _manager, 'only manager');
        require(record[user][idx].start != 0, 'not started');
        require(record[user][idx].end == 0, 'end score');
        
        record[user][idx].end = now;
        record[user][idx].score = score;
        record[user][idx].idx = record[user].length;
    }
    
    function lookUp(address _user) public view returns(uint8[] memory,uint8[] memory,uint256[] memory,uint256[] memory) {

        uint256 idx =record[_user].length;
        uint256[] memory _start=new uint256[](5);
        uint256[] memory _end=new uint256[](5);
        uint8[] memory _course=new uint8[](5);
        uint8[] memory _score=new uint8[](5);
        if(idx<5){
            for(uint256 i=0;i<idx; i++) {
                _course[i]=record[_user][idx-1-i].course;
                _score[i]=record[_user][idx-1-i].score;
                _start[i]=record[_user][idx-1-i].start;
                _end[i]=record[_user][idx-1-i].end;
            }
        } else{
            for(uint256 i=0;i<5; i++) {
                _course[i]=record[_user][idx-1-i].course;
                _score[i]=record[_user][idx-1-i].score;
                _start[i]=record[_user][idx-1-i].start;
                _end[i]=record[_user][idx-1-i].end;
            }
        }
        return (_course,_score,_start,_end);
    }
    
    
    
    function getRecord(address user, uint8 idx) public view returns(uint8, uint256, uint8, uint256){
        climbing memory data = record[user][idx];
        return (data.course, data.start, data.score, data.end);
    }
    
    function getLength(address user) public view returns(uint) {
        return record[user].length;
    }
}