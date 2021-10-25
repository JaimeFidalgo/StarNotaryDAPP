const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();// instance as reference of the deployed contract;
    let user0 = accounts[0]//defining account address;
    let starId = 7;//defining id;
    await instance.createStar('udacity star test', starId, {from: user0});//create star(name, id, from address);

    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided

    assert.equal(await instance.tokenIdToStarInfo.call(starId), 'udacity star test');//comparing star name;
    assert.equal(await instance.name(), "Star Token");//comparing token name;
    assert.equal(await instance.symbol(), "STKN");//comparing token symbol;
});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    let instance = await StarNotary.deployed();// instance as reference of the deployed contract;
    let user0 = accounts[0];//defining account address 0;
    let user1 = accounts[1];//defining account address 1;
    let starId0 = 8;//defining id 0;
    let starId1 = 10;//defining id 1;
    await instance.createStar('Star0',starId0,{from:user0});//create star0(name,id,from address);
    await instance.createStar('star1',starId1,{from:user1});//create star1(name,id,from address);

    // 2. Call the exchangeStars functions implemented in the Smart Contract

    await instance.exchangeStars(starId0, starId1);//Exchanging stars;

    // 3. Verify that the owners changed

    assert.equal(await instance.ownerOf(starId0), user1);//comparing owner of starId0 with  user1;
    assert.equal(await instance.ownerOf(starId1), user0);//comparing owner of starId1 with  user0;
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();// instance as reference of the deployed contract;
    let user0 = accounts[0];//defining account 0;
    let user1 = accounts[1];//defining account 1;
    let starId = 20;//Defining star Id;
    await instance.createStar('udacity star test 2', starId,{from:user0}); // Create star(name,id,from address);
    assert.equal(await instance.ownerOf(starId),user0); //Cheking ownership of star befor transfering;

     // 2. use the transferStar function implemented in the Smart Contract

    await instance.transferStar(user1, starId, {from: accounts[0]});//Transfering star ownership from user0 to user 1;

    // 3. Verify the star owner changed.

    assert.notEqual(await instance.ownerOf(starId),user0);//Checking user0 is no longer owner of star;
    assert.equal(await instance.ownerOf(starId),user1);//Checking user1 is owner of the star;
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId

    let instance = await StarNotary.deployed();// instance as reference of the deployed contract;
    let user = accounts[0];//defining account;
    let starId = 25; //Defining star id;
    let starName = 'udacity test star 3'
    await instance.createStar(starName, starId, {from:user});// Create star(name,id,from address);

    // 2. Call your method lookUptokenIdToStarInfo

    let name = await instance.lookUptokenIdToStarInfo(starId);//looking up for star by id within the variable name;
    // 3. Verify if you Star name is the same

    assert.equal(name, starName);//Comparing name to starName
});